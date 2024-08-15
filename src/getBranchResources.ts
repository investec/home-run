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

import { getSubscription } from "./getSubscription.js";
import { logLine } from "./shared/cli/lines.js";

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
    if (branchResource.tags?.Branch?.endsWith(args.branchName)) {
      branchResourcesArray.push(branchResource);
    }
  }

  const resourceTypeAndName = branchResourcesArray.map((branchResource) => ({
    name: branchResource.name ?? "[NO NAME]",
    type: branchResource.type ?? "[NO TYPE]",
  }));

  return resourceTypeAndName;
}

interface ResourceTypeAndName {
  name: string;
  type: string;
}
