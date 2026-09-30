import { PrimaryRailLayout, SectionHeader } from "@starci/grammar/common"
import { AccountingWorkbenchActionRow, AccountingWorkbenchFieldStack } from "./accounting-workbench.shared"
import type { AccountingWorkbenchBlockData, AccountingWorkbenchSectionData } from "./accounting-workbench.types"
import { AccountingWorkbenchCorrection } from "./AccountingWorkbenchCorrection"
import { AccountingWorkbenchDetail } from "./AccountingWorkbenchDetail"
import { AccountingWorkbenchIntake } from "./AccountingWorkbenchIntake"
import { AccountingWorkbenchOverview } from "./AccountingWorkbenchOverview"
import { AccountingWorkbenchQuestion } from "./AccountingWorkbenchQuestion"
import { AccountingWorkbenchRail } from "./AccountingWorkbenchRail"
import { AccountingWorkbenchRoutine } from "./AccountingWorkbenchRoutine"
import { ACCOUNTING_OPERATIONS_GRID_CLASS_NAME, ACCOUNTING_WORKBENCH_CLASS_NAME } from "./classNames"

/** The settled view and shared rail copy supplied to the workbench drawing boundary. */
type AccountingWorkbenchBlockProps = { readonly props: AccountingWorkbenchBlockData }

/** Render the accounting workbench by composing its named overview, operation, and detail units. */
export const AccountingWorkbenchBlockBase = (props: AccountingWorkbenchBlockProps) => {
    const { view, shared } = props.props
    const sectionProps: AccountingWorkbenchSectionData = {
        view,
        shared,
        scopeReady: view.scopeReady,
    }
    const primary = (
        <AccountingWorkbenchFieldStack>
            <SectionHeader level={2} title={view.t("title")} description={view.t("description")} />
            <AccountingWorkbenchOverview props={sectionProps} />
            <div className={ACCOUNTING_OPERATIONS_GRID_CLASS_NAME}>
                <AccountingWorkbenchIntake props={sectionProps} />
                <AccountingWorkbenchRoutine props={sectionProps} />
            </div>
            <div className={ACCOUNTING_OPERATIONS_GRID_CLASS_NAME}>
                <AccountingWorkbenchQuestion props={sectionProps} />
                <AccountingWorkbenchCorrection props={sectionProps} />
            </div>
            <AccountingWorkbenchDetail props={sectionProps} />
        </AccountingWorkbenchFieldStack>
    )
    const rail = <AccountingWorkbenchRail props={props.props} />

    return (
        <div
            className={ACCOUNTING_WORKBENCH_CLASS_NAME}
            data-contract="GAP-5 MEASURE-2"
            aria-busy={view.overview.standing === "loading" ? true : undefined}
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
