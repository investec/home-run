/**
 * Copyright (c) Investec
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import * as fs from "node:fs/promises";

export async function readFileSafe(filePath: string | URL, fallback: string) {
  try {
    return (await fs.readFile(filePath)).toString();
  } catch {
    return fallback;
  }
}
