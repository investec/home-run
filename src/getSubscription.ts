/**
 * Copyright (c) Investec
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import type { DefaultAzureCredential } from "@azure/identity";

import {
  type Subscription,
  SubscriptionClient,
} from "@azure/arm-subscriptions";

export async function getSubscription({
  credentials,
  subscriptionName,
}: {
  credentials: DefaultAzureCredential;
  subscriptionName: string;
}): Promise<Subscription> {
  const subscriptionClient = new SubscriptionClient(credentials);

  let subscription: Subscription | undefined;
  for await (const item of subscriptionClient.subscriptions.list()) {
    if (item.displayName === subscriptionName) {
      subscription = item;
      break;
    }
  }

  if (!subscription) {
    throw new Error(
      `Could not find subscription with name ${subscriptionName}`,
    );
  }

  return subscription;
}
