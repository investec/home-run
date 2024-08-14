import {
  type GenericResourceExpanded,
  ResourceManagementClient,
} from "@azure/arm-resources";
import { DefaultAzureCredential } from "@azure/identity";

import { getSubscription } from "./getSubscription.js";

export async function getBranchResources(args: {
  branchName: string;
  resourceGroupName: string;
  subscriptionName: string;
}): Promise<ResourceTypeAndName[]> {
  console.log(`
Getting branch resources for:
- Subscription: ${args.subscriptionName}
- Resource Group: ${args.resourceGroupName}
- BranchName: ${args.branchName}
`);

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
