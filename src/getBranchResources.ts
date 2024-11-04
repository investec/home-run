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

import { getSubscription } from "./getSubscription.js";
import { logAsJson, logLine } from "./shared/cli/lines.js";

export async function getBranchResources(args: {
  branchName: string;
  resourceGroupName: string;
  subscriptionName: string;
}): Promise<ResourceTypeAndName[]> {
  logLine(`Getting branch resources for:`);
  logLine(`- Subscription: ${args.subscriptionName}`);
  logLine(`- Resource Group: ${args.resourceGroupName}`);
  logLine(`- BranchName: ${args.branchName}`);
  logLine();

  const credentials = new DefaultAzureCredential();
  const subscription = await getSubscription({
    credentials,
    subscriptionName: args.subscriptionName,
  });

  if (!subscription.subscriptionId) {
    throw new Error(
      `Could not find subscription with name ${args.subscriptionName}`,
    );
  }

  const resourceClient = new ResourceManagementClient(
    credentials,
    subscription.subscriptionId,
  );

  const resourceGroup = await resourceClient.resourceGroups.get(
    args.resourceGroupName,
  );

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!resourceGroup) {
    throw new Error(
      `Could not find resource group with name ${args.resourceGroupName}`,
    );
  }

  const branchResources = resourceClient.resources.listByResourceGroup(
    args.resourceGroupName,
  );

  const branchResourcesArray: GenericResourceExpanded[] = [];
  for await (const branchResource of branchResources) {
    if (
      branchResource.tags?.Branch?.endsWith(args.branchName) ||
      branchResource.tags?.branch?.endsWith(args.branchName)
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
}: {
  branchName: string | undefined;
  keyVaultName: string | undefined;
  mode: "explicit" | "resourcegroup";
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

  if (mode === "resourcegroup" && (!name || !keyVaultName)) {
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

interface ResourceTypeAndName {
  name: string;
  type: string;
}
