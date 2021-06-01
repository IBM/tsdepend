import { DependencyAnalyzer } from "./analyzer/DependencyAnalyzer";
import { SourcePackage } from "./SourcePackage";
import { from } from "rxjs";
import { filter, flatMap, toArray } from "rxjs/operators";
import { ConfigurationLoader } from "../config/Configuration";
import { Logger } from "./util/Logger";
import { asyncForEach } from "./util/asyncForEach";

class LayerSpecification {
  private _filePatterns: string[] = [];

  constructor(public name: string) {}

  public addFilePatterns(filePatterns: string[]): void {
    this._filePatterns.push(...filePatterns);
  }

  public getFilePatterns(): string[] {
    return this._filePatterns;
  }
}

export class LayerDependencySpecification {
  constructor(
    private layer: LayerSpecification,
    private otherLayers: LayerSpecification[]
  ) {}

  public getLayerName(): string {
    return this.layer.name;
  }

  /**
   * Test that only the provided layers are accessing the layer represented by this instance.
   *
   * @param layers array with names of layers which are allowed to access the layer represented by this instance
   *
   * @return array of layers which uses the layer represented by this instance, even if the should not do so.
   *         Empty array indicates that there is no violation to the Rule
   */
  public async mayOnlyBeAccessedByLayers(
    ...layers: string[]
  ): Promise<LayerSpecification[]> {
    const result = await from(this.otherLayers)
      // to test this rule we need to find all layers, which are not allowed to access the layer
      .pipe(filter((l) => !layers.includes(l.name)))
      .pipe(
        flatMap(async (l) => ({
          layer: l,
          dependencies: await new DependencyAnalyzer(
            new SourcePackage(l.getFilePatterns()),
            new SourcePackage(this.layer.getFilePatterns()),
            {
              recursive: false,
            }
          ).getDependencies(),
        }))
      )
      .pipe(toArray())
      .toPromise();

    return (
      result!
        // keep only layers which have a dependency
        .filter((l) => l.dependencies.length > 0)
        // map internal result to the Layer specified by the user
        .map((l) => l.layer)
    );
  }

  /**
   * Test that no other Layer in the architecture accesses the layer represented by this instance.
   *
   * @return array of layers which uses the layer represented by this instance, even if they should not do so.
   *         Empty array indicates that there is no violation to the Rule
   */
  public async mayNotBeAccessedByAnyLayer(): Promise<LayerSpecification[]> {
    return this.mayOnlyBeAccessedByLayers();
  }
}

export interface LayeredArchitecture {
  getLayer: (name: string) => LayerDependencySpecification;
  matchRulesFromConfig: (
    configFilePath?: string
  ) => Promise<{ name: string; violations: LayerSpecification[] }[]>;
}

class LayeredArchitectureImpl implements LayeredArchitecture {
  constructor(private _layers: LayerSpecification[]) {}

  public getLayer(name: string): LayerDependencySpecification {
    const layer = this._layers.find((l) => l.name === name);

    if (layer === undefined)
      throw `Unknown Layer <${name}>. 
        Please define a Layer beforehand using 
        Tsdepend.layeredArchitecture().layer("${name}").definedBy("<file pattern>")`;

    return new LayerDependencySpecification(
      layer,
      this._layers.filter((l) => !Object.is(l, layer))
    );
  }

  public async matchRulesFromConfig(configFilePath?: string) {
    const config = await ConfigurationLoader.get(configFilePath);
    const allViolations: {
      name: string;
      violations: LayerSpecification[];
    }[] = [];

    // check defined rules
    await asyncForEach(
      Object.keys(config.layeredArchitecture!.accessedBy),
      async (layerName) => {
        const accessBy = config.layeredArchitecture!.accessedBy[layerName];

        const violations = await this.getLayer(
          layerName
        ).mayOnlyBeAccessedByLayers(...accessBy);

        allViolations.push({
          name: layerName,
          violations,
        });
      }
    );

    return allViolations;
  }
}

export class LayeredArchitectureBuilder {
  private _layers: LayerSpecification[] = [];

  public layer(name: string): LayeredArchitectureBuilder {
    this._layers.push(new LayerSpecification(name));
    return this;
  }

  public definedBy(...filePatterns: string[]): LayeredArchitectureBuilder {
    if (this._layers.length === 0) {
      throw "A #layer(...) must be defined before a file pattern can be defined. Use .layer('name').definedBy('src/services/*.ts')";
    }
    this._layers[this._layers.length - 1].addFilePatterns(filePatterns);
    return this;
  }

  public build(): LayeredArchitecture {
    return new LayeredArchitectureImpl(this._layers);
  }
}
