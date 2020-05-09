# Contributing

## Contributing In General

Our project welcomes external contributions. If you have an itch, please feel
free to scratch it.

To contribute code or documentation, please submit a [pull request](https://github.com/ibm/tsdepend/pulls).

A good way to familiarize yourself with the codebase and contribution process is
to look for and tackle low-hanging fruit in the [issue tracker](https://github.com/ibm/tsdepend/issues).
Before embarking on a more ambitious contribution, please quickly [get in touch](#communication) with us.

**Note: We appreciate your effort, and want to avoid a situation where a contribution
requires extensive rework (by you or by us), sits in backlog for a long time, or
cannot be accepted at all!**

### Proposing new features

If you would like to implement a new feature, please [raise an issue](https://github.com/ibm/tsdepend/issues)
before sending a pull request so the feature can be discussed. This is to avoid
you wasting your valuable time working on a feature that the project developers
are not interested in accepting into the code base.

### Fixing bugs

If you would like to fix a bug, please [raise an issue](https://github.com/ibm/tsdepend/issues) before sending a
pull request so it can be tracked.

### Merge approval

The project maintainers use LGTM (Looks Good To Me) in comments on the code
review to indicate acceptance. A change requires LGTMs from one of the
maintainers of each component affected.

For a list of the maintainers, see the [MAINTAINERS.md](MAINTAINERS.md) page.

## Legal

Each source file must include a license header for the Apache
Software License 2.0. Using the SPDX format is the simplest approach.
e.g.

```js
/*
Copyright <holder> All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/
```

We have tried to make it as easy as possible to make contributions. This
applies to how we handle the legal aspects of contribution. We use the
same approach - the [Developer's Certificate of Origin 1.1 (DCO)](https://github.com/hyperledger/fabric/blob/master/docs/source/DCO1.1.txt) - that the Linux® Kernel [community](https://elinux.org/Developer_Certificate_Of_Origin)
uses to manage code contributions.

We simply ask that when submitting a patch for review, the developer
must include a sign-off statement in the commit message.

Here is an example Signed-off-by line, which indicates that the
submitter accepts the DCO:

```text
Signed-off-by: John Doe <john.doe@example.com>
```

You can include this automatically when you commit a change to your
local git repository using the following command:

```shell
git commit -s
```

## Communication

Please feel free to connect with us using the [issue tracker](https://github.com/ibm/tsdepend/issues).

---

## Setup

:warning: Note that this project uses the `yarn` package manager.
After forking and cloning the repository you have to install the dependencies using `yarn install`.

If everything was successful, try building the project using `yarn build`.

## Testing

After the [setup](#setup) is completed you can develop your changes and test everything using `yarn test`.
If you want to see the test coverage, you can use the `yarn test:coverage` command.

## Coding style guidelines

Use `git commit -s` to commit your changes. We're using commitizen to make sure the commit message format fits our requirements.
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

---

## Development Workflow - Git Branches

### Infinite lifetime branches
* `origin/master`- always production ready and will be released to NPM automatically with each merged PR
* `origin/next` - like master this branch should always be stable, but will contain preview features and breaking changes. We will collect breaking changes here to minimize version dumps and to try new things out. After a PR is merged the `tsdepend@next` version will be updated at NPM. Once we think we are ready for a new major version, we will merge the next branch into master. This has do be done manually and through a PR. To keep this branch always up to date, the changes from master should be incorporated on a regular basis.

### Limited lifetime branches
* **Feature branches**: use feature branches (Pattern: `feat/<name>`) to develop new things. Once you're ready, raise a PR against master or next, depending on the type of change.
* **Bugfix branches**: use bugfix branches to fix bugs (Pattern: `fix/<name>`). Once you're ready, raise a PR against master or next.
* **Chore branches**:  use chore branches (Pattern: `fix/<name>`), if you enhance our documentation or adding testcases. Once you're ready, raise a PR against master or next.


---

## Releases

A new releases is created after every merge to the master branch. All releases are created with https://semantic-release.gitbook.io/semantic-release/ even the @next releases. 
To make sure this works correctly, please use the meaningful commit messages.
The Changelog is also automatically generated and published to the repositories release page.

### @next Release
we use dist tags do distribute our preview for the upcomming version: https://docs.npmjs.com/cli/dist-tag
with @next you always get the prerelease for the upcomming version. This might include breaking changes!


