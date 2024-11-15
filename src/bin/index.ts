/**
 * Copyright (c) Investec
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import * as prompts from "@clack/prompts";
import chalk from "chalk";
import { parseArgs } from "node:util";
import { fromZodError } from "zod-validation-error";

import type { Logger } from "../shared/cli/logger.js";

import { getResourceNameAndKeyVaultResourceName } from "../index.js";
import {
  generateSettingsContainerApp,
  generateSettingsFunctionApp,
} from "../index.js";
import { withSpinner } from "../shared/cli/spinners.js";
import { StatusCodes } from "../shared/codes.js";
import { options } from "../shared/options/args.js";
import { optionsSchema } from "../shared/options/optionsSchema.js";
import { logHelpText } from "./help.js";
import { getVersionFromPackageJson } from "./packageJson.js";

const operationMessage = (verb: string) =>
  `Operation ${verb}. Exiting - maybe another time? 👋`;

export async function bin(args: string[]) {
  console.clear();

  const logger: Logger = {
    info: (message = "") => {
      prompts.log.info(message);
    },
    error: (message = "") => {
      prompts.log.error(message);
    },
    success: (message = "") => {
      prompts.log.success(message);
    },
  };

  const version = await getVersionFromPackageJson();

  const introPrompts = `${chalk.blueBright(`🏠🏃 Welcome to`)} ${chalk.bgBlueBright.black(`home-run`)} ${chalk.blueBright(`${version}! 🏠🏃`)}`;
  const outroPrompts = `${chalk.blueBright(`🏠🏃 Thanks for using`)} ${chalk.bgBlueBright.black(`home-run`)} ${chalk.blueBright(`${version}! 🏠🏃`)}`;

  const { values } = parseArgs({
    args,
    options,
    strict: false,
  });

  if (values.help) {
    logHelpText([introPrompts]);
    return StatusCodes.Success;
  }

  if (values.version) {
    console.log(version);
    return StatusCodes.Success;
  }

  prompts.intro(introPrompts);

  const mappedOptions = {
    appLocation: values.appLocation,
    branchName: values.branchName,
    keyVaultName: values.keyVaultName,
    mode: values.mode,
    name: values.name,
    resourceGroupName: values.resourceGroupName,
    subscriptionName: values.subscriptionName,
    type: values.type,
  };

  const optionsParseResult = optionsSchema.safeParse(mappedOptions);

  if (!optionsParseResult.success) {
    logger.error(
      chalk.red(
        fromZodError(optionsParseResult.error, {
          issueSeparator: "\n    - ",
        }),
      ),
    );

    prompts.cancel(operationMessage("failed"));
    prompts.outro(outroPrompts);

    return StatusCodes.Failure;
  }

  const {
    appLocation,
    branchName,
    keyVaultName,
    mode,
    name,
    resourceGroupName,
    subscriptionName,
    type,
  } = optionsParseResult.data;

  const { keyVaultResourceName, resourceName } = await withSpinner(
    `Getting resource name and key vault resource name`,
    logger,
    (logger) =>
      getResourceNameAndKeyVaultResourceName({
        branchName,
        keyVaultName,
        mode,
        name,
        resourceGroupName,
        subscriptionName,
        type,
        logger,
      }),
  );

  switch (type) {
    case "containerapp":
      await withSpinner(
        `Generating settings for container app: ${resourceName}`,
        logger,
        (logger) =>
          generateSettingsContainerApp({
            appLocation,
            containerAppName: resourceName,
            keyVaultName: keyVaultResourceName,
            resourceGroupName,
            subscriptionName,
            logger,
          }),
      );
      break;
    case "functionapp":
      await withSpinner(
        `Generating settings for function app: ${resourceName}`,
        logger,
        (logger) =>
          generateSettingsFunctionApp({
            appLocation,
            functionAppName: resourceName,
            keyVaultName: keyVaultResourceName,
            resourceGroupName,
            subscriptionName,
            logger,
          }),
      );
      break;
  }

  prompts.outro(outroPrompts);

  return StatusCodes.Success;
}
