import { describe, expect, it } from "vitest"

import {
    SALES_MUTATION_NAMES,
    SALES_QUERY_NAMES,
    SALES_RECONCILIATIONS
} from "./index"

describe("sales", () => {
    it("registers exactly the contract's sixteen operations, eight queries then eight mutations", () => {
        expect(SALES_QUERY_NAMES).toEqual([
            "sales.policy@1",
            "sales.readiness@1",
            "sales.opportunity@1",
            "sales.pipeline@1",
            "sales.command@1",
            "sales.decisionRequest@1",
            "sales.action@1",
            "sales.handoff@1",
        ])
        expect(SALES_MUTATION_NAMES).toEqual([
            "sales.configurePolicy@1",
            "sales.submitCommand@1",
            "sales.clarifyCommand@1",
            "sales.decideProposal@1",
            "sales.close@1",
            "sales.prepareHandoff@1",
            "sales.submitHandoff@1",
            "sales.recoverAction@1",
        ])
        // The closed set is callable and nothing else: every mutation names one read, and a
        // query registers none.
        const registered = [...SALES_QUERY_NAMES, ...SALES_MUTATION_NAMES]
        expect(new Set(registered).size).toBe(16)
        expect(Object.keys(SALES_RECONCILIATIONS).sort()).toEqual([...SALES_MUTATION_NAMES].sort())
    })

})
