/**
 * Copyright (c) Investec
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import chalk from "chalk";
import { EOL } from "node:os";

export const fallbackLogger: Logger = {
  error: console.error.bind(console),
  info: console.log.bind(console),
  success: console.log.bind(console),
};

export interface Logger {
  error: (message?: string) => void;
  info: (message?: string) => void;
  success: (message?: string) => void;
}

export function makeLogger(indent = 5): Logger {
  const prefix = chalk.gray("│") + " ".repeat(indent);

  function colourMessage(message: string, messageType: MessageType) {
    return messageType === "error"
      ? chalk.red(message)
      : messageType === "info"
        ? chalk.blueBright(message)
        : chalk.green(message);
  }

  function formatMessage(message = "", messageType: MessageType) {
    return message.includes(EOL)
      ? message
          .split(EOL)
          .map((line) => `${prefix}${colourMessage(line, messageType)}`)
          .join(EOL)
      : `${prefix}${colourMessage(message, messageType)}`;
  }
  return {
    error: (message) => {
      console.error(formatMessage(message, "error"));
    },
    info: (message) => {
      console.log(formatMessage(message, "info"));
    },
    success: (message) => {
      console.log(formatMessage(message, "success"));
    },
  };
}

export interface SpinnerLogger extends Logger {
  flush: () => void;
}

type MessageType = "error" | "info" | "success";

export function makeSpinnerLogger(logger: Logger): SpinnerLogger {
  const logs: {
    message: string | undefined;
    type: MessageType;
  }[] = [];

  return {
    info: (message) => logs.push({ type: "info", message }),
    error: (message) => logs.push({ type: "error", message }),
    success: (message) => logs.push({ type: "success", message }),
    flush: () => {
      logger.info();
      logs.forEach((log) => {
        if (log.type === "error") {
          logger.error(log.message);
        } else if (log.type === "info") {
          logger.info(log.message);
        } else {
          logger.success(log.message);
        }
      });
    },
  };
}
