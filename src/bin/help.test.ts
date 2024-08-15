/**
 * Copyright (c) Investec
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

import { logHelpText } from "./help.js";

function makeProxy<T extends object>(receiver: T): T {
  return new Proxy(receiver, {
    get: () => makeProxy((input: string) => input),
  });
}

vi.mock("chalk", () => ({
  default: makeProxy({}),
}));

let mockConsoleLog: MockInstance;

describe("logHelpText", () => {
  beforeEach(() => {
    mockConsoleLog = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);
  });

  it("logs help text when called", () => {
    logHelpText([]);

    expect(mockConsoleLog.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "Configure local development environments for Azure apps with one command",
        ],
        [
          " ",
        ],
        [
          "Core options:",
        ],
        [
          "
        -l | --appLocation (string): The location of the app, and the directory where the settings file will be generated eg ../ZebraGptFunctionApp/",
        ],
        [
          "
        -h | --help: Show help",
        ],
        [
          "
        -n | --name (string): The name of the explicit azure resource eg zebragpt (the type of resource is determined by the type option)",
        ],
        [
          "
        -r | --resourceGroupName (string): RESOURCE GROUP MODE: The name of the resource group where the resources are located",
        ],
        [
          "
        -s | --subscriptionName (string): The name of the subscription where the resources are located",
        ],
        [
          "
        -t | --type (string): The type of resource to generate settings for - either functionapp or containerapp",
        ],
        [
          "
        -v | --version: Show version",
        ],
        [],
        [
          " ",
        ],
        [
          "Optional options:",
        ],
        [
          "
        -b | --branchName (string): RESOURCE GROUP MODE: Allows users to supply an explicit branch name - if not supplied, the current branch will be used",
        ],
        [
          "
        -k | --keyVaultName (string): Allows users to supply an explicit key vault name - if not supplied when in resource group mode, the key vault name will be inferred from the branch resources",
        ],
        [],
      ]
    `);
  });
});
