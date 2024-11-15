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
import { containerAppEnvironmentVariablesProvider } from "./providers/containerAppEnvironmentVariablesProvider.js";
import { keyVaultProvider } from "./providers/keyVaultProvider.js";

export async function generateSettingsContainerApp({
  appLocation,
  containerAppName,
  keyVaultName,
  resourceGroupName,
  subscriptionName,
  logger,
}: {
  appLocation: string;
  containerAppName: string;
  keyVaultName: string | undefined;
  resourceGroupName: string;
  subscriptionName: string;
  logger: Logger;
}) {
  logger.info(`Generating Container App settings for:
- Subscription: ${subscriptionName}
- Resource Group: ${resourceGroupName}
- AppLocation: ${appLocation}
- ContainerAppName: ${containerAppName}
- KeyVaultName: ${keyVaultName ?? ""}
`);

  const credentials = new DefaultAzureCredential();
  const subscription = await getSubscription({
    credentials,
    subscriptionName,
  });

  const environmentVariables =
    await containerAppEnvironmentVariablesProvider.getSettings({
      containerAppName,
      credentials,
      resourceGroupName,
      subscription,
      logger,
    });

  logger.info();
  logger.info(`${chalk.bold("environmentVariables")}:`);
  logger.info(JSON.stringify(environmentVariables, null, 2));
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
      delimiter: containerAppEnvironmentVariablesProvider.nestingDelimiter,
      rawSettings: environmentVariables,
      settings: {},
    }),
  });

  logger.info();
  logger.info(`${chalk.bold("generated configuration")}:`);
  logger.info(JSON.stringify(settings, null, 2));
  logger.info();

  const appSettingsPath = path.resolve(
    process.cwd(),
    appLocation,
    "appsettings.Development.json",
  );
  logger.success(
    `Generating settings file at ${appSettingsPath} - DO NOT COMMIT THIS FILE IF IT CONTAINS SECRETS!`,
  );

  await fs.writeFile(appSettingsPath, JSON.stringify(settings, null, 2));
}
