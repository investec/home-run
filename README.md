<h1 align="center">🏠🏃 Home Run</h1>

<p align="center">Configure local development environments for Azure apps with one command</p>

<p align="center">
    <a href="https://github.com/investec/home-run/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42" /></a>
    <a href="https://codecov.io/gh/investec/home-run" target="_blank"><img alt="🧪 Coverage" src="https://img.shields.io/codecov/c/github/investec/home-run?label=%F0%9F%A7%AA%20coverage" /></a>
    <a href="https://github.com/investec/home-run/blob/main/LICENSE.md" target="_blank"><img alt="📝 License: MIT" src="https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg"></a>
    <a href="http://npmjs.com/package/home-run"><img alt="📦 npm version" src="https://img.shields.io/npm/v/home-run?color=21bb42&label=%F0%9F%93%A6%20npm" /></a>
    <img alt="💪 TypeScript: Strict" src="https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg" />
</p>

Setting up a local development environment, so that you can develop and test your Azure apps locally can be a pain. `home-run` is a CLI tool that makes it easy to configure your local development environment for Azure apps with one command.

## Installation

You can use `home-run` by installing it as a `devDependency` like so:

```sh
npm install @investec/home-run --save-dev # npm
pnpm add @investec/home-run --save-dev    # pnpm
yarn add @investec/home-run --dev         # yarn
bun add @investec/home-run --dev          # bun
```

Or use it directly with `npx`.

## Usage

To execute `home-run` you will need to be logged into the [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/) with `az login`.

`home-run` has two modes of operation:

1. `explicit` - specify Azure resources explicitly
2. `resourcegroup` - use Azure tags to determine resources

### `explicit` - specify Azure resources explicitly

In this mode you specify the Azure subscription, resource group, type of Azure resource, the name of your Azure resource, and the location of the app on your local machine. Consider the following example:

```sh
npx @investec/home-run
--mode explicit
--subscriptionName our-subscription
--resourceGroupName rg-our-resource-group
--type containerapp
--name ca-ourapp-dev
--keyVaultName kv-ourapp-dev # optional
--appLocation ./src/OurContainerApp
```

Given the above command, `home-run` will look for a resource group called `rg-our-resource-group` and try to find a `containerapp` inside with the name `ca-ourapp-dev`. If it finds a match, it will create a local development environment configuration file in `./src/OurContainerApp` for that app.

To integrate `home-run` into your `package.json` scripts, you can do something like this:

```json
"scripts": {
    "home-run": "az login && home-run --mode explicit --subscriptionName our-subscription --resourceGroupName rg-our-resource-group --type containerapp --name ca-ourapp-dev --keyVaultName kv-ourapp-dev --appLocation ./src/OurContainerApp"
}
```

Or with `npx`:

```json
"scripts": {
    "home-run": "az login && npx @investec/home-run --mode explicit --subscriptionName our-subscription --resourceGroupName rg-our-resource-group --type containerapp --name ca-ourapp-dev --appLocation ./src/OurContainerApp"
}
```

With the above scripts, you can configure your local development environment with `npm run home-run`.

### `resourcegroup` - use Azure tags to determine resources / multiple versions of an app per resource group with git branch tags

This mode is useful when you have multiple versions of an app per resource group for different branches that exist, and you want to use git branch tags to determine the Azure resources to use. This is an alternative to specifying the Azure resources explicitly. It will look for the type of resource you are interested in (e.g. `containerapp`) and will look for a [`Branch` tag](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/tag-resources) on the resource (e.g. `main`) which matches the current git branch name. Consider the following example:

```sh
npx @investec/home-run
--mode resourcegroup
--subscriptionName our-subscription
--resourceGroupName rg-our-resource-group
--type containerapp
--appLocation ./src/OurContainerApp
```

Given the above command, `home-run` will look for a resource group called `rg-our-resource-group` and will look for a `containerapp` inside with a `Branch` tag that matches the current git branch name, eg `main`. If `home-run` finds a match, it will create a local development environment configuration file in `./src/OurContainerApp` for that branches app.

To integrate `home-run` into your `package.json` scripts, you can do something like this:

```json
"scripts": {
    "home-run": "az login && home-run --mode resourcegroup --subscriptionName our-subscription --resourceGroupName rg-our-resource-group --type containerapp --appLocation ./src/OurContainerApp"
}
```

Or with `npx`:

```json
"scripts": {
    "home-run": "az login && npx @investec/home-run --mode resourcegroup --subscriptionName our-subscription --resourceGroupName rg-our-resource-group --type containerapp --appLocation ./src/OurContainerApp"
}
```

With the above scripts, you can configure your local development environment with `npm run home-run`.

## Options

- `-m` | `--mode` (`explicit | resourcegroup`): - whether to pass explicit resource names, or look for resources in the resource group matching the branch name
- `-t` | `--type` (`functionapp | containerapp`): The type of resource to generate settings for
- `-l` | `--appLocation` (`string`): The location of the app, and the directory where the settings file will be generated eg `./src/OurContainerApp`
- `-s` | `--subscriptionName` (`string`): The name of the subscription where the resources are located eg `our-subscription`
- `-r` | `--resourceGroupName` (`string`): The name of the resource group where the resources are located eg `rg-our-resource-group`
- `-n` | `--name` (`string`): The explicit name of the Azure resource eg `ca-ourapp-dev` (the type of resource is determined by the type option) _required if mode is explicit_
- `-k` | `--keyVaultName` (`string`): Allows users to supply an explicit key vault name - if not supplied when in resource group mode, the key vault name will be inferred from the branch resources _required if mode is explicit_
- `-b` | `--branchName` (`string`): Allows users to supply an explicit branch name - if not supplied, the current git branch will be used
- `-v` | `--version`: Show version
- `-h` | `--help`: Show help

## Contributing

Please see the [contributing guidelines](.github/CONTRIBUTING.md).

## Credits

- This project was templated with [`create-typescript-app`](https://github.com/JoshuaKGoldberg/create-typescript-app).
- This package was inspired by [Jamie McCrindle](https://github.com/jamiemccrindle)'s prior art.
