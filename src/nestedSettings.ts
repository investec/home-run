/**
 * Copyright (c) Investec
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import type { JSONObject } from "./types.js";

export function makeNestedSettings({
  delimiter,
  rawSettings,
  settings,
}: {
  delimiter: string;
  rawSettings: Record<string, string>;
  settings: JSONObject;
}) {
  return Array.from(Object.entries(rawSettings)).reduce(
    (applicationSettings, [key, value]) => {
      const splitByDelimiter = key.split(delimiter);
      let currentObject = applicationSettings;
      for (const [index, keyPart] of splitByDelimiter.entries()) {
        if (index === splitByDelimiter.length - 1) {
          currentObject[keyPart] = value;
        } else {
          currentObject[keyPart] = currentObject[keyPart] || {};
          currentObject = currentObject[keyPart] as JSONObject;
        }
      }
      return applicationSettings;
    },
    settings,
  );
}
