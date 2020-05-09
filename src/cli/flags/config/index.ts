/**
 * Config argument, always use together with #defineStringParameter()
 *
 * protected onDefineParameters(): void {
 *    this._config = this.defineStringParameter(config);
 * }
 */
export const config = {
  argumentName: "CONFIG",
  description: `
      path to your tsdepend configuration file. if omitted, we try to search for a configuration path in your current project or within your package.json. 
      Example: -c \"configs/.tsdependrc"
    `,
  parameterLongName: "--config",
  parameterShortName: "-c",
  required: false,
};
