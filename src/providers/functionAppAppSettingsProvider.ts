/**
 * Copyright (c) Investec
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import type { Subscription } from "@azure/arm-subscriptions";
import type { DefaultAzureCredential } from "@azure/identity";

import { WebSiteManagementClient } from "@azure/arm-appservice";

import type { Logger } from "../shared/cli/logger.js";
import type { SettingsProvider } from "../types.js";

async function getFunctionAppAppSettings({
  credentials,
  functionAppName,
  resourceGroupName,
  subscription,
  logger,
}: {
  credentials: DefaultAzureCredential;
  functionAppName: string;
  resourceGroupName: string;
  subscription: Subscription;
  logger: Logger;
}): Promise<Record<string, string>> {
  logger.info(`Getting function: ${functionAppName}`);

  if (!subscription.subscriptionId) {
    throw new Error("subscriptionId is undefined");
  }

  const client = new WebSiteManagementClient(
    credentials,
    subscription.subscriptionId,
  );

  const app = await client.webApps.get(resourceGroupName, functionAppName);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!app) {
    throw new Error(`Could not find app with name ${functionAppName}`);
  }

  const appSettings = await client.webApps.listApplicationSettings(
    resourceGroupName,
    functionAppName,
  );

  if (!appSettings.properties) {
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
