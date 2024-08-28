# Development

To develop this project, you need to have the following tools installed:

- [Node.js](https://nodejs.org/) (and npm)
- [pnpm](https://pnpm.io/)
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/)

After [forking the repo from GitHub](https://help.github.com/articles/fork-a-repo) and [installing pnpm](https://pnpm.io/installation):

```shell
git clone https://github.com/ < your-name-here > /home-run
cd home-run
pnpm install
```

> This repository includes a list of suggested VS Code extensions.
> It's a good idea to use [VS Code](https://code.visualstudio.com) and accept its suggestion to install them, as they'll help with development.

## Running locally

To test `npx` mode locally, run:

```sh
pnpm run build
az login
```

### `explicit` - specify Azure resources explicitly

You can test the `explicit` mode by running:

```sh
npx . --mode explicit --subscriptionName our-subscription --resourceGroupName rg-our-resource-group --type containerapp --name ca-ourapp-dev --keyVaultName kv-ourapp-dev --appLocation [PATH TO YOUR CONTAINER APP]
```

The above two examples will configure the local development environment for the `OurContainerApp` respectively. I'll replace the above examples with something more generic in future.

### `resourcegroup` - one app per resource group with git branch tags

If you're using the `resourcegroup` mode, then there's an implicit expectation that you'll be executing the command from within the directory of the app you're interested in configuring. For example, if you're in the `OurContainerApp` directory, you can run:

```sh
npx [PATH TO HOME RUN] --mode resourcegroup --subscriptionName our-subscription --resourceGroupName rg-our-resource-group --type containerapp --appLocation ./src/OurContainerApp
```

## Building

Run [**tsup**](https://tsup.egoist.dev) locally to build source files from `src/` into output files in `lib/`:

```shell
pnpm build
```

Add `--watch` to run the builder in a watch mode that continuously cleans and recreates `lib/` as you save files:

```shell
pnpm build --watch
```

## Formatting

[Prettier](https://prettier.io) is used to format code.
It should be applied automatically when you save files in VS Code or make a Git commit.

To manually reformat all files, you can run:

```shell
pnpm format --write
```

## Linting

This package includes several forms of linting to enforce consistent code quality and styling.
Each should be shown in VS Code, and can be run manually on the command-line:

- `pnpm lint` ([ESLint](https://eslint.org) with [typescript-eslint](https://typescript-eslint.io)): Lints JavaScript and TypeScript source files
- `pnpm lint:packages` ([pnpm dedupe --check](https://pnpm.io/cli/dedupe)): Checks for unnecessarily duplicated packages in the `pnpm-lock.yml` file

Read the individual documentation for each linter to understand how it can be configured and used best.

For example, ESLint can be run with `--fix` to auto-fix some lint rule complaints:

```shell
pnpm run lint --fix
```

Note that you'll likely need to run `pnpm build` before `pnpm lint` so that lint rules which check the file system can pick up on any built files.

## Testing

[Vitest](https://vitest.dev) is used for tests.
You can run it locally on the command-line:

```shell
pnpm run test
```

Add the `--coverage` flag to compute test coverage and place reports in the `coverage/` directory:

```shell
pnpm run test --coverage
```

Note that [console-fail-test](https://github.com/JoshuaKGoldberg/console-fail-test) is enabled for all test runs.
Calls to `console.log`, `console.warn`, and other console methods will cause a test to fail.

### Debugging Tests

This repository includes a [VS Code launch configuration](https://code.visualstudio.com/docs/editor/debugging) for debugging unit tests.
To launch it, open a test file, then run _Debug Current Test File_ from the VS Code Debug panel (or press F5).

## Type Checking

You should be able to see suggestions from [TypeScript](https://typescriptlang.org) in your editor for all open files.

However, it can be useful to run the TypeScript command-line (`tsc`) to type check all files in `src/`:

```shell
pnpm tsc
```

Add `--watch` to keep the type checker running in a watch mode that updates the display as you save files:

```shell
pnpm tsc --watch
```
