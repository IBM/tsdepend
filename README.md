# tsdepend ![(workflow)](https://github.com/IBM/tsdepend/workflows/(Unnamed%20workflow)/badge.svg?branch=master)

tsdepend helps you, to keep your code organized over time. 🙌

## CLI usage

```shell
$ tsdepend --help

usage: tsdepend [-h] [-v] <command> ...

tsdepend helps you, to keep your code organized over time.

Positional arguments:
  <command>
    test         execute tsdepend tests
    cycles       checks for dependency cycles
    version      output the version

Optional arguments:
  -h, --help     Show this help message and exit.
  -v, --verbose  Show more details. Useful for debugging problems.
```

### test

```shell
$ tsdepend test --help
usage: tsdepend test [-h] [-f] [-v] [-c CONFIG]

tests your code base, based on the given configuration

Optional arguments:
  -h, --help            Show this help message and exit.
  -f, --force           return status code 0 even if there are errors
  -v, --verbose         Show more details. Useful for debugging problems.
  -c CONFIG, --config CONFIG
                        path to your tsdepend configuration file. if omitted,
                        we try to search for a configuration path in your
                        current project or within your package.json. Example:
                        -c "configs/.tsdependrc"
```

Example:

```shell
$ tsdepend test
Great! no violations against your rules were found.
```

### cycles

```shell
$ tsdepend cycles --help
usage: tsdepend cycles [-h] [-f] -p PATTERN

tests your code base, based on the given file pattern for dependency cycles.
This method can be executed with test also, if you add cycle tests to your
configuration

Optional arguments:
  -h, --help            Show this help message and exit.
  -f, --force           return status code 0 even if there are errors
  -v, --verbose         Show more details. Useful for debugging problems.
  -p PATTERN, --pattern PATTERN
                        Glob pattern of files to include. Use quotes to pass
                        the pattern. If you want to define multiple patterns
                        you can do so: -p "src/**" -p "test/**". If some
                        files should be ignored just append an ! to the
                        pattern. Example to test all source files except for
                        tests: -p "src/**" -p "!src/**/*.test.ts"
```

You can also test your codebase for cycles using the `test` command together with a proper [configuration](#configuration).

### version

```shell
$ tsdepend version --help

usage: tsdepend version [-h]

Shows you the current used version of tsdepend

Optional arguments:

```

Example:

```shell
$ tsdepend version
Actual version is: v0.0.0-development
```

---

## Configuration

Tsdepend uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) to read configuration. This is why you can define tsdepend configurtion either using the `"tsdepend": { ... }` key within your package.json or using a seperate file `.tsdependrc` or `tsdepend.config.js`. In our examples we will use the `.tsdependrc` variant.

> **To be implemented!**
>
> `preset`: use a preset to reuse an existing tsdepend configuration. Presets must be installed with your favorite package manager (`npm`, `yarn`, etc.).
> A preset is a node module which exposes a `tsdepend.config.js` as its main file.

```json
   "preset": ["tsdepend-angular-preset"]
```

`cycle`: analyzes the given sources for dependency cycles. Sources are defined as array using the glob notation. use `!` to exclude files from analyzing.

```json
   "cycle": [
       "src/**/*.ts"
       "!src/**/*.test.ts",
       "!src/**/*.spec.ts"
   ]
```

`layeredArchitecture`: defines a layered architecture. Tsdepend will verify that only allowed layers access a given layer. Within the `layer` object all available layers are defined. The key is used as a name of a certain layer, which is defined by the sources which are defined as values (array of strings, using the glob notation). How this test would look like if it is defined as unit test, you can have a look at `./tests/DependencyAnalyzer.test`. There is the exact same configuration, but defined using our jest integration.
Access rules are defined within the `accessedBy` object. The name of the layer is used as a key and layer which are allowed to access this layer are defined as an array, using their names. If no other layer should access a certain layer, an empty array should be defined. This states that no other layer is allowed to access it. This is quite common, e.g. our CLI implemenation should not be used by our internal implementation our by our test framewrok integrations to keep this part of the application maintainable. If on the other hand all layers should access a certain layer, nothing should be defined => no rule, no check. In our example below this is the case for the `lib` module, as this is the main implementation and can therfore be used by all other layers.

