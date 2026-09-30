/** Runtime guards for provisioning-saga rows and their generated status enums. */

import { isBoolean, isNullableNumber, isNullableString, isNumber, isOneOf, isRecord, isString, parseEach } from "@nivo/api"
import { ProvisioningSagaStatus, ProvisioningSagaStepStatus } from "../__generated__/core"
import type {
    ProvisioningSagaEntity,
    ProvisioningSagaStepEntity,
    WorkspaceProvisioningSagaQuery,
} from "../__generated__/core"

const parseSagaRow = (value: unknown): ProvisioningSagaEntity | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.jobId) &&
    isString(value.definitionKey) &&
    isNumber(value.definitionVersion) &&
    isString(value.resourceKind) &&
    isString(value.resourceId) &&
    isString(value.ownerId) &&
    isOneOf(value.status, [
        ProvisioningSagaStatus.Queued,
        ProvisioningSagaStatus.RunningForward,
        ProvisioningSagaStatus.WaitingRetry,
        ProvisioningSagaStatus.Compensating,
        ProvisioningSagaStatus.Completed,
        ProvisioningSagaStatus.Compensated,
        ProvisioningSagaStatus.CompensationFailed,
    ]) &&
    isOneOf(value.direction, ["forward", "compensating"]) &&
    isNumber(value.forwardCursor) &&
    isNullableNumber(value.compensationCursor) &&
    isNumber(value.sequence) &&
    isNullableString(value.failureCode) &&
    isNullableString(value.failureReason) &&
    isNullableString(value.finishedAt) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
        ? {
              id: value.id,
              jobId: value.jobId,
              definitionKey: value.definitionKey,
              definitionVersion: value.definitionVersion,
              resourceKind: value.resourceKind,
              resourceId: value.resourceId,
              ownerId: value.ownerId,
              status: value.status,
              direction: value.direction,
              forwardCursor: value.forwardCursor,
              compensationCursor: value.compensationCursor,
              sequence: value.sequence,
              failureCode: value.failureCode,
              failureReason: value.failureReason,
              finishedAt: value.finishedAt,
              createdAt: value.createdAt,
              updatedAt: value.updatedAt,
          }
        : null

/** Parse the `data` of `retryProvisioningSaga`/`cancelProvisioningSaga`: one saga row. */
export const parseProvisioningSaga = (input: unknown): ProvisioningSagaEntity | null => parseSagaRow(input)

const SAGA_STEP_STATUSES = [
    ProvisioningSagaStepStatus.Pending,
    ProvisioningSagaStepStatus.Running,
    ProvisioningSagaStepStatus.Completed,
    ProvisioningSagaStepStatus.Failed,
    ProvisioningSagaStepStatus.Compensating,
    ProvisioningSagaStepStatus.Compensated,
    ProvisioningSagaStepStatus.CompensationFailed,
    ProvisioningSagaStepStatus.Skipped,
]

const parseSagaStep = (value: unknown): ProvisioningSagaStepEntity | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.stepKey) &&
    isNumber(value.ordinal) &&
    isBoolean(value.isCompensable) &&
    isOneOf(value.forwardStatus, SAGA_STEP_STATUSES) &&
    isOneOf(value.compensationStatus, SAGA_STEP_STATUSES) &&
    isNullableString(value.lastError) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
        ? {
              id: value.id,
              stepKey: value.stepKey,
              ordinal: value.ordinal,
              isCompensable: value.isCompensable,
              forwardStatus: value.forwardStatus,
              compensationStatus: value.compensationStatus,
              lastError: value.lastError,
              createdAt: value.createdAt,
              updatedAt: value.updatedAt,
          }
        : null

/** Parse the `data` of `myProvisioningSaga`: `{ saga, steps }`. */
export const parseProvisioningSagaView = (
    input: unknown,
): NonNullable<WorkspaceProvisioningSagaQuery["myProvisioningSaga"]["data"]> | null => {
    if (!isRecord(input)) return null
    const saga = parseSagaRow(input.saga)
    const steps = parseEach(input.steps, parseSagaStep)
    if (saga === null || steps === null) return null
    return { saga, steps }
}
