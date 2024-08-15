/**
 * Copyright (c) Investec
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { readFileSafeAsJson } from "../shared/readFileSafeAsJson.js";

interface PackageWithVersion {
  version?: string;
}

export async function getVersionFromPackageJson(): Promise<string> {
  const path = new URL("../../package.json", import.meta.url);
  const data = (await readFileSafeAsJson(path)) as PackageWithVersion;

  if (typeof data === "object" && typeof data.version === "string") {
    return data.version;
  }

  throw new Error("Cannot find version number");
}
