/**
 * The solution modules a workspace can install, and the installations it holds.
 *
 * Every operation selects exactly one root field (`graphql` reads the first one and no more), returns an
 * `Outcome` and never throws; a caller keys its sentence off `code`, never off the server's English `reason`.
 * The nullability of every type is the schema's, not a guess.
 */

import { type Outcome } from "@nivo/api"
import { graphql } from "./graphql"
import {
    InstallAgentosSolutionModuleDocument,
    MyAgentosModuleInstallationDocument,
    MyAgentosModuleInstallationsDocument,
    MyAgentosSolutionModulesDocument,
} from "./__generated__/core"
import type {
    InstallAgentosSolutionModuleMutation,
    InstallAgentosSolutionModuleMutationVariables,
    MyAgentosModuleInstallationQuery,
    MyAgentosModuleInstallationsQuery,
    MyAgentosSolutionModulesQuery,
} from "./__generated__/core"
import {
    parseModuleInstallation,
    parseModuleInstallationDetail,
    parseModuleInstallations,
    parseSolutionModules,
} from "./agentos-modules.guards"

/** Read the immutable AgentOS solution-module catalog. */
export const myAgentosSolutionModules = (): Promise<
    Outcome<NonNullable<MyAgentosSolutionModulesQuery["myAgentosSolutionModules"]["data"]>>
> =>
    graphql(
        MyAgentosSolutionModulesDocument,
        parseSolutionModules,
    )

/** Read installations belonging to one exact owner-scoped AgentOS workspace. */
export const myAgentosModuleInstallations = (
    agentWorkspaceId: string,
): Promise<
    Outcome<NonNullable<MyAgentosModuleInstallationsQuery["myAgentosModuleInstallations"]["data"]>>
> =>
    graphql(
        MyAgentosModuleInstallationsDocument,
        parseModuleInstallations,
        {
            request: { agentWorkspaceId },
        },
    )

/** Read the canonical owner-scoped snapshot for one module installation. */
export const myAgentosModuleInstallation = (
    installationId: string,
): Promise<Outcome<NonNullable<MyAgentosModuleInstallationQuery["myAgentosModuleInstallation"]["data"]>>> =>
    graphql(
        MyAgentosModuleInstallationDocument,
        parseModuleInstallationDetail,
        {
            request: { installationId },
        },
    )

/** Install one immutable solution package using one browser-generated idempotency identity. */
export const installAgentosSolutionModule = (
    input: Pick<InstallAgentosSolutionModuleMutationVariables["input"], "agentWorkspaceId" | "moduleKey" | "idempotencyKey">,
): Promise<
    Outcome<NonNullable<InstallAgentosSolutionModuleMutation["installAgentosSolutionModule"]["data"]>>
> =>
    graphql(
        InstallAgentosSolutionModuleDocument,
        parseModuleInstallation,
        {
            input: {
                ...input,
                modelProfileRef: "nivo-default",
                channelAccountRefs: [],
                sharedKnowledgeSourceIds: [],
            },
        },
    )
