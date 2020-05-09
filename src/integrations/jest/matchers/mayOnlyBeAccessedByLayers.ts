import { LayerDependencySpecification } from "../../../lib/LayeredArchitecture";

export const mayOnlyBeAccessedByLayers = async function (
  this: jest.MatcherContext,
  received: LayerDependencySpecification,
  ...layerNames: string[]
): Promise<jest.CustomMatcherResult> {
  if (received instanceof LayerDependencySpecification) {
    const violations = await received.mayOnlyBeAccessedByLayers(...layerNames);
    const hasViolations = violations.length > 0;

    const options = {
      comment: "layered architecture check",
      isNot: this.isNot,
      promise: this.promise,
    };

    const message = hasViolations
      ? () =>
          this.utils.matcherHint(
            ".mayOnlyBeAccessedByLayers",
            undefined,
            undefined,
            options
          ) +
          "\n\n" +
          (this.expand
            ? `Violations:\n\n\t${violations.map((v) => v.name).join("\n\t")}`
            : `Expected: no violations against access rules from layer ${this.utils.printReceived(
                received.getLayerName()
              )}\nReceived: layer ${this.utils.printExpected(
                violations.map((v) => v.name).join(", ")
              )} violates access rules against ${this.utils.printReceived(
                received.getLayerName()
              )} layer`)
      : () => {
          return (
            this.utils.matcherHint(
              ".mayOnlyBeAccessedByLayers",
              undefined,
              undefined,
              options
            ) +
            "\n\n" +
            " ! try focus on a positive test cases. This will report violations as well. Use #mayOnlyBeAccessedByLayers() without .not."
          );
        };

    return { message, pass: !hasViolations };
  }

  return {
    pass: false,
    message: () =>
      `expected ${received} to be an instance of LayerDependencySpecification`,
  };
};
