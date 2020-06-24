import { tsquery } from "@phenomnomnominal/tsquery";
import { FileSystem } from "@rushstack/node-core-library";
import { from } from "rxjs";
import { map, filter } from "rxjs/operators";
import { File } from "../File";

import path from "path";
import ts from "typescript";

export const resolveTypescriptSourceFile = (
  filePath: string
): string | null => {
  if (
    FileSystem.exists(filePath) &&
    !FileSystem.getLinkStatistics(filePath).isDirectory()
  ) {
    return FileSystem.getRealPath(filePath);
  }

  // if the file path is a directory, we need to check for an index.{ts,tsx} file
  let p =
    FileSystem.exists(filePath) &&
    FileSystem.getLinkStatistics(filePath).isDirectory()
      ? path.join(filePath, "index")
      : filePath;

  // if the file does not exist, we try our supported file extensions.
  const extension = [".ts", ".tsx"].find(
    (e) =>
      FileSystem.exists(p + e) && FileSystem.getLinkStatistics(p + e).isFile()
  );

  if (extension) {
    return FileSystem.getRealPath(p + extension);
  }

  return null;
};

const readTypescriptSourceFile = (filePath: string): string | null => {
  const p = resolveTypescriptSourceFile(filePath);

  if (p === null) return null;

  try {
    return FileSystem.readFile(p);
  } catch {
    return null;
  }
};

const fileToAst = (filePath: string): ts.SourceFile | null => {
  const fileContent = readTypescriptSourceFile(filePath);

  if (fileContent !== null) {
    return tsquery.ast(fileContent, filePath);
  }

  return null;
};

const getFileWithImports = (filePath: string, projectRoot: string): File => {
  const fileDir = path.dirname(filePath);
  const file = new File(filePath);
  const ast = fileToAst(filePath);

  if (ast === null) {
    if (filePath.startsWith(".") || filePath.startsWith("~")) {
      // if the file can't be parsed, because its not a valid typescript source, we add the file but ignore all the imports in it.
      file.addError(
        "We can only parse valid Typescript Source Files. We weren't able to load this file. Make sure to use valid file extensions like .ts or .tsx. Imports from this File are ignored."
      );
    }
    return file;
  }

  // find all import statements
  const allImports = tsquery(ast, "ImportDeclaration");
  from(allImports)
    // convert to the imported file
    .pipe(map((i) => (i as any).moduleSpecifier.text))
    // convert to absolute file path
    .pipe(
      map((i) => {
        // only resolve relative file imports
        if (i.startsWith(".") || i.startsWith("~")) {
          const absolutePath = path.resolve(fileDir, i);
          const projectRelativePath = path.relative(projectRoot, absolutePath);

          return projectRelativePath;
        }

        // for node modules etc. we should keep the exisiting name
        return i;
      })
    )
    // map relative path from imports to real file names
    .pipe(map((f) => resolveTypescriptSourceFile(f) || f))
    // add all imported files (with project realitve path) to our File
    .subscribe((i) => file.addImport(i));

  return file;
};

const filterDuplicateFile = (alreadyParsedFiles: File[]) => (f: string) => {
  const index = alreadyParsedFiles.findIndex((file) => file.getPath() === f);
  return index === -1;
};

export const getFilesWithImports = (
  files: string[],
  projectRoot: string,
  recursiveResolveImports: boolean = true,
  alreadyParsedFiles: File[] = []
): File[] => {
  from(files)
    // map relative path from imports to real file names
    .pipe(map((f) => resolveTypescriptSourceFile(f) || f))
    // only include files which aren't already parsed
    .pipe(filter(filterDuplicateFile(alreadyParsedFiles)))
    .pipe(
      map((f) => {
        const fi = getFileWithImports(f, projectRoot);
        alreadyParsedFiles.push(fi);

        // recursive loading of files
        const importedFiles = fi
          .getImports()
          .filter(filterDuplicateFile(alreadyParsedFiles));
        if (importedFiles.length > 0 && recursiveResolveImports) {
          getFilesWithImports(
            importedFiles,
            projectRoot,
            recursiveResolveImports,
            alreadyParsedFiles
          );
        }
      })
    )
    .subscribe();

  return alreadyParsedFiles;
};
