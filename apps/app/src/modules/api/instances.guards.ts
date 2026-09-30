import type { MyInstancesQuery, MyPodOpenclawStatusQuery } from "./__generated__/core"

/** Runtime parsers for the generated instance document payloads. */

import { isBoolean, isNullableNumber, isNullableString, isRecord, isString, parseEach } from "@nivo/api"

const parseInstanceRow = (value: unknown): NonNullable<MyInstancesQuery["myInstances"]["data"]>[number] | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.appKey) &&
    isNullableString(value.detailId) &&
    isNullableString(value.name) &&
    isNullableString(value.plan) &&
    isNullableString(value.ram) &&
    isNullableNumber(value.vcpu) &&
    isString(value.status)
        ? {
              id: value.id,
              appKey: value.appKey,
              detailId: value.detailId,
              name: value.name,
              plan: value.plan,
              ram: value.ram,
              vcpu: value.vcpu,
              status: value.status,
          }
        : null

/** Parse the `data` of `myInstances`. */
export const parseInstanceRows = (
    input: unknown,
): ReadonlyArray<NonNullable<MyInstancesQuery["myInstances"]["data"]>[number]> | null =>
    parseEach(input, parseInstanceRow)

/** Parse the `data` of `myPodOpenclawStatus`. */
export const parsePodStatusRow = (
    input: unknown,
): NonNullable<MyPodOpenclawStatusQuery["myPodOpenclawStatus"]["data"]> | null =>
    isRecord(input) &&
    isBoolean(input.reachable) &&
    isNullableNumber(input.httpStatus) &&
    isBoolean(input.tokenConfigured) &&
    isNullableString(input.tokenHint) &&
    isString(input.checkedAt)
        ? {
              reachable: input.reachable,
              httpStatus: input.httpStatus,
              tokenConfigured: input.tokenConfigured,
              tokenHint: input.tokenHint,
              checkedAt: input.checkedAt,
          }
        : null
