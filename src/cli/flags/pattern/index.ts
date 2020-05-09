/**
 * Pattern argument, always use together with #defineStringListParameter()
 *
 * protected onDefineParameters(): void {
 *    this._filePatterns = this.defineStringListParameter(pattern);
 * }
 */
export const pattern = {
  argumentName: "PATTERN",
  description: `
      Glob pattern of files to include. 
      Use quotes to pass the pattern. 
      If you want to define multiple patterns you can do so: 
      -p \"src/**\" -p \"test/**\". 
      If some files should be ignored just append an ! to the pattern.
      Example to test all source files except for tests: -p "src/**" -p "!src/**/*.test.ts"
    `,
  parameterLongName: "--pattern",
  parameterShortName: "-p",
  required: true,
};
