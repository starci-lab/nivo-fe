/**
 * The parsers of the instance documents' payloads. One per shape the instance operations select;
 * each returns the value or null, which `graphql` reports as `unavailable`.
 */

import { isBoolean, isNullableNumber, isNullableString, isRecord, isString, parseEach } from "./wire"
import type { InstanceRow, PodStatusRow } from "./instances"

const parseInstanceRow = (value: unknown): InstanceRow | null =>
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
export const parseInstanceRows = (input: unknown): ReadonlyArray<InstanceRow> | null =>
    parseEach(input, parseInstanceRow)

/** Parse the `data` of `myPodOpenclawStatus`. */
export const parsePodStatusRow = (input: unknown): PodStatusRow | null =>
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
