import { DefaultAzureCredential } from "@azure/identity";
import { promises as fs } from "fs";

import { getSubscription } from "./getSubscription.js";
import { makeNestedSettings } from "./nestedSettings.js";
import { containerAppEnvironmentVariablesProvider } from "./providers/containerAppEnvironmentVariablesProvider.js";
import { keyVaultProvider } from "./providers/keyVaultProvider.js";

export async function generateSettingsContainerApp(args: {
  appLocation: string;
  containerAppName: string;
  keyVaultName: string | undefined;
  resourceGroupName: string;
  subscriptionName: string;
}) {
  console.log(`
Generating Container App settings for:
- Subscription: ${args.subscriptionName}
- Resource Group: ${args.resourceGroupName}
- AppLocation: ${args.appLocation}
- ContainerAppName: ${args.containerAppName}
- KeyVaultName: ${args.keyVaultName ?? ""}
`);

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

  console.log("environmentVariables", environmentVariables);
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
      delimiter: containerAppEnvironmentVariablesProvider.nestingDelimiter,
      rawSettings: environmentVariables,
      settings: {},
    }),
  });

  console.log("appSettings", appSettings);
  console.log();

  const appSettingsDevelopmentPath = `${args.appLocation}/appsettings.Development.json`;
  console.log(`Generating settings file at ${appSettingsDevelopmentPath}:`);

  await fs.writeFile(
    appSettingsDevelopmentPath,
    JSON.stringify(appSettings, null, 2),
  );
}
