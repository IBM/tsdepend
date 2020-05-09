import { CommandLineAction } from "@rushstack/ts-command-line";
import { PackageJsonLookup } from "@rushstack/node-core-library";

export class VersionAction extends CommandLineAction {
  pkgVersion?: string;

  public constructor() {
    super({
      actionName: "version",
      summary: "output the version",
      documentation: "Shows you the current used version of tsdepend",
    });
  }

  protected onExecute(): Promise<void> {
    return new Promise((done) => {
      // we have to use this util and cannot import the json directly,
      // because importing the json directly would cause a different output in dist
      const pkg = PackageJsonLookup.loadOwnPackageJson(__dirname);
      this.pkgVersion = pkg.version;

      console.log(`Actual version is: v${this.pkgVersion}`);
      done();
    });
  }

  protected onDefineParameters(): void {
    // no flags for our version action
  }
}
