/**
 * Copyright (c) Investec
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

export const StatusCodes = {
  Cancelled: 2,
  Failure: 1,
  Success: 0,
} as const;

export type StatusCode = (typeof StatusCodes)[keyof typeof StatusCodes];
