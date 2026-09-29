import type { CollabOperation } from './types/operation'

/** Read-only gateway operations that use the GraphQL query field. */
export const COLLAB_READ_OPERATIONS: ReadonlySet<CollabOperation> = new Set([
    "openOffice",
    "readGroup",
    "listTasks",
    "readTask",
    "availableCommands",
    "readNotices",
    "openNotice",
    "reconcileRequest",
])
