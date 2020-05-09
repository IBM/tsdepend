import { Analyzer } from "./Analyzer";
import { SourcePackage } from "../SourcePackage";
import { DependencyCycle } from "../DependencyCycle";
import { getFilesWithImports, resolveTypescriptSourceFile } from "../util/ast";
import { dependencyGraphFromFiles } from "../util/graph";
import { Logger } from "../util/Logger";
import { ConfigurationLoader } from "../../config/Configuration";
import { from } from "rxjs";
import { map } from "rxjs/operators";
import { Dependency } from "../Dependency";

/**
 * Analyzer implementation to check a given {SourcePackage} depend upon a given {SourcePackage}.
 */
export class DependencyAnalyzer extends Analyzer {
  private _dependencies?: Dependency[];
  /**
   * creates a new instance
   *
   * @param sourcePackage the package to analyze
   * @param dependedPackage the package to analyze if the source depend on it
   * @param opts options to further configure the analyzer
   *      opts.recursive: [defaults to true] recursivly resolve relative imports.
   */
  constructor(
    private sourcePackage: SourcePackage,
    private dependedPackage: SourcePackage,
    private opts: { recursive: boolean } = { recursive: true }
  ) {
    super();
  }

  private async analyze() {
    this._dependencies = [];

    const projectRoot = await ConfigurationLoader.getConfig("projectRoot");
    const filesToAnalyze = await this.sourcePackage.toFileList();
    const dependencyFiles = await this.dependedPackage.toFileList();

    Logger.debug(
      "DependencyAnalyzer#analyze:",
      "\n\t projectRoot: ",
      projectRoot,
      "\n\t filesToAnalyze: ",
      filesToAnalyze,
      "\n\t depend upon?: ",
      dependencyFiles,
      "\n\t using options: ",
      this.opts,
      "\n"
    );

    // loading of all dependend files
    const files = getFilesWithImports(
      filesToAnalyze,
      projectRoot,
      this.opts.recursive
    );

    // create a graph to detect cycles
    const fileGraph = dependencyGraphFromFiles(files, true);

    // to check if a file from our dependencyFiles is included in the graph,
    // we need to resolve them to real file names first
    from(dependencyFiles)
      .pipe(map((f) => resolveTypescriptSourceFile(f) || f))
      .subscribe((dep) => {
        if (fileGraph.hasNode(dep)) {
          this._dependencies!.push(
            new Dependency(dep, fileGraph.dependantsOf(dep))
          );
        }
      });
  }

  /**
   * checks the given set of files for cycling dependencies.
   *
   * @returns true if there are any cycling dependenies, otehrwise false.
   */
  public async containsDependencies(): Promise<boolean> {
    if (this._dependencies === undefined) {
      await this.analyze();
    }

    return this._dependencies!.length > 0;
  }

  /**
   * checks the given set of packages for dependencies between them.
   * The check is directed if some files from the <i>sourcePackage</i> depends upon file from <i>dependedPackage</i>
   *
   * @returns Array with all dependency found between the source package and the depended package.
   *          If no depencies were found an empty array will be returned.
   */
  public async getDependencies(): Promise<Dependency[]> {
    if (this._dependencies === undefined) {
      await this.analyze();
    }

    return this._dependencies!;
  }
}
