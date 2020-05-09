/**
 * Dependency
 */
export class Dependency {
  constructor(private name: string, private dependants: string[]) {}

  public toPrettyString() {
    return `Dependants for ${this.name}: ${
      this.dependants.length === 0
        ? "none"
        : "\n\t - " + this.dependants.join("\n\t - ")
    }`;
  }
}
