// add custom matcher to jest:

import { toHaveNoDependencyCycles } from "./matchers/toHaveNoDependencyCycles";
import { dependsUpon } from "./matchers/dependsUpon";
import { mayBeAccessedByAnyLayer } from "./matchers/mayBeAccessedByAnyLayer";
import { mayOnlyBeAccessedByLayers } from "./matchers/mayOnlyBeAccessedByLayers";
import { toMatchRulesfromConfig } from "./matchers/toMatchRulesfromConfig";

const jestExpect = expect;
if (jestExpect !== undefined) {
  jestExpect.extend({
    toHaveNoDependencyCycles,
    dependsUpon,
    mayBeAccessedByAnyLayer,
    mayOnlyBeAccessedByLayers,
    toMatchRulesfromConfig,
  });
} else {
  /* eslint-disable no-console */
  console.error(
    "Unable to find Jest's global expect." +
      "\nPlease check you have added jest-extended correctly to your jest configuration." +
      "\nSee https://github.com/jest-community/jest-extended#setup for help."
  );
  /* eslint-enable no-console */
}
