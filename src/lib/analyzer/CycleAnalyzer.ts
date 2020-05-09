import { Analyzer } from "./Analyzer";
import { SourcePackage } from "../SourcePackage";
import { DependencyCycle } from "../DependencyCycle";
import { getFilesWithImports } from "../util/ast";
import { dependencyGraphFromFiles } from "../util/graph";
import { Logger } from "../util/Logger";
import { ConfigurationLoader } from "../../config/Configuration";

/**
 * Analyzer implementation to check a given {SourcePackage} for dependency cycles.
 */
export class CycleAnalyzer extends Analyzer {
  private cycles?: DependencyCycle[];

  /**
   * creates a new instance
   *
   * @param sourcePackage the package to analyze for dependency cycles
   */
  constructor(private sourcePackage: SourcePackage) {
    super();
  }

  private async analyze() {
    this.cycles = [];

    const projectRoot = await ConfigurationLoader.getConfig("projectRoot");
    const filesToAnalyze = await this.sourcePackage.toFileList();
    Logger.debug(
      "CycleAnalyzer#analyze:",
      "\n\t projectRoot: ",
      projectRoot,
      "\n\t filesToAnalyze: ",
      filesToAnalyze
    );

    // recursive loading of all dependend files
    const files = getFilesWithImports(filesToAnalyze, projectRoot);

    // create a graph to detect cycles
    const fileGraph = dependencyGraphFromFiles(files);

    try {
      // we're calling this to get the cycle for this file, if there is one (as exception)
      fileGraph.overallOrder();
    } catch (e) {
      this.cycles.push(new DependencyCycle(e.cyclePath));
    }

    Logger.debug(
      "CycleAnalyzer#analyze:",
      "\n\t analyzed file count: ",
      files.length,
      "\n\t cycles found: ",
      this.cycles,
      "\n"
    );
  }

  /**
   * checks the given set of files for cycling dependencies.
   *
   * @returns true if there are any cycling dependenies, otehrwise false.
   */
  public async containsCycles(): Promise<boolean> {
    if (this.cycles === undefined) {
      await this.analyze();
    }

    return this.cycles!.length > 0;
  }

  /**
   * checks the given set of files for cycling dependencies.
   *
   * @returns Array with all dependency cycles, if no cycle was found an empty array will be returned.
   */
  public async getDependenyCycles(): Promise<DependencyCycle[]> {
    if (this.cycles === undefined) {
      await this.analyze();
    }

    return this.cycles!;
  }
}
