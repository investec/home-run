/**
 * Copyright (c) Investec
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import {
  type GenericResourceExpanded,
  ResourceManagementClient,
} from "@azure/arm-resources";
import { DefaultAzureCredential } from "@azure/identity";
import { simpleGit } from "simple-git";

import type { Logger } from "./shared/cli/logger.js";

import { getSubscription } from "./getSubscription.js";

export async function getBranchResources({
  branchName,
  resourceGroupName,
  subscriptionName,
  logger,
}: {
  branchName: string;
  resourceGroupName: string;
  subscriptionName: string;
  logger: Logger;
}): Promise<ResourceTypeAndName[]> {
  logger.info(`Getting branch resources for:
- Subscription: ${subscriptionName}
- Resource Group: ${resourceGroupName}
- BranchName: ${branchName}
`);

  const credentials = new DefaultAzureCredential();
  const subscription = await getSubscription({
    credentials,
    subscriptionName,
  });

  if (!subscription.subscriptionId) {
    throw new Error(
      `Could not find subscription with name ${subscriptionName}`,
    );
  }

  const resourceClient = new ResourceManagementClient(
    credentials,
    subscription.subscriptionId,
  );

  const resourceGroup =
    await resourceClient.resourceGroups.get(resourceGroupName);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!resourceGroup) {
    throw new Error(
      `Could not find resource group with name ${resourceGroupName}`,
    );
  }

  const branchResources =
    resourceClient.resources.listByResourceGroup(resourceGroupName);

  const branchResourcesArray: GenericResourceExpanded[] = [];
  for await (const branchResource of branchResources) {
    if (
      // Azure SDK types don't match runtime reality - tags can be undefined
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      branchResource.tags?.Branch?.endsWith(branchName) ||
      // Azure SDK types don't match runtime reality - tags can be undefined
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      branchResource.tags?.branch?.endsWith(branchName)
    ) {
      branchResourcesArray.push(branchResource);
    }
  }

  const resourceTypeAndName = branchResourcesArray.map((branchResource) => ({
    name: branchResource.name ?? "[NO NAME]",
    type: branchResource.type ?? "[NO TYPE]",
  }));

  return resourceTypeAndName;
}

// Useful links:
// https://azure.github.io/azure-sdk/releases/latest/js.html
// https://github.com/Azure/azure-sdk-for-js/blob/main/documentation/next-generation-quickstart.md#example-creating-a-resource-group

export async function getResourceNameAndKeyVaultResourceName({
  branchName,
  keyVaultName,
  mode,
  name,
  resourceGroupName,
  subscriptionName,
  type,
  logger,
}: {
  branchName: string | undefined;
  keyVaultName: string | undefined;
  mode: "explicit" | "resourcegroup";
  name: string | undefined;
  resourceGroupName: string;
  subscriptionName: string;
  type: string;
  logger: Logger;
}): Promise<{
  keyVaultResourceName: string;
  resourceName: string;
}> {
  let resourceName = name ?? "";
  let keyVaultResourceName = keyVaultName ?? "";

  if (mode === "resourcegroup" && (!name || !keyVaultName)) {
    const git = simpleGit();
    const gitBranch = await git.branchLocal();
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const gitBranchName = branchName || gitBranch.current;

    const branchResources = await getBranchResources({
      branchName: gitBranchName,
      resourceGroupName,
      subscriptionName,
      logger,
    });
    logger.info();
    logger.info(`Branch resources for ${gitBranchName}`);
    logger.info(JSON.stringify(branchResources, null, 2));

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

interface ResourceTypeAndName {
  name: string;
  type: string;
}
