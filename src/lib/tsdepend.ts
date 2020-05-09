import { CycleAnalyzer } from "./analyzer/CycleAnalyzer";
import { SourcePackage } from "./SourcePackage";
import { DependencyAnalyzer } from "./analyzer/DependencyAnalyzer";
import {
  LayeredArchitectureBuilder,
  LayeredArchitecture,
} from "./LayeredArchitecture";
import { ConfigurationLoader } from "../config/Configuration";
import { Logger } from "./util/Logger";

export class Tsdepend {
  /**
   * creates a new tsdepend instance, based on the provided file pattern.
   *
   * @param filePattern string or array of string with patterns of files to include. Pattern is based on https://github.com/mrmlnc/fast-glob
   */
  public static from(...filePatterns: string[]): Tsdepend {
    return new Tsdepend(new SourcePackage(filePatterns));
  }

  /**
   * creates a new {LayeredArchitectureBuilder}.
   * Can be used to assert a typical layered architecture, e.g. with an UI layer, a business logic layer and
   * a persistence layer, where specific access rules should be adhered to, like UI may not access persistence
   * and each layer may only access lower layers, i.e. UI &rarr; business logic &rarr; persistence.
   *
   * more on this: https://learning.oreilly.com/library/view/fundamentals-of-software/9781492043447/ch06.html#ch-measuring
   * Java alternative: https://github.com/TNG/ArchUnit/blob/master/archunit/src/main/java/com/tngtech/archunit/library/Architectures.java
   */
  public static defineLayeredArchitecture(): LayeredArchitectureBuilder {
    return new LayeredArchitectureBuilder();
  }

  public static async layeredArchitectureFromConfig(
    configFilePath?: string
  ): Promise<LayeredArchitecture> {
    const config = await ConfigurationLoader.get(configFilePath);

    // build the layered arch.
    const architectureBuilder = Tsdepend.defineLayeredArchitecture();

    // define all layer
    Object.keys(config.layeredArchitecture!.layer).forEach((layerName) => {
      const definedBy = config.layeredArchitecture!.layer[layerName];

      Logger.debug(
        "#layeredArchitectureFromConfig() - define layer, with name (",
        layerName,
        "), defined by: ",
        definedBy
      );

      architectureBuilder.layer(layerName).definedBy(...definedBy);
    });

    return architectureBuilder.build();
  }

  private constructor(private sourcePackage: SourcePackage) {}

  /**
   * Analyze the given tsdepend instance with your given source package for dependecy cycles
   *
   * @return instance of {CycleAnalyzer} to get results about cycles, e.g. using {CycleAnalyzer#containsCycles()}
   */
  public analyzeCycles(): CycleAnalyzer {
    return new CycleAnalyzer(this.sourcePackage);
  }

  /**
   * Analyze if the given tsdepend instance depends upon files from the provided package
   *
   * @param filePatterns string or array of string with patterns of files to include. Pattern is based on https://github.com/mrmlnc/fast-glob
   */
  public dependsUpon(...filePatterns: string[]): DependencyAnalyzer {
    return new DependencyAnalyzer(
      this.sourcePackage,
      new SourcePackage(filePatterns)
    );
  }
}
