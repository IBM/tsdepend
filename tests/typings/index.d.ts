export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoDependencyCycles(): R;
      dependsUpon(...filePatterns: string[]): R;
      mayBeAccessedByAnyLayer(): R;
      mayOnlyBeAccessedByLayers(...layerNames: string[]): R;
      toMatchRulesfromConfig(configFilePath?: string): R;
    }
  }
}
