/**
 * Copyright (c) Investec
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import type { DefaultAzureCredential } from "@azure/identity";

import { SecretClient } from "@azure/keyvault-secrets";

import type { SettingsProvider } from "../types.js";

import { logLine } from "../shared/cli/lines.js";

// https://learn.microsoft.com/en-us/aspnet/core/security/key-vault-configuration?view=aspnetcore-6.0#secret-storage-in-the-production-environment-with-azure-key-vault
// Azure Key Vault secret names are limited to alphanumeric characters and dashes. Hierarchical values (configuration sections) use -- (two dashes) as a delimiter, as colons aren't allowed in key vault secret names. Colons delimit a section from a subkey in ASP.NET Core configuration. The two-dash sequence is replaced with a colon when the secrets are loaded into the app's configuration.

async function getKeyVaultSettings({
  credentials,
  keyVaultName,
}: {
  credentials: DefaultAzureCredential;
  keyVaultName: string;
}): Promise<Record<string, string>> {
  const keyVaultVariables: Record<string, string> = {};

  const KEYVAULT_URI = `https://${keyVaultName}.vault.azure.net/`;

  logLine(`Getting key vault: ${KEYVAULT_URI}`);

  const secretClient = new SecretClient(KEYVAULT_URI, credentials, {});

  for await (const secretProperties of secretClient.listPropertiesOfSecrets()) {
    // It will error if you encounter legacy TLS or if you
    // don't have the Key Vault Secrets User role (4633458b-17de-408a-b874-0445c86b69e6)
    // - see https://docs.microsoft.com/en-us/azure/key-vault/general/rbac-guide?tabs=azure-cli#azure-built-in-roles-for-key-vault-data-plane-operations
    const secret = await secretClient.getSecret(secretProperties.name);

    if (secret.value === undefined) {
      throw new Error(`${secretProperties.name} value === undefined`);
    }

    keyVaultVariables[secret.name] = secret.value;
  }

  return keyVaultVariables;
}

const delimiter = "--";

export const keyVaultProvider = {
  getSettings: getKeyVaultSettings,
  nestingDelimiter: delimiter,
} satisfies SettingsProvider;
