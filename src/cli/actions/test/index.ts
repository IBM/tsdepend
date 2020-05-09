import {
  CommandLineAction,
  CommandLineStringParameter,
  CommandLineFlagParameter,
} from "@rushstack/ts-command-line";
import { config } from "../../flags/config";
import { verbose } from "../../flags/verbose";
import { force } from "../../flags/force";
import { Logger, ConsoleLogAdapter } from "../../../lib/util/Logger";
import { ConfigurationLoader } from "../../../config/Configuration";
import { Tsdepend } from "../../../lib/tsdepend";

export class TestAction extends CommandLineAction {
  private _config?: CommandLineStringParameter;
  private _force?: CommandLineFlagParameter;
  private _verbose?: CommandLineFlagParameter;

  public constructor() {
    super({
      actionName: "test",
      summary: "execute tsdepend tests",
      documentation: "tests your code base, based on the given configuration",
    });
  }

  protected async onExecute(): Promise<void> {
    if (this._verbose) {
      Logger.configureLogger(new ConsoleLogAdapter(this._verbose.value));
    }

    let hasErrors = false;

    const configPath = this._config ? this._config.value : undefined;
    const tsdependConfig = await ConfigurationLoader.get(configPath);

    // should we test for dependency cycles?
    if (tsdependConfig.cycle) {
      // setup cycle analyzer
      const cycleAnalyzer = Tsdepend.from(
        ...tsdependConfig.cycle
      ).analyzeCycles();

      const containsCycles = await cycleAnalyzer.containsCycles();

      if (containsCycles) {
        hasErrors = true;

        // show more infos about the cycles
        const cycles = await cycleAnalyzer.getDependenyCycles();
        Logger.log("Ups! Dependency cycles detected:");
        cycles.forEach((c) => Logger.log("\t", c.toPrettyString()));
      }
    }

    // should we test a layered architecture?
    if (tsdependConfig.layeredArchitecture) {
      const architecture = await Tsdepend.layeredArchitectureFromConfig(
        configPath
      );

      const allViolations = await architecture.matchRulesFromConfig(configPath);

      if (
        allViolations.filter((layer) => layer.violations.length > 0).length > 0
      )
        hasErrors = true;

      allViolations.forEach((layer) =>
        Logger.debug(
          "Violations found for layer (",
          layer.name,
          "): ",
          layer.violations
        )
      );
    }

    if (!hasErrors) {
      Logger.log("Great! no violations against your rules were found.");
      return;
    }

    Logger.log(
      "Violations against your rules found, fix your imports and try again."
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
    this._config = this.defineStringParameter(config);
  }
}
