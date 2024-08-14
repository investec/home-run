import { promises as fs } from "fs";
import { DefaultAzureCredential } from "@azure/identity";
import { keyVaultProvider } from "./providers/keyVaultProvider.js";
import { containerAppEnvironmentVariablesProvider } from "./providers/containerAppEnvironmentVariablesProvider.js";
import { getSubscription } from "./getSubscription.js";
import { makeNestedSettings } from "./nestedSettings.js";

export async function generateSettingsContainerApp(args: {
  subscriptionName: string;
  resourceGroupName: string;
  appLocation: string;
  containerAppName: string;
  keyVaultName: string | undefined;
}) {
  console.log(`
Generating Container App settings for:
- Subscription: ${args.subscriptionName}
- Resource Group: ${args.resourceGroupName}
- AppLocation: ${args.appLocation}
- ContainerAppName: ${args.containerAppName}
- KeyVaultName: ${args.keyVaultName}
`);

  const credentials = new DefaultAzureCredential();
  const subscription = await getSubscription({
    credentials,
    subscriptionName: args.subscriptionName,
  });

  const environmentVariables =
    await containerAppEnvironmentVariablesProvider.getSettings({
      resourceGroupName: args.resourceGroupName,
      containerAppName: args.containerAppName,
      credentials,
      subscription,
    });

  console.log("environmentVariables", environmentVariables);
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
      rawSettings: environmentVariables,
      delimiter: containerAppEnvironmentVariablesProvider.nestingDelimiter,
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
