import type { Subscription } from "@azure/arm-subscriptions";
import type { DefaultAzureCredential } from "@azure/identity";

import { ContainerAppsAPIClient } from "@azure/arm-appcontainers";

import type { SettingsProvider } from "../types.js";

// https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/?view=aspnetcore-6.0
// The : separator doesn't work with environment variable hierarchical keys on all platforms. __, the double underscore, is

async function getContainerAppEnvironmentVariables({
  containerAppName,
  credentials,
  resourceGroupName,
  subscription,
}: {
  containerAppName: string;
  credentials: DefaultAzureCredential;
  resourceGroupName: string;
  subscription: Subscription;
}): Promise<Record<string, string>> {
  console.log(`Getting container app: ${containerAppName}`);

  const client = new ContainerAppsAPIClient(
    credentials,
    subscription.subscriptionId!,
  );

  const app = await client.containerApps.get(
    resourceGroupName,
    containerAppName,
  );

  if (!app) {
    throw new Error(`Could not find app with name ${containerAppName}`);
  }

  const theContainerWeCareAbout = app.template?.containers?.find(
    (container) => container.name === containerAppName,
  );

  if (!theContainerWeCareAbout) {
    throw new Error(`Could not find container with name ${containerAppName}`);
  }

  const environmentVariables =
    theContainerWeCareAbout.env?.reduce(
      (env, next) => {
        if (next.name !== undefined && next.value !== undefined) {
          env[next.name] = next.value;
        }
        return env;
      },
      {} as Record<string, string>,
    ) ?? {};
  return environmentVariables;
}

const delimiter = "__";

export const containerAppEnvironmentVariablesProvider = {
  getSettings: getContainerAppEnvironmentVariables,
  nestingDelimiter: delimiter,
} satisfies SettingsProvider;
