import type { ContextDraft } from "../../../components/blocks/agentos/ContextVersionBlock"
import type { ModulePageCopy } from "../module-page-copy"

/** The label naming the exact draft a scenario run targets on the test surface. */
export const testContextLabelFor = (draft: ContextDraft | null, copy: ModulePageCopy): string => {
    if (draft?.digest === null || draft?.digest === undefined) return copy.setup.testableDraftRequired
    const version = draft.version === null ? copy.setup.draft : copy.setup.contextVersion({ version: draft.version })
    return copy.setup.testContext({ revision: draft.revision, version, digest: draft.digest.slice(0, 8) })
}
