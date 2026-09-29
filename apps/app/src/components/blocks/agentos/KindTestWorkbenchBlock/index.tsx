"use client"

import { SurfaceCard } from "@starci/grammar/common"
import { useKindTestWorkbench } from "@/hooks/agentos/useKindTestWorkbench"
import type { KindTestWorkbenchBlockProps, TestWorkbenchRegistry } from "@/modules/agentos/kind-test-workbench"
import { KindTestScenarioWorkbench } from "../KindTestScenarioWorkbench"
import { KindTestUnavailableWorkbench } from "../KindTestUnavailableWorkbench"

export type {
    KindTestWorkbenchBlockCopy,
    KindTestWorkbenchBlockProps,
    TestWorkbenchComponentProps,
    TestWorkbenchRegistry,
} from "@/modules/agentos/kind-test-workbench"

/** Built-in registrations; adding a kind extends this table without editing the shell. */
export const DEFAULT_TEST_WORKBENCH_REGISTRY: TestWorkbenchRegistry = {
    "conversation-sandbox": KindTestScenarioWorkbench,
    "accounting-fixture": KindTestScenarioWorkbench,
    "calendar-sandbox": KindTestScenarioWorkbench,
    "citation-check": KindTestScenarioWorkbench,
    "generic-sandbox": KindTestScenarioWorkbench,
}

/** Resolve and run one kind Test workbench from its versioned registry identity. */
export const KindTestWorkbenchBlock = (props: KindTestWorkbenchBlockProps) => {
    const { scenario, contentProps } = useKindTestWorkbench(props)
    if (scenario === undefined || contentProps === null) return null
    const Workbench = props.registry[props.contract.workbench.key] ?? KindTestUnavailableWorkbench
    return (
        <SurfaceCard
            label={props.copy.kindTest.scenario}
            fact={`${props.contract.workbench.key}@${props.contract.workbench.version}`}
        >
            <Workbench {...contentProps} />
        </SurfaceCard>
    )
}
