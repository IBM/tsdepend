import {
  CommandLineAction,
  CommandLineStringListParameter,
  CommandLineFlagParameter,
} from "@rushstack/ts-command-line";
import { force } from "../../flags/force";
import { pattern } from "../../flags/pattern";
import { verbose } from "../../flags/verbose";
import { Tsdepend } from "../../../lib/tsdepend";
import { Logger, ConsoleLogAdapter } from "../../../lib/util/Logger";

export class CyclesAction extends CommandLineAction {
  private _force?: CommandLineFlagParameter;
  private _verbose?: CommandLineFlagParameter;
  private _filePatterns?: CommandLineStringListParameter;

  public constructor() {
    super({
      actionName: "cycles",
      summary: "checks for dependency cycles",
      documentation:
        "tests your code base, based on the given file pattern for dependency cycles. This method can be executed with test also, if you add cycle tests to your configuration",
    });
  }

  protected async onExecute(): Promise<void> {
    if (this._verbose) {
      Logger.configureLogger(new ConsoleLogAdapter(this._verbose.value));
    }

    // setup cycle analyzer
    const cycleAnalyzer = Tsdepend.from(
      ...this._filePatterns!.values
    ).analyzeCycles();

    const containsCycles = await cycleAnalyzer.containsCycles();

    if (!containsCycles) {
      Logger.log("Great! No dependency cycles detected.");
      return;
    }

    // show more infos about the cycles
    const cycles = await cycleAnalyzer.getDependenyCycles();
    Logger.log("Ups! Dependency cycles detected:");
    cycles.forEach((c) => Logger.log("\t", c.toPrettyString()));

    Logger.log(
      `Error: ${cycles.length} cycles detected, fix your imports and try again.`
    );

    if (!this._force!.value) {
      process.exit(1);
    } else {
      Logger.log("\tExit with 0 exit code, because you have --force specified");
    }
  }

  protected onDefineParameters(): void {
    this._force = this.defineFlagParameter(force);
    this._verbose = this.defineFlagParameter(verbose);
    this._filePatterns = this.defineStringListParameter(pattern);
  }
}
