import { FleetRow } from "../../provisioning/FleetRow"
import { APPS_DASHBOARD_RESTING_ROWS_CLASS_NAME } from "./classNames"

export type AppsDashboardRestingRowsProps = { readonly indexes: ReadonlyArray<number> }

/** Draw the requested stable placeholder row identities. */
export const AppsDashboardRestingRows = ({ indexes }: AppsDashboardRestingRowsProps) => (
    <div className={APPS_DASHBOARD_RESTING_ROWS_CLASS_NAME}>
        {indexes.map((index) => (
            <FleetRow
                key={`resting-${index}`}
                props={{ id: `resting-${index}`, kind: "site", kindLabel: "", status: "provisioning" }}
                isLoading
            />
        ))}
    </div>
)
