import { DefaultAzureCredential } from "@azure/identity";
import { promises as fs } from "fs";

import { getSubscription } from "./getSubscription.js";
import { makeNestedSettings } from "./nestedSettings.js";
import { functionAppAppSettingsProvider } from "./providers/functionAppAppSettingsProvider.js";
import { keyVaultProvider } from "./providers/keyVaultProvider.js";

export async function generateSettingsFunctionApp(args: {
  appLocation: string;
  functionAppName: string;
  keyVaultName: string | undefined;
  resourceGroupName: string;
  subscriptionName: string;
}) {
  console.log(`
Generating Function App settings for:
- Subscription: ${args.subscriptionName}
- Resource Group: ${args.resourceGroupName}
- AppLocation: ${args.appLocation}
- FunctionAppName: ${args.functionAppName}
- KeyVaultName: ${args.keyVaultName ?? ""}
`);

  const credentials = new DefaultAzureCredential();
  const subscription = await getSubscription({
    credentials,
    subscriptionName: args.subscriptionName,
  });

  const appConfig = await functionAppAppSettingsProvider.getSettings({
    credentials,
    functionAppName: args.functionAppName,
    resourceGroupName: args.resourceGroupName,
    subscription,
  });

  console.log("appConfig", appConfig);
  console.log();

  const keyVaultSettings = args.keyVaultName
    ? await keyVaultProvider.getSettings({
        credentials,
        keyVaultName: args.keyVaultName,
      })
    : {};

  console.log("keyVaultSettings", keyVaultSettings);
  console.log();

  const appSettings = makeNestedSettings({
    delimiter: keyVaultProvider.nestingDelimiter,
    rawSettings: keyVaultSettings,
    settings: makeNestedSettings({
      delimiter: functionAppAppSettingsProvider.nestingDelimiter,
      rawSettings: appConfig,
      settings: {},
    }),
  });

  const localSettings = {
    IsEncrypted: false,
    Values: appSettings,
  };

  console.log("localSettings", localSettings);
  console.log();

  const path = `${args.appLocation}/local.settings.json`;
  console.log(`Generating settings file at ${path}:`);

  await fs.writeFile(path, JSON.stringify(localSettings, null, 2));
}
