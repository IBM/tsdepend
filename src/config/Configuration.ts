import { cosmiconfig } from "cosmiconfig";
import { detectProjectRoot } from "../lib/util/project";
import { Logger } from "../lib/util/Logger";

export interface LayeredArchitectureConfiguration {
  layer: { [k: string]: string[] };
  accessedBy: { [k: string]: string[] };
}

export interface Configuration {
  /**
   * Path to project root, where the package.json of the project lives.
   * If not provided, tsdepend tries to find the nearset in the tree.
   */
  projectRoot: string;

  /**
   * Presets to reuse existing tsdepend configurations. Presets must already be installed
   * with your favorite package manager (`npm`, `yarn`, etc.).
   * Either globally if tsdepend is used as a global install, or locally in the project.
   * A preset is a node module which exposes a `tsdepend.config.js` as its main file.
   * Thats why import config from "preset-name" should be enough, to get the whole configuration.
   */
  preset?: string[];

  /**
   * Analyzes the given sources for dependency cycles.
   * Sources are defined as array using the glob notation. use `!` to exclude files from analyzing.
   */
  cycle?: string[];

  /**
   * definition of a layered architecture
   */
  layeredArchitecture?: LayeredArchitectureConfiguration;
}

export type ConfigurationKeys = keyof Configuration;

export class ConfigurationLoader {
  // cosmiconfig uses a caching layer internally, so we don't have to do it
  private static explorer = cosmiconfig("tsdepend");
  private static projectRoot = detectProjectRoot();

  public static async get(configFilePath?: string): Promise<Configuration> {
    let searchAsyncResult;
    if (configFilePath) {
      searchAsyncResult = await this.explorer.load(configFilePath);
    } else {
      searchAsyncResult = await this.explorer.search();
    }

    Logger.debug("ConfigurationLoader#get() - ", searchAsyncResult);

    if (searchAsyncResult && searchAsyncResult.config) {
      return {
        ...searchAsyncResult.config,
        projectRoot: ConfigurationLoader.projectRoot,
      };
    }

    Logger.debug(
      "ConfigurationLoader#get() - ",
      "fallback to default config, as no configuration was found"
    );

    // Fallback, if no configuration was found
    return {
      projectRoot: ConfigurationLoader.projectRoot,
    };
  }

  public static async getConfig<k extends ConfigurationKeys>(key: k) {
    const config = await this.get();
    return config[key];
  }
}
