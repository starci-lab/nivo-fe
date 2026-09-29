import { describe, expect, it } from "vitest"

import {
    ACCOUNTING_COMMAND_RECONCILIATIONS,
} from "./index"

/*
 * THE SURFACE IS CLOSED.
 *
 * fe-modules-impl 3/9 removed the legacy GraphQL document workbench from this client and from the two
 * SWR hook modules. What is asserted here is the removal itself: the eight accounting operation names
 * are the whole public surface, and nothing in this module resolves an Accounting fact through a
 * GraphQL document, an approve call or a post call.
 */
describe("ACCOUNTING_COMMAND_RECONCILIATIONS", () => {
    it("exports the eight operations, and nothing that resolves Accounting through GraphQL", async () => {
        const client = await import("./index")
        expect(
            Object.keys(client)
                .filter((name) => /^(read|command)Accounting/.test(name))
                .sort(),
        ).toEqual([
            "commandAccountingAdmitEvidence",
            "commandAccountingCorrect",
            "commandAccountingException",
            "commandAccountingRoutine",
            "readAccountingEvidence",
            "readAccountingResultDetail",
            "readAccountingRoutineResult",
            "readAccountingSummary",
        ])
        expect(
            Object.keys(client).filter((name) =>
                /Document|Workbench|Correction|Initialize|Ingest|Reconcile|ClosePeriod|AppliedAccountingContext/.test(
                    name,
                ),
            ),
        ).toEqual([])
        expect(ACCOUNTING_COMMAND_RECONCILIATIONS).toEqual({
            "accounting.admitEvidence@1": "accounting.evidence@1",
            "accounting.routine@1": "accounting.routineResult@1",
            "accounting.correct@1": "accounting.resultDetail@1",
        })
    })

})
