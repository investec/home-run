import {
  simpleGit,
  // type SimpleGit, type CleanOptions
} from "simple-git";

import { generateSettingsContainerApp } from "./generateSettingsContainerApp.js";
import { generateSettingsFunctionApp } from "./generateSettingsFunctionApp.js";
import { getBranchResources } from "./getBranchResources.js";

// Useful links:
// https://azure.github.io/azure-sdk/releases/latest/js.html
// https://github.com/Azure/azure-sdk-for-js/blob/main/documentation/next-generation-quickstart.md#example-creating-a-resource-group

/*
const parser = yargs(process.argv.slice(2)).options({
  subscriptionName: {
    type: "string",
    demandOption: true,
    alias: "s",
    description: "The name of the subscription",
  },
  resourceGroupName: {
    type: "string",
    demandOption: true,
    alias: "rg",
    description: "The name of the resource group",
  },
  appLocation: {
    type: "string",
    demandOption: true,
    alias: "p",
    description: "The location of the app eg ../ZebraGptFunctionApp/",
  },
  type: {
    choices: ["functionapp", "containerapp"],
    demandOption: true,
    alias: "t",
  },
  name: {
    type: "string",
    demandOption: false,
    alias: "n",
    description: "The name of the app e.g. zebragpt",
  },
  keyVaultName: { type: "string", alias: "kv" },
  branchName: { type: "string", alias: "b" },
});

(async () => {
  const {
    subscriptionName,
    resourceGroupName,
    type,
    name,
    appLocation,
    keyVaultName,
    branchName,
  } = await parser.argv;

  const { resourceName, keyVaultResourceName } =
    await getResourceNameAndKeyVaultResourceName({
      name,
      keyVaultName,
      subscriptionName,
      resourceGroupName,
      type,
      branchName,
    });

  if (type === "functionapp") {
    await generateSettingsFunctionApp({
      subscriptionName,
      resourceGroupName,
      appLocation,
      functionAppName: resourceName,
      keyVaultName: keyVaultResourceName,
    });
  } else if (type === "containerapp") {
    await generateSettingsContainerApp({
      subscriptionName,
      resourceGroupName,
      appLocation,
      containerAppName: resourceName,
      keyVaultName: keyVaultResourceName,
    });
  }
})();
*/

async function getResourceNameAndKeyVaultResourceName({
  branchName,
  keyVaultName,
  name,
  resourceGroupName,
  subscriptionName,
  type,
}: {
  branchName: string | undefined;
  keyVaultName: string | undefined;
  name: string | undefined;
  resourceGroupName: string;
  subscriptionName: string;
  type: string;
}): Promise<{
  keyVaultResourceName: string;
  resourceName: string;
}> {
  let resourceName = name ?? "";
  let keyVaultResourceName = keyVaultName ?? "";
  if (!name || !keyVaultName) {
    const git = simpleGit();
    const gitBranch = await git.branchLocal();
    const gitBranchName = branchName || gitBranch.current;

    const branchResources = await getBranchResources({
      branchName: gitBranchName,
      resourceGroupName,
      subscriptionName,
    });
    console.log(`Branch resources for ${gitBranchName}`, branchResources);

    if (type === "functionapp") {
      const functionAppResource = branchResources.find(
        (resource) => resource.type === "Microsoft.Web/sites",
      );
      resourceName = functionAppResource?.name ?? resourceName;
    } else if (type === "containerapp") {
      const containerAppResource = branchResources.find(
        (resource) => resource.type === "Microsoft.App/containerApps",
      );
      resourceName = containerAppResource?.name ?? resourceName;
    }

    const keyVaultResource = branchResources.find(
      (resource) => resource.type === "Microsoft.KeyVault/vaults",
    );
    keyVaultResourceName = keyVaultResource?.name ?? keyVaultResourceName;
  }
  return { keyVaultResourceName, resourceName };
}

export {
  generateSettingsContainerApp,
  generateSettingsFunctionApp,
  getBranchResources,
  getResourceNameAndKeyVaultResourceName,
};