```json
   "layeredArchitecture": {
       "layer": {
            "cli": ["src/cli/**/*.ts"],
            "config": ["src/config/**/*.ts"],
            "lib": ["src/lib/**/*.ts"],
            "integrations": ["src/integrations/**/*.ts"]
       },
       "accessedBy": {
            "cli": [],
            "integrations": [],
            "config": ["cli", "lib"]
       }
   }
```

---

## Integrations

### jest

> 💁 Note: you can use tsdepend with every test framework. You have to use our tsdepend API to do so, the same we're using to provide the jest integration. If you like to contribute an integration for a different test framework we're happy if you raise a PR or create an issue.

#### Preconditions

- A node.js project using npm or yarn.
- Typescript Source Code (we need something to analyze)
- Jest as test framework. ⇒ `yarn add --dev jest`
- tsdepend installed as a development dependency ⇒ `yarn add --dev tsdepend` or if you want to use our latest features, you can install our next version: `yarn add --dev tsdepend@next`

#### Configure Jest

In order to use our integration, we need to configure jest to load our extensions. We need to define the path to our integration within the `setupFilesAfterEnv` configuration. Normally this will be found in the `jest.config.js` file in your projects root directory.

```js
module.exports = {
  setupFilesAfterEnv: ["tsdepend/dist/integrations/jest/index.js"],
};
```

#### Writing a Testcase

- create a new test file, according to your file pattern. In our examples we're using a pattern `*.test.ts`
- import tsdepend
- define your test cases, using the known jest format
- Use `Tsdepend#from`, `Tsdepend#defineLayeredArchitecture`, `Tsdepend#layeredArchitectureFromConfig` to define source sets, which you want to analyze

```ts
// DependencyAnalyzer.test.ts
import { Tsdepend } from "../src/lib/tsdepend";

describe("DependencyAnalyzer e2e", () => {
  it("test for usage of specific file and packages, via our jest integration", async () => {
    /**
     * Test Hints:
     *  The #dependsUpon() Matcher is async and therefore you need to mark the test function as async
     *  and to use await before calling the matcher, like we do in this example
     *
     *  start yarn with --expand or -e to get an overview about dependencies if a test fails
     */

    // verify that our cli uses our implementation
    await expect(Tsdepend.from("src/cli/**/*.ts")).dependsUpon(
      "src/lib/**/*.ts"
    );
    // but we should not use cli stuff in our lib implementation:
    await expect(Tsdepend.from("src/lib/**/*.ts")).not.dependsUpon(
      "src/cli/**/*.ts"
    );
  });

  it("can analyze structure using a layered architecture approach", async () => {
    // Test Hint: usage of #mayBeAccessedByAnyLayer without .not will result to an error, because it makes no sense to use it,

    // define our architecture layers to demonstrate the usage:
    const architecture = Tsdepend.defineLayeredArchitecture()
      .layer("cli")
      .definedBy("src/cli/**/*.ts")

      .layer("config")
      .definedBy("src/config/**/*.ts")

      .layer("lib")
      .definedBy("src/lib/**/*.ts")

      .layer("integrations")
      .definedBy("src/integrations/**/*.ts")

      .build();

    await expect(architecture.getLayer("cli"))
      // cli is only used to provide a good developer experience and should not contain any implementation details of tsdepend,
      // therefore nothing should be reused anywhere else in this project
      .not.mayBeAccessedByAnyLayer();

    await expect(architecture.getLayer("integrations"))
      // integrations should not used for implementation details,
      // they just provided integration with 3rdParty Apps and frameworks
      .not.mayBeAccessedByAnyLayer();

    await expect(architecture.getLayer("config"))
      // integrations should not use our config directly, but cli and lib are allowed
      .mayOnlyBeAccessedByLayers("cli", "lib");

    // we don't need any rule for lib, as every package are allowed to use it.
  });
});
```

