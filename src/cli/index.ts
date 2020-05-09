#!/usr/bin/env node

import {
  CommandLineParser,
  CommandLineFlagParameter,
} from "@rushstack/ts-command-line";
import { VersionAction } from "./actions/version";
import { TestAction } from "./actions/test";
import { CyclesAction } from "./actions/cycles";
import { PackageJsonLookup } from "@rushstack/node-core-library";
import { verbose } from "./flags/verbose";
import { Logger, ConsoleLogAdapter } from "../lib/util/Logger";

class TsdependCommandLineParser extends CommandLineParser {
  private _verbose?: CommandLineFlagParameter;

  public constructor() {
    const pkg = PackageJsonLookup.loadOwnPackageJson(__dirname);

    super({
      toolFilename: pkg.name,
      toolDescription: pkg.description || "",
    });

    this.addAction(new TestAction());
    this.addAction(new CyclesAction());
    this.addAction(new VersionAction());
  }

  protected onDefineParameters(): void {
    this._verbose = this.defineFlagParameter(verbose);
  }

  protected onExecute(): Promise<void> {
    Logger.configureLogger(new ConsoleLogAdapter(this._verbose!.value));

    return super.onExecute();
  }
}

// finally, start up our cli
const commandLine: CommandLineParser = new TsdependCommandLineParser();
commandLine.execute();
