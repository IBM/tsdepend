export class DependencyCycle {
  constructor(private cyclePath: string[]) {}

  public toPrettyString() {
    return this.cyclePath.join(" -> ");
  }
}

// a cyle can be represented as a list of file names, showing the cycle:
// "A", "B", "A"
// and with pretty print
// "A" -> "B" -> "A"
// longer cycle chains are also poossible
// "A" -> "B" -> "Z" -> "x" -> "A"
