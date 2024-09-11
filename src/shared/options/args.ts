/**
 * Copyright (c) Investec
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

export const options = {
  appLocation: {
    short: "l",
    type: "string",
  },
  branchName: { short: "b", type: "string" },
  help: {
    short: "h",
    type: "boolean",
  },
  keyVaultName: { short: "k", type: "string" },
  mode: {
    short: "m",
    type: "string",
  },
  name: {
    short: "n",
    type: "string",
  },
  resourceGroupName: {
    short: "r",
    type: "string",
  },
  subscriptionName: {
    short: "s",
    type: "string",
  },
  type: {
    short: "t",
    type: "string", // "functionapp" | "containerapp"
  },
  version: {
    short: "v",
    type: "boolean",
  },
} as const;

export type ValidOption = keyof typeof options;

export interface DocOption {
  description: string;
  docsSection: "core" | "optional";
  multiple?: boolean;
  short: string;
  type: string;
}

// two modes: use resource group and subscription name to get branch resources, or pass explicit resource names

export const allArgOptions: Record<ValidOption, DocOption> = {
  appLocation: {
    ...options.appLocation,
    description:
      "The location of the app, and the directory where the settings file will be generated eg ../OurFunctionApp/",
    docsSection: "core",
  },

  branchName: {
    ...options.branchName,
    description:
      "[resourcegroup]: Allows users to supply an explicit branch name - if not supplied, the current branch will be used",
    docsSection: "optional",
  },

  help: {
    ...options.help,
    description: "Show help",
    docsSection: "core",
    type: "boolean",
  },

  keyVaultName: {
    ...options.keyVaultName,
    description:
      "[explicit]: Allows users to supply an explicit key vault name - if not supplied when in resource group mode, the key vault name will be inferred from the branch resources - required if mode is explicit",
    docsSection: "core",
  },

  mode: {
    ...options.mode,
    description:
      "explicit | resourcegroup - whether to pass explicit resource names, or look for resources in the resource group matching the branch name",
    docsSection: "core",
    type: "string",
  },

  name: {
    ...options.name,
    description:
      "The name of the explicit Azure resource eg ourapp (the type of resource is determined by the type option) - required if mode is explicit",
    docsSection: "core",
  },

  resourceGroupName: {
    ...options.resourceGroupName,
    description:
      "[resourcegroup]: The name of the resource group where the resources are located",
    docsSection: "core",
  },

  subscriptionName: {
    ...options.subscriptionName,
    description: "The name of the subscription where the resources are located",
    docsSection: "core",
  },

  type: {
    ...options.type,
    description:
      "The type of resource to generate settings for - either functionapp or containerapp",
    docsSection: "core",
  },

  version: {
    ...options.version,
    description: "Show version",
    docsSection: "core",
  },
} as const;
