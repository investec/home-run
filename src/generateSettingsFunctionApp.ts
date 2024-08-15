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
import { functionAppAppSettingsProvider } from "./providers/functionAppAppSettingsProvider.js";
import { keyVaultProvider } from "./providers/keyVaultProvider.js";
import { logAsJson, logLine } from "./shared/cli/lines.js";

export async function generateSettingsFunctionApp(args: {
  appLocation: string;
  functionAppName: string;
  keyVaultName: string | undefined;
  resourceGroupName: string;
  subscriptionName: string;
}) {
  logLine(`Generating Function App settings for:`);
  logLine(`- Subscription: ${args.subscriptionName}`);
  logLine(`- Resource Group: ${args.resourceGroupName}`);
  logLine(`- AppLocation: ${args.appLocation}`);
  logLine(`- FunctionAppName: ${args.functionAppName}`);
  logLine(`- KeyVaultName: ${args.keyVaultName ?? ""}`);
  logLine();

  const credentials = new DefaultAzureCredential();
  const subscription = await getSubscription({
    credentials,
    subscriptionName: args.subscriptionName,
  });

  const appSettings = await functionAppAppSettingsProvider.getSettings({
    credentials,
    functionAppName: args.functionAppName,
    resourceGroupName: args.resourceGroupName,
    subscription,
  });

  logLine();
  logLine(`${chalk.bold("appSettings")}:`);
  logAsJson(appSettings);
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

  logLine();
  logLine(`${chalk.bold("generated configuration")}:`);
  logAsJson(localSettings);
  logLine();

  const localSettingsPath = `${args.appLocation}/local.settings.json`;
  logLine(
    `Generating settings file at ${localSettingsPath} - DO NOT COMMIT THIS FILE IF IT CONTAINS SECRETS!`,
  );

  await fs.writeFile(localSettingsPath, JSON.stringify(localSettings, null, 2));
}
