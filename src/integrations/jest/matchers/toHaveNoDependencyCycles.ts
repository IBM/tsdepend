import { Tsdepend } from "../../../lib/tsdepend";

export const toHaveNoDependencyCycles = async (
  received: Tsdepend
): Promise<jest.CustomMatcherResult> => {
  if (received instanceof Tsdepend) {
    const cycleAnalyzer = received.analyzeCycles();
    const hasCycles = await cycleAnalyzer.containsCycles();

    if (!hasCycles) {
      return {
        pass: true,
        message: () =>
          `expected ${received} to not contain any dependency cycles`,
      };
    }

    const cycles = await cycleAnalyzer.getDependenyCycles();

    return {
      pass: false,
      message: () => `
            expected ${received} to not contain any dependency cycles, 
            but found: ${cycles
              .map((c) => "\n\t" + c.toPrettyString())
              .join("")}`,
    };
  }

  console.log("return failure....");
  return {
    pass: false,
    message: () => `expected ${received} to be an instance of Tsdepend.`,
  };
};
