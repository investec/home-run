<h1 align="center">Home Run</h1>

<p align="center">Configure local development environments for Azure apps with one command</p>

<p align="center">
    <a href="https://github.com/investec/home-run/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42" /></a>
    <a href="https://codecov.io/gh/investec/home-run" target="_blank"><img alt="🧪 Coverage" src="https://img.shields.io/codecov/c/github/investec/home-run?label=%F0%9F%A7%AA%20coverage" /></a>
    <a href="https://github.com/investec/home-run/blob/main/LICENSE.md" target="_blank"><img alt="📝 License: MIT" src="https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg"></a>
    <a href="http://npmjs.com/package/home-run"><img alt="📦 npm version" src="https://img.shields.io/npm/v/home-run?color=21bb42&label=%F0%9F%93%A6%20npm" /></a>
    <img alt="💪 TypeScript: Strict" src="https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg" />
</p>

## Usage

To run `home-run` you will need to be logged into Azure (`az login`).

There's two ways to use home-run:

### Specify Azure resources explicitly

```bash
az login
npm run dev -- --subscriptionName ice-arch-eng --resourceGroupName rg-zebra-gpt-dev-001 --type functionapp --name func-zebragpt-7l4a8lm8ra-dev --appLocation ../ZebraGptFunctionApp
```

### Use tags.branch to determine Azure resources

In this mode home-run will look for a tag on the current branch called `branch` and use that to determine the Azure resources to use using the current local git branch as a comparator.

```bash
az login
npm run dev -- --subscriptionName ice-arch-eng --resourceGroupName rg-zebra-gpt-dev-001 --type containerapp --appLocation ../ZebraGptContainerApp
```

## Credits

- This package was inspired by a [Jamie McCrindle](https://github.com/jamiemccrindle)'s prior art.
- This project was templated with [`create-typescript-app`](https://github.com/JoshuaKGoldberg/create-typescript-app).
