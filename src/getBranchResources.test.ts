/**
 * Copyright (c) Investec
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import type { GenericResourceExpanded } from "@azure/arm-resources";

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the Azure SDK
vi.mock("@azure/arm-resources", () => ({
  ResourceManagementClient: vi.fn(),
  GenericResourceExpanded: vi.fn(),
}));

// Mock Azure Identity
vi.mock("@azure/identity", () => ({
  DefaultAzureCredential: vi.fn(),
}));

// Mock getSubscription
vi.mock("./getSubscription.js", () => ({
  getSubscription: vi.fn(),
}));

import { ResourceManagementClient } from "@azure/arm-resources";

import { getBranchResources } from "./getBranchResources.js";
import { getSubscription } from "./getSubscription.js";

// Mock logger
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  success: vi.fn(),
};

describe("getBranchResources", () => {
  const mockGetSubscription = vi.mocked(getSubscription);
  let mockListByResourceGroup: ReturnType<typeof vi.fn>;
  let mockResourceGroupsGet: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up mock functions
    mockListByResourceGroup = vi.fn();
    mockResourceGroupsGet = vi.fn();

    // Set up default successful mocks
    mockGetSubscription.mockResolvedValue({
      subscriptionId: "test-subscription-id",
    });

    mockResourceGroupsGet.mockResolvedValue({
      name: "test-resource-group",
    });

    // Mock the ResourceManagementClient constructor
    const MockedResourceManagementClient = vi.mocked(ResourceManagementClient);
    MockedResourceManagementClient.mockImplementation(
      () =>
        ({
          resources: {
            listByResourceGroup: mockListByResourceGroup,
          },
          resourceGroups: {
            get: mockResourceGroupsGet,
          },
        }) as unknown as ResourceManagementClient,
    );
  });

  it("should handle resources with both Branch and branch tags correctly", async () => {
    const testBranchName = "feature/test-branch";

    // Create mock resources with various tag combinations
    const mockResources: GenericResourceExpanded[] = [
      {
        name: "app-with-capital-branch",
        type: "Microsoft.Web/sites",
        tags: {
          Branch: `deployment/${testBranchName}`,
          Environment: "dev",
        },
      },
      {
        name: "app-with-lowercase-branch",
        type: "Microsoft.App/containerApps",
        tags: {
          branch: `deployment/${testBranchName}`,
          Environment: "dev",
        },
      },
      {
        name: "app-with-both-tags",
        type: "Microsoft.KeyVault/vaults",
        tags: {
          Branch: `deployment/main`,
          branch: `deployment/${testBranchName}`,
          Environment: "dev",
        },
      },
      {
        name: "app-no-matching-branch",
        type: "Microsoft.Web/sites",
        tags: {
          Branch: "deployment/different-branch",
          Environment: "dev",
        },
      },
      {
        name: "app-no-tags",
        type: "Microsoft.Storage/storageAccounts",
        // No tags property
      },
      {
        name: "app-empty-tags",
        type: "Microsoft.Storage/storageAccounts",
        tags: {},
      },
    ];

    // Mock the async iterator for listByResourceGroup
    mockListByResourceGroup.mockReturnValue({
      *[Symbol.asyncIterator]() {
        for (const resource of mockResources) {
          yield resource;
        }
      },
    });

    const result = await getBranchResources({
      branchName: testBranchName,
      resourceGroupName: "test-resource-group",
      subscriptionName: "test-subscription",
      logger: mockLogger,
    });

    // Should return 3 resources that match the branch name
    expect(result).toHaveLength(3);

    // Check the specific resources that should be returned
    expect(result).toEqual([
      {
        name: "app-with-capital-branch",
        type: "Microsoft.Web/sites",
      },
      {
        name: "app-with-lowercase-branch",
        type: "Microsoft.App/containerApps",
      },
      {
        name: "app-with-both-tags",
        type: "Microsoft.KeyVault/vaults",
      },
    ]);
  });

  it("should handle resources with undefined tag values without throwing errors", async () => {
    const testBranchName = "main";

    // Create mock resources that simulate the runtime scenario where tag values can be undefined
    // Using a custom type to simulate what actually happens at runtime with Azure resources
    const mockResources: {
      name: string;
      type: string;
      tags?: Record<string, string | undefined>;
    }[] = [
      {
        name: "app-with-undefined-branch",
        type: "Microsoft.Web/sites",
        tags: {
          Branch: undefined, // This caused the original error
          Environment: "dev",
        },
      },
      {
        name: "app-with-undefined-lowercase-branch",
        type: "Microsoft.App/containerApps",
        tags: {
          branch: undefined, // This caused the original error
          Environment: "dev",
        },
      },
      {
        name: "app-with-valid-branch",
        type: "Microsoft.KeyVault/vaults",
        tags: {
          Branch: `deployment/${testBranchName}`,
          Environment: "dev",
        },
      },
    ];

    // Mock the async iterator for listByResourceGroup
    mockListByResourceGroup.mockReturnValue({
      *[Symbol.asyncIterator]() {
        for (const resource of mockResources) {
          yield resource;
        }
      },
    });

    // This should not throw an error (the original bug would cause a TypeError)
    const result = await getBranchResources({
      branchName: testBranchName,
      resourceGroupName: "test-resource-group",
      subscriptionName: "test-subscription",
      logger: mockLogger,
    });

    // Should only return the resource with a valid branch tag
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: "app-with-valid-branch",
      type: "Microsoft.KeyVault/vaults",
    });
  });

  it("should return empty array when no resources match the branch name", async () => {
    const testBranchName = "feature/non-existent-branch";

    const mockResources: GenericResourceExpanded[] = [
      {
        name: "app-different-branch",
        type: "Microsoft.Web/sites",
        tags: {
          Branch: "deployment/main",
        },
      },
    ];

    mockListByResourceGroup.mockReturnValue({
      *[Symbol.asyncIterator]() {
        for (const resource of mockResources) {
          yield resource;
        }
      },
    });

    const result = await getBranchResources({
      branchName: testBranchName,
      resourceGroupName: "test-resource-group",
      subscriptionName: "test-subscription",
      logger: mockLogger,
    });

    expect(result).toHaveLength(0);
  });
});
