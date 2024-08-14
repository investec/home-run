# Developing

To develop this project, you need to have the following tools installed:

- Node.js
- npm
- pnpm

To test `npx` mode locally, run:

```sh
pnpm run build
az login
npx . --subscriptionName ice-arch-eng --resourceGroupName rg-zebra-gpt-dev-001 --type containerapp --appLocation ../../dev.azure.com/investec-cloud-experience/zebra-gpt/src/ZebraGptContainerApp
```

npx ../../../github.com/home-run --subscriptionName ice-arch-eng --resourceGroupName rg-zebra-gpt-dev-001 --type containerapp --appLocation ./src/ZebraGptContainerApp
