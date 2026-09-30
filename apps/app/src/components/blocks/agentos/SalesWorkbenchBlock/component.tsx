import { PrimaryRailLayout, SectionHeader } from "@starci/grammar/common"
import { SalesWorkbenchFieldStack } from "./sales-workbench.shared"
import type { SalesWorkbenchSectionProps } from "./sales-workbench.types"
import { SalesWorkbenchAmbiguityRecovery } from "./SalesWorkbenchAmbiguityRecovery"
import { SalesWorkbenchClosure } from "./SalesWorkbenchWaitAndClosure"
import { SalesWorkbenchCommandAttention } from "./SalesWorkbenchCommandAttention"
import { SalesWorkbenchHistoryRoutine } from "./SalesWorkbenchHistoryRoutine"
import { SalesWorkbenchRail } from "./SalesWorkbenchRail"
import { SALES_WORKBENCH_CLASS_NAME } from "./classNames"

/** Props for the connected Sales workbench's pure presentation twin. */
type SalesWorkbenchBlockProps = SalesWorkbenchSectionProps

/** Render the Sales workbench from named command, operation, closure, and rail units. */
export const SalesWorkbenchBlockBase = (props: SalesWorkbenchBlockProps) => {
    const { view } = props.props
    const primary = (
        <SalesWorkbenchFieldStack>
            <SectionHeader level={2} title={view.t("attention.title")} description={view.t("attention.description")} />
            <SalesWorkbenchCommandAttention props={props.props} on={props.on} />
            <SalesWorkbenchHistoryRoutine props={props.props} on={props.on} />
            <SalesWorkbenchAmbiguityRecovery props={props.props} on={props.on} />
            <SalesWorkbenchClosure props={props.props} on={props.on} />
        </SalesWorkbenchFieldStack>
    )
    const rail = <SalesWorkbenchRail props={props.props} on={props.on} />

    return (
        <div
            className={SALES_WORKBENCH_CLASS_NAME}
            data-contract="GAP-5 MEASURE-2"
            aria-busy={view.attention.standing === "loading" ? true : undefined}
        >
            <PrimaryRailLayout
                primary={primary}
                rail={rail}
                railWidth="standard"
                align="start"
                collapsedOrder="primary-first"
            />
        </div>
    )
}
