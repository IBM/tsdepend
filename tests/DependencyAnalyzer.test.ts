import { Tsdepend } from "../src/lib/tsdepend";

describe("DependencyAnalyzer e2e", () => {
  it("test for usage of specific file and packages, via our jest integration", async () => {
    /**
     * Jest test integration setup: Add the following line to your jest configuration.
     * (Path must be adapted if a deployed version from NPM will be used)
     *    setupFilesAfterEnv: ["./src/lib/integrations/jest/index.ts"],
     *
     * Test Hints:
     *  The #dependsUpon() Matcher is async and therefore you need to mark the test function as async
     *  and to use await before calling the matcher, like we do in this example
     *
     *  start yarn with --expand or -e to get an overview about dependencies if a test fails
     */

    // verify that our cli uses our implementation
    await expect(Tsdepend.from("src/cli/**/*.ts")).dependsUpon(
      "src/lib/**/*.ts"
    );
    // but we should not use cli stuff in our lib implementation:
    await expect(Tsdepend.from("src/lib/**/*.ts")).not.dependsUpon(
      "src/cli/**/*.ts"
    );
  });

  it("can analyze structure using a layered architecture approach", async () => {
    // usage of #mayBeAccessedByAnyLayer without .not will result to an error, because it makes no sense to use it,
    //  => we have to make sure that our users can use tsdepend easily.

    // define our architecture layers to demonstrate the usage:
    const architecture = Tsdepend.defineLayeredArchitecture()
      .layer("cli")
      .definedBy("src/cli/**/*.ts")

      .layer("config")
      .definedBy("src/config/**/*.ts")

      .layer("lib")
      .definedBy("src/lib/**/*.ts")

      .layer("integrations")
      .definedBy("src/integrations/**/*.ts")

      .build();

    await expect(architecture.getLayer("cli"))
      // cli is only used to provide a good developer experience and should not contain any implementation details of tsdepend,
      // therefore nothing should be reused anywhere else in this project
      .not.mayBeAccessedByAnyLayer();

    await expect(architecture.getLayer("integrations"))
      // integrations should not used for implementation details,
      // they just provided integration with 3rdParty Apps and frameworks
      .not.mayBeAccessedByAnyLayer();

    await expect(architecture.getLayer("config"))
      // integrations should not use our config directly
      .mayOnlyBeAccessedByLayers("cli", "lib");

    // we don't need any rule for lib, as every package are allowed to use it.
  });

  it("same as above, but using a configuration file as source.", async () => {
    const architecture = await Tsdepend.layeredArchitectureFromConfig();

    await expect(architecture.getLayer("cli"))
      // cli is only used to provide a good developer experience and should not contain any implementation details of tsdepend,
      // therefore nothing should be reused anywhere else in this project
      .not.mayBeAccessedByAnyLayer();

    await expect(architecture.getLayer("integrations"))
      // integrations should not used for implementation details,
      // they just provided integration with 3rdParty Apps and frameworks
      .not.mayBeAccessedByAnyLayer();

    await expect(architecture.getLayer("config"))
      // integrations should not use our config directly
      .mayOnlyBeAccessedByLayers("cli", "lib");
  });

  it("same as above, but using a configuration file as single source of truth.", async () => {
    const architecture = await Tsdepend.layeredArchitectureFromConfig();
    await expect(architecture).toMatchRulesfromConfig();
  });
});
