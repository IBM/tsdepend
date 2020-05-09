import {
  LayerDependencySpecification,
  LayeredArchitecture,
} from "../../../lib/LayeredArchitecture";

export const toMatchRulesfromConfig = async function (
  this: jest.MatcherContext,
  received: LayeredArchitecture,
  configFilePath?: string
): Promise<jest.CustomMatcherResult> {
  const result = await received.matchRulesFromConfig(configFilePath);
  const violations = result.filter((l) => l.violations.length > 0);
  const hasViolations = violations.length > 0;

  const options = {
    comment: "layered architecture check, based on your configuration",
    isNot: this.isNot,
    promise: this.promise,
  };

  const message = hasViolations
    ? () =>
        this.utils.matcherHint(
          ".toMatchRulesfromConfig",
          undefined,
          undefined,
          options
        ) +
        "\n\n" +
        (this.expand
          ? `Violations for Layer:\n\n\t${violations
              .map((layer) => layer.name)
              .join("\n\t")}`
          : violations
              .map(
                (layer) =>
                  `Expected: no violations against access rules from layer ${this.utils.printReceived(
                    layer.name
                  )}\nReceived: layer ${this.utils.printExpected(
                    layer.violations.map((v) => v.name).join(", ")
                  )} violates access rules against ${this.utils.printReceived(
                    layer.name
                  )} layer`
              )
              .join("\n\n"))
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
};