if you're already using our [CLI](#cli-usage), you probably have a [configuration file](#configuration) already defined. We can use this configuration file within our unit test. A configuration file for the layered architecture we've defined in the test above, would look like this:

```json
{
  "layeredArchitecture": {
    "layer": {
      "cli": ["src/cli/**/*.ts"],
      "config": ["src/config/**/*.ts"],
      "lib": ["src/lib/**/*.ts"],
      "integrations": ["src/integrations/**/*.ts"]
    },
    "accessedBy": {
      "cli": [],
      "integrations": [],
      "config": ["cli", "lib"]
    }
  }
}
```

To Test the layered architecture defined in a configuration file, you can write your test like this:

```ts
// DependencyAnalyzer.test.ts
import { Tsdepend } from "../src/lib/tsdepend";

describe("DependencyAnalyzer e2e", () => {
  it("same as above, but using a configuration file as single source of truth.", async () => {
    const architecture = await Tsdepend.layeredArchitectureFromConfig();
    await expect(architecture).toMatchRulesfromConfig();
  });
});
```

#### Custom Jest Matcher

##### toHaveNoDependencyCycles()

Analyzes the given source set for dependency cycles.

**Kind**: async jest matcher

**Usage:** Should be used togehter with `Tsdepend#from`:

```ts
await expect(Tsdepend.from("src/**/*.ts")).toHaveNoDependencyCycles();
```

##### dependsUpon(...filePatterns: string[])

**Kind**: async jest matcher

| Param        | Type                         | Description                                                     |
| ------------ | ---------------------------- | --------------------------------------------------------------- |
| filePatterns | list of <code>strings</code> | Comma seperated list of file patterns, using the glob notation. |

**Usage:** Should be used togehter with `Tsdepend#from`:

```ts
// verify that our cli uses our implementation
await expect(Tsdepend.from("src/cli/**/*.ts")).dependsUpon("src/lib/**/*.ts");
// but we should not use cli stuff in our lib implementation:
await expect(Tsdepend.from("src/lib/**/*.ts")).not.dependsUpon(
  "src/cli/**/*.ts"
);
```

##### mayBeAccessedByAnyLayer()

**Kind**: async jest matcher

**Usage:** Should be used togehter with `LayeredArchitecture#getLayer` and always with `.not`:

```ts
// load layered architecture definition from config, can also be defined within the test, using `Tsdepend#defineLayeredArchitecture`
const architecture = await Tsdepend.layeredArchitectureFromConfig();
await expect(architecture.getLayer("name"))
  // use .not.mayBeAccessedByAnyLayer() to make sure, that no other layer is accessing this layer
  .not.mayBeAccessedByAnyLayer();
```

##### mayOnlyBeAccessedByLayers(...layerNames: string[])

**Kind**: async jest matcher

| Param      | Type                         | Description                                                                                                          |
| ---------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| layerNames | list of <code>strings</code> | Comma seperated list of layer names that are allowed to access the layer that is passed to the `expect(layer)` call. |

**Usage:** Should be used togehter with `LayeredArchitecture#getLayer`:

```ts
// load layered architecture definition from config, can also be defined within the test, using `Tsdepend#defineLayeredArchitecture`
const architecture = await Tsdepend.layeredArchitectureFromConfig();
await expect(architecture.getLayer("name")).mayOnlyBeAccessedByLayers(
  "other",
  "layer"
);
```

##### toMatchRulesfromConfig(configFilePath?: string)

**Kind**: async jest matcher

| Param          | Type                | Description                                                                                                                               |
| -------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| configFilePath | <code>string</code> | `optional` Path to the tsdepend config file which should be used. If not provided tsdepend will search for a config file in your project. |

**Usage:** Should be used togehter with `Tsdepend#layeredArchitectureFromConfig`:

```ts
const architecture = await Tsdepend.layeredArchitectureFromConfig();
await expect(architecture).toMatchRulesfromConfig();
```

---

## License & Authors

If you would like to see the detailed LICENSE click [here](LICENSE).

- Author: Alexander Bartes <alexander.bartels@ibm.com>

```text
Copyright:: 2020 IBM, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

[issues]: https://github.com/IBM/repo-template/issues/new
