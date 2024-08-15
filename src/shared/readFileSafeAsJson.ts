/**
 * Copyright (c) Investec
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { readFileSafe } from "./readFileSafe.js";

export async function readFileSafeAsJson(filePath: string | URL) {
  return JSON.parse(await readFileSafe(filePath, "null")) as unknown;
}
