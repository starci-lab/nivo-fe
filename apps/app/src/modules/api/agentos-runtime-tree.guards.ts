/**
 * The recursive guards of the runtime tree grammar.
 *
 * `AgentosRuntimeValue` IS JSON: a value that passes the check is already the value, so these are
 * `is` guards rather than rebuilders - the exact case rule (a) names. Guards return no partial
 * value; they only answer whether the wire value IS the shape.
 */

import { isBoolean, isNumber, isRecord, isString } from "@nivo/api"
import type { AgentosRuntimeValue, AgentosRuntimeWidgetNode } from "./agentos-runtime-tree"

/** A wire value IS a runtime JSON value: primitive, array or record whose entries all are. */
export const isAgentosRuntimeValue = (value: unknown): value is AgentosRuntimeValue =>
    value === null ||
    isString(value) ||
    isNumber(value) ||
    isBoolean(value) ||
    (Array.isArray(value) && value.every(isAgentosRuntimeValue)) ||
    (isRecord(value) && Object.values(value).every(isAgentosRuntimeValue))

/** A wire record whose every value is a runtime JSON value - the shape of settings and payloads. */
export const isAgentosRuntimeRecord = (
    value: unknown,
): value is Readonly<Record<string, AgentosRuntimeValue>> =>
    isRecord(value) && Object.values(value).every(isAgentosRuntimeValue)

/** A wire record IS a widget node: component/version, runtime-value props and node children. */
export const isAgentosRuntimeWidgetNode = (value: unknown): value is AgentosRuntimeWidgetNode => {
    if (!isRecord(value) || !isString(value.component) || !isString(value.version)) return false
    if (!isAgentosRuntimeRecord(value.props)) return false
    const children = value.children
    return children === undefined || (Array.isArray(children) && children.every(isAgentosRuntimeWidgetNode))
}
