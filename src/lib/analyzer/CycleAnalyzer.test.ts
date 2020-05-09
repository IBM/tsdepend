import { CycleAnalyzer } from "./CycleAnalyzer";
import { SourcePackage } from "../SourcePackage";

describe("CycleAnalyzer", () => {
  it("reports cycles in a dependency graph", async () => {
    const ca = new CycleAnalyzer(
      new SourcePackage(["src/**/CycleAnalyzer.ts"])
    );

    const containsCycles = await ca.containsCycles();
    expect(containsCycles).toBe(false);

    const cycles = await ca.getDependenyCycles();
    expect(cycles).toEqual([]);
  });
});
