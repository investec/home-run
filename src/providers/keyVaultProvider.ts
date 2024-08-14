import type { DefaultAzureCredential } from "@azure/identity";

// import {
//   createDefaultHttpClient,
//   type HttpClient,
// } from "@azure/core-rest-pipeline";
import { SecretClient } from "@azure/keyvault-secrets";
// import crypto from "crypto";
// import https from "https";

import type { SettingsProvider } from "../types.js";

// const httpClient = createDefaultHttpClient();
// const sslLegacyAgent = new https.Agent({
//   // for self signed you could also add
//   // rejectUnauthorized: false,
//   // allow legacy server
//   secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
// });
// const customHttpClient: HttpClient = {
//   sendRequest: async (request) => {
//     // request.tlsSettings = { allowUntrustedCertificate: true };
//     request.agent = sslLegacyAgent;
//     const response = await httpClient.sendRequest(request);
//     return response;
//   },
// };

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

  console.log(`Getting key vault: ${KEYVAULT_URI}`);

  const secretClient = new SecretClient(KEYVAULT_URI, credentials, {
    // httpClient: customHttpClient, // only necessary if being SSL intercepted by Palo Alto
  });

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
