/**
 * Copyright (c) Investec
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { simpleGit } from "simple-git";

import { generateSettingsContainerApp } from "./generateSettingsContainerApp.js";
import { generateSettingsFunctionApp } from "./generateSettingsFunctionApp.js";
import { getBranchResources } from "./getBranchResources.js";
import { logAsJson, logLine } from "./shared/cli/lines.js";

// Useful links:
// https://azure.github.io/azure-sdk/releases/latest/js.html
// https://github.com/Azure/azure-sdk-for-js/blob/main/documentation/next-generation-quickstart.md#example-creating-a-resource-group

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
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const gitBranchName = branchName || gitBranch.current;

    const branchResources = await getBranchResources({
      branchName: gitBranchName,
      resourceGroupName,
      subscriptionName,
    });
    logLine();
    logLine(`Branch resources for ${gitBranchName}`);
    logAsJson(branchResources);

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
