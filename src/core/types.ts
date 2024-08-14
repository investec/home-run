// eslint-disable-next-line perfectionist/sort-union-types
export type JSONValue = string | number | boolean | JSONObject | JSONArray;

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface JSONObject {
  [x: string]: JSONValue;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface JSONArray extends Array<JSONValue> {}

export interface SettingsProvider {
  getSettings(args: unknown): Promise<Record<string, string>>;
  nestingDelimiter: string;
}
