# Developing

To develop this project, you need to have the following tools installed:

- Node.js
- npm
- pnpm

To test `npx` mode locally, run:

```sh
pnpm run build
az login
npx . --mode resourcegroup --subscriptionName ice-arch-eng --resourceGroupName rg-zebra-gpt-dev-001 --type containerapp --appLocation ../../dev.azure.com/investec-cloud-experience/zebra-gpt/src/ZebraGptContainerApp
```

npx ../../../github.com/home-run --mode resourcegroup --subscriptionName ice-arch-eng --resourceGroupName rg-zebra-gpt-dev-001 --type containerapp --appLocation ./src/ZebraGptContainerApp

npx ../../../github.com/home-run --mode explicit --subscriptionName ice-arch-eng --resourceGroupName rg-zebra-gpt-dev-001 --type containerapp --name ca-zebragpt-dev --appLocation ./src/ZebraGptContainerApp

npm run dev -- --subscriptionName ice-arch-eng --resourceGroupName rg-zebra-gpt-dev-001 --type functionapp --name func-zebragpt-7l4a8lm8ra-dev --appLocation ../ZebraGptFunctionApp
