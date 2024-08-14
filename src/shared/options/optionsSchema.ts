import { z } from "zod";

export const optionsSchemaShape = {
  appLocation: z.string(),
  branchName: z.string().optional(),
  keyVaultName: z.string().optional(),
  name: z.string().optional(),
  resourceGroupName: z.string(), // .optional(),
  subscriptionName: z.string(),
  type: z.union([z.literal("functionapp"), z.literal("containerapp")]),
};

export const optionsSchema = z.object(optionsSchemaShape);
