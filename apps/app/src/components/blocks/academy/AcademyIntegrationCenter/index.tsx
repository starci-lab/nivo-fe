"use client"

import { useAcademyIntegrationCenter } from "@/hooks/academy/useAcademyIntegrationCenter"
import { AcademyIntegrationCenterBase } from "./component"

/** Owner-scoped identity consumed by Integration Center. */
export type AcademyIntegrationCenterProps = {
    readonly siteId: string
}

/** Connect provider status and write-only forms to the pure Integration Center block. */
export const AcademyIntegrationCenter = (props: AcademyIntegrationCenterProps) => {
    const viewProps = useAcademyIntegrationCenter(props.siteId)
    return <AcademyIntegrationCenterBase {...viewProps} />
}
