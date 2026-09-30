import { useContext } from "react"
import { OverviewDataContext } from "./overview.shared"

/** Read the shared account answers from a connected overview block. */
export const useOverviewData = () => {
    const value = useContext(OverviewDataContext)
    if (value === null) throw new Error("useOverviewData must be used inside OverviewDataProvider")
    return value
}
