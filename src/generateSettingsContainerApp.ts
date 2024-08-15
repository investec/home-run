/**
 * Copyright (c) Investec
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { DefaultAzureCredential } from "@azure/identity";
import chalk from "chalk";
import { promises as fs } from "fs";

import { getSubscription } from "./getSubscription.js";
import { makeNestedSettings } from "./nestedSettings.js";
import { containerAppEnvironmentVariablesProvider } from "./providers/containerAppEnvironmentVariablesProvider.js";
import { keyVaultProvider } from "./providers/keyVaultProvider.js";
import { logAsJson, logLine } from "./shared/cli/lines.js";

export async function generateSettingsContainerApp(args: {
  appLocation: string;
  containerAppName: string;
  keyVaultName: string | undefined;
  resourceGroupName: string;
  subscriptionName: string;
}) {
  logLine(`Generating Container App settings for:`);
  logLine(`- Subscription: ${args.subscriptionName}`);
  logLine(`- Resource Group: ${args.resourceGroupName}`);
  logLine(`- AppLocation: ${args.appLocation}`);
  logLine(`- ContainerAppName: ${args.containerAppName}`);
  logLine(`- KeyVaultName: ${args.keyVaultName ?? ""}`);
  logLine();

  const credentials = new DefaultAzureCredential();
  const subscription = await getSubscription({
    credentials,
    subscriptionName: args.subscriptionName,
  });

  const environmentVariables =
    await containerAppEnvironmentVariablesProvider.getSettings({
      containerAppName: args.containerAppName,
      credentials,
      resourceGroupName: args.resourceGroupName,
      subscription,
    });

  logLine();
  logLine(`${chalk.bold("environmentVariables")}:`);
  logAsJson(environmentVariables);
  logLine();

  const keyVaultSettings = args.keyVaultName
    ? await keyVaultProvider.getSettings({
        credentials,
        keyVaultName: args.keyVaultName,
      })
    : {};

  logLine();
  logLine(`${chalk.bold("keyVaultSettings")}:`);
  logAsJson(keyVaultSettings);
  logLine();

  const appSettings = makeNestedSettings({
    delimiter: keyVaultProvider.nestingDelimiter,
    rawSettings: keyVaultSettings,
    settings: makeNestedSettings({
      delimiter: containerAppEnvironmentVariablesProvider.nestingDelimiter,
      rawSettings: environmentVariables,
      settings: {},
    }),
  });

  logLine();
  logLine(`${chalk.bold("generated configuration")}:`);
  logAsJson(appSettings);
  logLine();

  const appSettingsDevelopmentPath = `${args.appLocation}/appsettings.Development.json`;
  logLine(
    `Generating settings file at ${appSettingsDevelopmentPath} - DO NOT COMMIT THIS FILE IF IT CONTAINS SECRETS!`,
  );

  await fs.writeFile(
    appSettingsDevelopmentPath,
    JSON.stringify(appSettings, null, 2),
  );
}
