/**
 * Copyright (c) Investec
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

// eslint-disable-next-line perfectionist/sort-union-types
export type JSONValue = string | number | boolean | JSONObject | JSONArray;

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface JSONObject {
  [x: string]: JSONValue;
}

export type JSONArray = JSONValue[];

export interface SettingsProvider {
  getSettings(args: unknown): Promise<Record<string, string>>;
  nestingDelimiter: string;
}
