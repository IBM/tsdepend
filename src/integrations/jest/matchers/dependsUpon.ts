import { Tsdepend } from "../../../lib/tsdepend";

export const dependsUpon = async function (
  this: jest.MatcherContext,
  received: Tsdepend,
  ...filePatterns: string[]
): Promise<jest.CustomMatcherResult> {
  if (received instanceof Tsdepend) {
    const depAnalyzer = received.dependsUpon(...filePatterns);
    const hasDeps = await depAnalyzer.containsDependencies();
    const depsFound = await depAnalyzer.getDependencies();

    const receivedFilePattern = received["sourcePackage"]["filePattern"];

    const options = {
      comment: "depends upon",
      isNot: this.isNot,
      promise: this.promise,
    };

    const message = hasDeps
      ? () =>
          this.utils.matcherHint("dependsUpon", undefined, undefined, options) +
          "\n\n" +
          (this.expand
            ? `Difference:\n\n\t${depsFound
                .map((d) => d.toPrettyString())
                .join("\n\t")}`
            : `Expected: ${this.utils.printReceived(
                receivedFilePattern
              )} to be not depended upon ${this.utils.printExpected(
                filePatterns
              )}\n` +
              `Received: ${this.utils.printReceived(
                receivedFilePattern
              )} depends upon ${this.utils.printExpected(filePatterns)}`)
      : () => {
          return (
            this.utils.matcherHint(
              "dependsUpon",
              undefined,
              undefined,
              options
            ) +
            "\n\n" +
            (this.expand
              ? `Difference:\n\n\t${depsFound
                  .map((d) => d.toPrettyString())
                  .join("\n\t")}`
              : `Expected: ${this.utils.printReceived(
                  receivedFilePattern
                )} to be depended upon ${this.utils.printExpected(
                  filePatterns
                )}\n` +
                `Received: ${this.utils.printReceived(
                  receivedFilePattern
                )} to have no dependecies upon ${this.utils.printExpected(
                  filePatterns
                )}`)
          );
        };

    return { message, pass: hasDeps };
  }

  return {
    pass: false,
    message: () => `expected ${received} to be an instance of Tsdepend.`,
  };
};
