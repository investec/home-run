import type { Subscription } from "@azure/arm-subscriptions";
import type { DefaultAzureCredential } from "@azure/identity";

import { WebSiteManagementClient } from "@azure/arm-appservice";

import type { SettingsProvider } from "../types.js";

async function getFunctionAppAppSettings({
  credentials,
  functionAppName,
  resourceGroupName,
  subscription,
}: {
  credentials: DefaultAzureCredential;
  functionAppName: string;
  resourceGroupName: string;
  subscription: Subscription;
}): Promise<Record<string, string>> {
  console.log(`Getting function: ${functionAppName}`);

  const client = new WebSiteManagementClient(
    credentials,
    subscription.subscriptionId!,
  );

  const app = await client.webApps.get(resourceGroupName, functionAppName);

  if (!app) {
    throw new Error(`Could not find app with name ${functionAppName}`);
  }

  const appSettings = await client.webApps.listApplicationSettings(
    resourceGroupName,
    functionAppName,
  );

  if (!appSettings?.properties) {
    throw new Error(
      `Could not find application settings with name ${functionAppName}`,
    );
  }

  return appSettings.properties;
}

const delimiter = "__";

export const functionAppAppSettingsProvider = {
  getSettings: getFunctionAppAppSettings,
  nestingDelimiter: delimiter,
} satisfies SettingsProvider;
