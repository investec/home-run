import { promises as fs } from "fs";
import { DefaultAzureCredential } from "@azure/identity";
import { functionAppAppSettingsProvider } from "./providers/functionAppAppSettingsProvider.js";
import { getSubscription } from "./getSubscription.js";
import { keyVaultProvider } from "./providers/keyVaultProvider.js";
import { makeNestedSettings } from "./nestedSettings.js";

export async function generateSettingsFunctionApp(args: {
  subscriptionName: string;
  resourceGroupName: string;
  appLocation: string;
  functionAppName: string;
  keyVaultName: string | undefined;
}) {
  console.log(`
Generating Function App settings for:
- Subscription: ${args.subscriptionName}
- Resource Group: ${args.resourceGroupName}
- AppLocation: ${args.appLocation}
- FunctionAppName: ${args.functionAppName}
- KeyVaultName: ${args.keyVaultName}
`);

  const credentials = new DefaultAzureCredential();
  const subscription = await getSubscription({
    credentials,
    subscriptionName: args.subscriptionName,
  });

  const appConfig = await functionAppAppSettingsProvider.getSettings({
    functionAppName: args.functionAppName,
    resourceGroupName: args.resourceGroupName,
    credentials,
    subscription,
  });

  console.log("appConfig", appConfig);
  console.log();

  const keyVaultSettings = args.keyVaultName
    ? await keyVaultProvider.getSettings({
        keyVaultName: args.keyVaultName,
        credentials,
      })
    : {};

  console.log("keyVaultSettings", keyVaultSettings);
  console.log();

  const appSettings = makeNestedSettings({
    rawSettings: keyVaultSettings,
    delimiter: keyVaultProvider.nestingDelimiter,
    settings: makeNestedSettings({
      rawSettings: appConfig,
      delimiter: functionAppAppSettingsProvider.nestingDelimiter,
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
