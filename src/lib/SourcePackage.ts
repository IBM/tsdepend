import fg from "fast-glob";

/**
 * SourcePackage represent a set of source files
 */
export class SourcePackage {
  constructor(private filePattern: string[]) {}

  /**
   * @returns (async) a list with all included files in this source package
   */
  public async toFileList(): Promise<string[]> {
    return await fg(this.filePattern);
  }

  public toDependUpon(sourcePackage: SourcePackage): boolean {
    return false;
  }

  public toNotDependUpon(sourcePackage: SourcePackage): boolean {
    return false;
  }
}
