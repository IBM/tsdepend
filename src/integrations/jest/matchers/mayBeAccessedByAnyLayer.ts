import { LayerDependencySpecification } from "../../../lib/LayeredArchitecture";

export const mayBeAccessedByAnyLayer = async function (
  this: jest.MatcherContext,
  received: LayerDependencySpecification
): Promise<jest.CustomMatcherResult> {
  if (received instanceof LayerDependencySpecification && this.isNot) {
    const violations = await received.mayNotBeAccessedByAnyLayer();
    const hasViolations = violations.length > 0;

    const options = {
      comment: "layered architecture check",
      isNot: this.isNot,
      promise: this.promise,
    };

    const message = hasViolations
      ? () =>
          this.utils.matcherHint(
            ".not.mayBeAccessedByAnyLayer",
            undefined,
            undefined,
            options
          ) +
          "\n\n" +
          (this.expand
            ? `Violations:\n\n\t${violations.map((v) => v.name).join("\n\t")}`
            : `Expected: no violations to 
            ${this.utils.printReceived(received.getLayerName())}\n
            Received: ${this.utils.printReceived(
              violations.map((v) => v.name).join(", ")
            )}`)
      : () => {
          return this.utils.matcherHint(
            ".not.mayBeAccessedByAnyLayer  success",
            undefined,
            undefined,
            options
          );
        };

    return { message, pass: hasViolations };
  }

  return {
    pass: false,
    message: () =>
      `expected ${received} to be an instance of LayerDependencySpecification 
      and must used together with expect(...).not.mayBeAccessedByAnyLayer()`,
  };
};
