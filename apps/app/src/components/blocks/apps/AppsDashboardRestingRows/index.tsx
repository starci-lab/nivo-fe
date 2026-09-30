import { FleetRow } from "../../provisioning/FleetRow"
import { APPS_DASHBOARD_RESTING_ROWS_CLASS_NAME } from "./classNames"

/** Props for {@link AppsDashboardRestingRows}. */
export type AppsDashboardRestingRowsProps = { readonly indexes: ReadonlyArray<number> }

type RestingRowProps = { readonly index: number }

const RestingRow = ({ index }: RestingRowProps) => (
    <FleetRow props={{ id: `resting-${index}`, kind: "site", kindLabel: "", status: "provisioning" }} isLoading />
)

/** Draw the requested stable placeholder row identities. */
export const AppsDashboardRestingRows = (props: AppsDashboardRestingRowsProps) => {
    const { indexes }: AppsDashboardRestingRowsProps = props
    return (
        <div className={APPS_DASHBOARD_RESTING_ROWS_CLASS_NAME}>
            {indexes.map((index) => (
                <RestingRow key={`resting-${index}`} index={index} />
            ))}
        </div>
    )
}
