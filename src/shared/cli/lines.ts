/**
 * Copyright (c) Investec
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import chalk from "chalk";
import { EOL } from "os";

export function logLine(line?: string) {
  console.log(makeLine(line));
}

export function logAsJson(value: unknown) {
  JSON.stringify(value, null, 2).split(EOL).forEach(logLine);
}

export function logNewSection(line: string) {
  logLine();
  console.log(`◇  ${line}`);
}

export function makeLine(line: string | undefined) {
  return [chalk.gray("│"), line].filter(Boolean).join("  ");
}
