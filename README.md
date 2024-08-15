<h1 align="center">Home Run</h1>

<p align="center">Configure local development environments for Azure apps with one command</p>

<p align="center">
    <a href="https://github.com/investec/home-run/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42" /></a>
    <a href="https://codecov.io/gh/investec/home-run" target="_blank"><img alt="🧪 Coverage" src="https://img.shields.io/codecov/c/github/investec/home-run?label=%F0%9F%A7%AA%20coverage" /></a>
    <a href="https://github.com/investec/home-run/blob/main/LICENSE.md" target="_blank"><img alt="📝 License: MIT" src="https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg"></a>
    <a href="http://npmjs.com/package/home-run"><img alt="📦 npm version" src="https://img.shields.io/npm/v/home-run?color=21bb42&label=%F0%9F%93%A6%20npm" /></a>
    <img alt="💪 TypeScript: Strict" src="https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg" />
</p>

Setting up a local development environment so that you can develop and test your Azure apps locally can be a pain. `home-run` is a CLI tool that makes it easy to configure your local development environment for Azure apps with one command.

## Usage

To execute `home-run` you will need to be logged into the [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/) with `az login`.

`home-run` has two modes of operation:

1. Specify Azure resources explicitly
2. Use Azure tags to determine Azure resources

### Specify Azure resources explicitly

In this mode you specify the Azure subscription, resource group, type of app, and the location of the app on your local machine. Consider the following example:

```bash
az login
npx @investec/home-run --mode explicit --subscriptionName our-subscription --resourceGroupName rg-our-resource-group --type containerapp --name ca-ourapp-dev --appLocation ./src/MyContainerApp
```

Given the above command, `home-run` will look for a resource group called `rg-our-resource-group` and will look for a `containerapp` with the name `ca-ourapp-dev`. If it finds a match, it will configure the local development environment for that app.

### One app per resource group with git branch tags

This mode is useful when you have a single app per resource group and you want to use git branch tags to determine the Azure resources to use. This is an alternative to specifying the Azure resources explicitly. It will look for the type of resource you are interested in (e.g. `containerapp`) and will look for a [`Branch` tag](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/tag-resources) on the resource (e.g. `main`) which matches the current git branch name. Consider the following example:

```bash
az login
npx @investec/home-run --mode resourcegroup --subscriptionName our-subscription --resourceGroupName rg-our-resource-group --type containerapp --appLocation ./src/MyContainerApp
```

Given the above command, `home-run` will look for a resource group called `rg-our-resource-group` and will look for a `containerapp` with a `Branch` tag that matches the current git branch name. If it finds a match, it will configure the local development environment for that app.

## Options

- `-m` | `--mode` (`explicit | resourcegroup`): - whether to pass explicit resource names, or look for resources in the resource group matching the branch name
- `-t` | `--type` (`functionapp | containerapp`): The type of resource to generate settings for
- `-l` | `--appLocation` (`string`): The location of the app, and the directory where the settings file will be generated eg `./src/MyContainerApp`
- `-s` | `--subscriptionName` (`string`): The name of the subscription where the resources are located eg `our-subscription`
- `-r` | `--resourceGroupName` (`string`): The name of the resource group where the resources are located eg `rg-our-resource-group`
- `-n` | `--name` (`string`): The explicit name of the Azure resource eg `ca-ourapp-dev` (the type of resource is determined by the type option) _required if mode is explicit_
- `-k` | `--keyVaultName` (`string`): Allows users to supply an explicit key vault name - if not supplied when in resource group mode, the key vault name will be inferred from the branch resources _required if mode is explicit_
- `-b` | `--branchName` (`string`): Allows users to supply an explicit branch name - if not supplied, the current git branch will be used
- `-v` | `--version`: Show version
- `-h` | `--help`: Show help

## Credits

- This package was inspired by a [Jamie McCrindle](https://github.com/jamiemccrindle)'s prior art.
- This project was templated with [`create-typescript-app`](https://github.com/JoshuaKGoldberg/create-typescript-app).
