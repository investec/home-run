import * as prompts from "@clack/prompts";
import chalk from "chalk";
import { parseArgs } from "node:util";
import { fromZodError } from "zod-validation-error";

import {
  generateSettingsContainerApp,
  generateSettingsFunctionApp,
  getResourceNameAndKeyVaultResourceName,
} from "../index.js";
// import { createRerunSuggestion } from "../create/createRerunSuggestion.js";
import { logLine } from "../shared/cli/lines.js";
import { StatusCodes } from "../shared/codes.js";
import { optionsSchema } from "../shared/options/optionsSchema.js";
import { logHelpText } from "./help.js";
import { getVersionFromPackageJson } from "./packageJson.js";
// import { promptForMode } from "./promptForMode.js";

const operationMessage = (verb: string) =>
  `Operation ${verb}. Exiting - maybe another time? 👋`;

export async function bin(args: string[]) {
  console.clear();

  const version = await getVersionFromPackageJson();

  const introPrompts = `${chalk.blueBright(`🏠🏃 Welcome to`)} ${chalk.bgBlueBright.black(`home-run`)} ${chalk.blueBright(`${version}! 🏠🏃`)}`;
  const outroPrompts = `${chalk.blueBright(`🏠🏃 Thanks for using`)} ${chalk.bgBlueBright.black(`home-run`)} ${chalk.blueBright(`${version}! 🏠🏃`)}`;

  //   const introWarnings = [
  //     chalk.yellow(
  //       "⚠️ This template is early stage, opinionated, and not endorsed by the TypeScript team. ⚠️",
  //     ),
  //     chalk.yellow(
  //       "⚠️ If any tooling it sets displeases you, you can always remove that portion manually. ⚠️",
  //     ),
  //   ];

  /*
{
  subscriptionName: {
    type: "string",
    demandOption: true,
    alias: "s",
    description: "The name of the subscription",
  },
  resourceGroupName: {
    type: "string",
    demandOption: true,
    alias: "rg",
    description: "The name of the resource group",
  },
  appLocation: {
    type: "string",
    demandOption: true,
    alias: "p",
    description: "The location of the app eg ../ZebraGptFunctionApp/",
  },
  type: {
    choices: ["functionapp", "containerapp"],
    demandOption: true,
    alias: "t",
  },
  name: {
    type: "string",
    demandOption: false,
    alias: "n",
    description: "The name of the app e.g. zebragpt",
  },
  keyVaultName: { type: "string", alias: "kv" },
  branchName: { type: "string", alias: "b" },
}
     */

  const { values } = parseArgs({
    args,
    options: {
      // help: {
      //   short: "h",
      //   type: "boolean",
      // },
      // mode: { type: "string" },
      // version: {
      //   short: "v",
      //   type: "boolean",
      // },
      appLocation: {
        description: "The location of the app eg ../ZebraGptFunctionApp/",
        short: "p",
        type: "string",
      },
      branchName: { short: "b", type: "string" },
      help: {
        short: "h",
        type: "boolean",
      },
      keyVaultName: { short: "k", type: "string" },
      name: {
        description: "The name of the app e.g. zebragpt",
        short: "n",
        type: "string",
      },
      resourceGroupName: {
        description: "The name of the resource group",
        short: "r",
        type: "string",
      },
      subscriptionName: {
        description: "The name of the subscription",
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
    },
    strict: false,
  });

  if (values.help) {
    logHelpText([
      introPrompts,
      // , ...introWarnings
    ]);
    return StatusCodes.Success;
  }

  if (values.version) {
    console.log(version);
    return StatusCodes.Success;
  }

  prompts.intro(introPrompts);

  logLine();

  const mappedOptions = {
    appLocation: values.appLocation,
    branchName: values.branchName,
    keyVaultName: values.keyVaultName,
    name: values.name,
    resourceGroupName: values.resourceGroupName,
    subscriptionName: values.subscriptionName,
    type: values.type,
  };

  const optionsParseResult = optionsSchema.safeParse(mappedOptions);

  if (!optionsParseResult.success) {
    logLine(
      chalk.red(
        fromZodError(optionsParseResult.error, {
          issueSeparator: "\n    - ",
        }),
      ),
    );
    logLine();

    prompts.cancel(operationMessage("failed"));
    prompts.outro(outroPrompts);

    return StatusCodes.Failure;
  }

  const {
    appLocation,
    branchName,
    keyVaultName,
    name,
    resourceGroupName,
    subscriptionName,
    type,
  } = optionsParseResult.data;

  const { keyVaultResourceName, resourceName } =
    await getResourceNameAndKeyVaultResourceName({
      branchName,
      keyVaultName,
      name,
      resourceGroupName,
      subscriptionName,
      type,
    });

  switch (type) {
    case "containerapp":
      logLine(`Generating settings for container app: ${resourceName}`);
      await generateSettingsContainerApp({
        appLocation,
        containerAppName: resourceName,
        keyVaultName: keyVaultResourceName,
        resourceGroupName,
        subscriptionName,
      });
      break;
    case "functionapp":
      logLine(`Generating settings for function app: ${resourceName}`);
      await generateSettingsFunctionApp({
        appLocation,
        functionAppName: resourceName,
        keyVaultName: keyVaultResourceName,
        resourceGroupName,
        subscriptionName,
      });
      break;
  }

  //   logLine(introWarnings[0]);
  //   logLine(introWarnings[1]);

  // const { mode, options: promptedOptions } = await promptForMode(
  //   !!values.auto,
  //   values.mode,
  // );
  // if (typeof mode !== "string") {
  //   prompts.outro(chalk.red(mode?.message ?? operationMessage("cancelled")));
  //   return 1;
  // }

  // const runners = { create, initialize, migrate };
  // const { code, error, options } = await runners[mode](args, promptedOptions);

  // prompts.log.info(
  // 	[
  // 		chalk.italic(`Tip: to run again with the same input values, use:`),
  // 		chalk.blue(createRerunSuggestion(options)),
  // 	].join(" "),
  // );

  // if (code) {
  // 	logLine();

  // 	if (error) {
  // 		logLine(
  // 			chalk.red(typeof error === "string" ? error : fromZodError(error)),
  // 		);
  // 		logLine();
  // 	}

  // 	prompts.cancel(
  // 		code === StatusCodes.Cancelled
  // 			? operationMessage("cancelled")
  // 			: operationMessage("failed"),
  // 	);
  // }

  prompts.outro(outroPrompts);

  return StatusCodes.Success;
}
