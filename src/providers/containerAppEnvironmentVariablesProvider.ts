/**
 * Copyright (c) Investec
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import type { Subscription } from "@azure/arm-subscriptions";
import type { DefaultAzureCredential } from "@azure/identity";

import { ContainerAppsAPIClient } from "@azure/arm-appcontainers";

import type { SettingsProvider } from "../types.js";

import { logLine } from "../shared/cli/lines.js";

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
  logLine();
  logLine(`Getting container app: ${containerAppName}`);

  if (!subscription.subscriptionId) {
    throw new Error("subscriptionId is undefined");
  }

  const client = new ContainerAppsAPIClient(
    credentials,
    subscription.subscriptionId,
  );

  const app = await client.containerApps.get(
    resourceGroupName,
    containerAppName,
  );

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
