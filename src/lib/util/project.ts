import { PackageJsonLookup } from "@rushstack/node-core-library";
import path from "path";

export const detectProjectRoot = () => {
  const lookup = new PackageJsonLookup();
  const projectRoot = lookup.tryGetPackageFolderFor(process.cwd());

  if (projectRoot === undefined) {
    throw "Unable to detect project root.";
  }

  return projectRoot;
};
