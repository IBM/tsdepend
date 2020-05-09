export class File {
  /**
   * Array of imported files (file path)
   */
  private importedFiles: string[] = [];
  private errors: string[] = [];

  constructor(private filePath: string) {}

  public getPath(): string {
    return this.filePath;
  }

  public getImports(): string[] {
    return this.importedFiles;
  }

  /**
   * Add the given file as imported
   *
   * @param filePath imported file to be added
   */
  public addImport(filePath: string) {
    this.importedFiles.push(filePath);
  }

  public hasErrors(): boolean {
    return this.errors.length > 0;
  }

  public getErrors(): string[] {
    return this.errors;
  }

  public addError(err: string) {
    this.errors.push(err);
  }
}
