import type { ContextDraft } from "@/components/blocks/agentos/ContextVersionBlock"
import type { AgentosModuleTestSurface } from "@/modules/api/agentos-module-tests"

/** Return test evidence only while its context, draft digest and generations still match. */
export const exactTestSurfaceFor = (
    testSurface: AgentosModuleTestSurface | null,
    draft: ContextDraft | null,
): AgentosModuleTestSurface | null => {
    if (
        draft?.digest === null ||
        draft === null ||
        draft.definitionDigest === null ||
        testSurface?.run === null ||
        testSurface === null
    )
        return null
    const run = testSurface.run
    const exactTarget =
        (draft.contextId != null && run.contextVersionId === draft.contextId) ||
        (run.setupSessionId === draft.setupSessionId && run.draftDigest === draft.digest)
    return exactTarget &&
        run.definitionDigest === draft.definitionDigest &&
        run.targetDigest === draft.digest &&
        run.authorityGeneration === draft.authorityGeneration &&
        run.sourceGeneration === draft.sourceGeneration &&
        run.retrievalGeneration === draft.retrievalGeneration
        ? testSurface
        : null
}
