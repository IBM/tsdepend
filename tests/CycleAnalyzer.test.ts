import { Tsdepend } from "../src/lib/tsdepend";

describe("CycleAnalyzer e2e", () => {
  it("reports cycles in a dependency graph", async () => {
    // Programatic use:

    // Attention async methods, you need to use await:
    const cycleAnalyzer = Tsdepend.from("src/**/*.ts").analyzeCycles();
    expect(await cycleAnalyzer.containsCycles()).toBe(false);
  });

  it("reports cycles in a dependency graph using our jest integration", async () => {
    /**
     * Jest test integration setup: Add the following line to your jest configuration.
     * (Path must be adapted if a deployed version from NPM will be used)
     *    setupFilesAfterEnv: ["./src/lib/integrations/jest/index.ts"],
     *
     * Test Hints:
     *  The #toHaveNoDependencyCycles() Matcher is async and therefore you need to mark the test function as async
     *  and to use await before calling the matcher, like we do in this example
     */

    await expect(Tsdepend.from("src/**/*.ts")).toHaveNoDependencyCycles();
  });
});
