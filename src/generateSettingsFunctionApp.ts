/**
 * Copyright (c) Investec
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { DefaultAzureCredential } from "@azure/identity";
import chalk from "chalk";
import { promises as fs } from "fs";
import path from "node:path";

import type { Logger } from "./shared/cli/logger.js";

import { getSubscription } from "./getSubscription.js";
import { makeNestedSettings } from "./nestedSettings.js";
import { functionAppAppSettingsProvider } from "./providers/functionAppAppSettingsProvider.js";
import { keyVaultProvider } from "./providers/keyVaultProvider.js";

export async function generateSettingsFunctionApp({
  appLocation,
  functionAppName,
  keyVaultName,
  resourceGroupName,
  subscriptionName,
  logger,
}: {
  appLocation: string;
  functionAppName: string;
  keyVaultName: string | undefined;
  resourceGroupName: string;
  subscriptionName: string;
  logger: Logger;
}) {
  logger.info(`Generating Function App settings for:
- Subscription: ${subscriptionName}
- Resource Group: ${resourceGroupName}
- AppLocation: ${appLocation}
- FunctionAppName: ${functionAppName}
- KeyVaultName: ${keyVaultName ?? ""}
`);

  const credentials = new DefaultAzureCredential();
  const subscription = await getSubscription({
    credentials,
    subscriptionName,
  });

  const appSettings = await functionAppAppSettingsProvider.getSettings({
    credentials,
    functionAppName,
    resourceGroupName,
    subscription,
    logger,
  });

  logger.info();
  logger.info(`${chalk.bold("appSettings")}:`);
  logger.info(JSON.stringify(appSettings, null, 2));
  logger.info();

  const keyVaultSettings = keyVaultName
    ? await keyVaultProvider.getSettings({
        credentials,
        keyVaultName,
        logger,
      })
    : {};

  logger.info();
  logger.info(`${chalk.bold("keyVaultSettings")}:`);
  logger.info(JSON.stringify(keyVaultSettings, null, 2));
  logger.info();

  const settings = makeNestedSettings({
    delimiter: keyVaultProvider.nestingDelimiter,
    rawSettings: keyVaultSettings,
    settings: makeNestedSettings({
      delimiter: functionAppAppSettingsProvider.nestingDelimiter,
      rawSettings: appSettings,
      settings: {},
    }),
  });

  const localSettings = {
    IsEncrypted: false,
    Values: settings,
  };

  logger.info();
  logger.info(`${chalk.bold("generated configuration")}:`);
  logger.info(JSON.stringify(localSettings, null, 2));
  logger.info();

  const localSettingsPath = path.resolve(
    process.cwd(),
    appLocation,
    "local.settings.json",
  );
  logger.success(
    `Generating settings file at ${localSettingsPath} - DO NOT COMMIT THIS FILE IF IT CONTAINS SECRETS!`,
  );

  await fs.writeFile(localSettingsPath, JSON.stringify(localSettings, null, 2));
}
