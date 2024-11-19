/**
 * Copyright (c) Investec
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { z } from "zod";

export const optionsSchemaShape = {
  appLocation: z.string(),
  branchName: z.string().optional(),
  keyVaultName: z.string().optional(),
  mode: z.union([z.literal("explicit"), z.literal("resourcegroup")]),
  name: z.string().optional(),
  resourceGroupName: z.string(),
  subscriptionName: z.string(),
  type: z.union([z.literal("functionapp"), z.literal("containerapp")]),
};

export const optionsSchema = z.object(optionsSchemaShape).refine(
  (option) => {
    const inResourceGroupMode = option.mode === "resourcegroup";
    return inResourceGroupMode || option.name;
  },
  {
    message: "Required in explicit mode",
    path: ["name"],
  },
);
