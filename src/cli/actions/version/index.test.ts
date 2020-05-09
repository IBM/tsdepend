import {
  CommandLineAction,
  CommandLineParser,
} from "@rushstack/ts-command-line";
import { VersionAction } from "./";

class TestCommandLine extends CommandLineParser {
  public constructor() {
    super({
      toolFilename: "example",
      toolDescription: "An example project",
    });

    this.addAction(new VersionAction());
  }

  protected onDefineParameters(): void {
    // no parameters
  }
}

describe("CommandLineParser", () => {
  // test idea from: https://github.com/microsoft/rushstack/blob/master/libraries/ts-command-line/src/test/CommandLineParser.test.ts
  it("executes the version action", () => {
    const commandLineParser: TestCommandLine = new TestCommandLine();

    return commandLineParser.execute(["version"]).then(() => {
      expect(commandLineParser.selectedAction).toBeDefined();
      expect(commandLineParser.selectedAction!.actionName).toEqual("version");

      const action: VersionAction = commandLineParser.selectedAction as VersionAction;
      expect(action.pkgVersion).toMatch(/([0-9]*)\.([0-9]*)\.([0-9]*)(@next)?/);
    });
  });
});
