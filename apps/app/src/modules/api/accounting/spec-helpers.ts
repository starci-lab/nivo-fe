import { CORE_API_ORIGIN as CORE_ORIGIN } from "@/modules/config"
import {
    API_SPEC_INSTALLATION as INSTALLATION,
    API_SPEC_INSTANCE as INSTANCE,
    API_SPEC_INTENT as INTENT,
    API_SPEC_OPERATIONS_PATH as OPERATIONS_PATH,
    API_SPEC_TOKEN as TOKEN,
    API_SPEC_WORKSPACE as WORKSPACE,
    apiSpecScope,
    createApiFetchSpec,
} from "../spec-helpers"

const SCOPE = apiSpecScope()
const fetchSpec = createApiFetchSpec()
const { answerWith, sentUrls, sentInit, sentBody } = fetchSpec
const accountingResult = (op: string, payload: Record<string, unknown>) => ({
    kind: "accounting_result",
    operation: "accounting.evidence@1",
    requestId: INTENT,
    result: { ok: true, result: { op, payload } },
})

/** Shared accounting spec fixtures and request controls. */
export const accountingSpec = {
    WORKSPACE,
    INSTANCE,
    INSTALLATION,
    TOKEN,
    INTENT,
    SCOPE,
    OPERATIONS_PATH,
    CORE_ORIGIN,
    answerWith,
    sentUrls,
    sentInit,
    sentBody,
    accountingResult,
    get fetchMock() {
        return fetchSpec.fetchMock
    },
}
