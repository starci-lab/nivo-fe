import { AcademyControlCenter } from "@/components/blocks/academy/AcademyControlCenter"

/** Exact Academy identity supplied by the resource route. */
export type AcademyControlCenterPageProps = {
    readonly siteId: string
}

/** Compose the interactive Academy block for one resource route. */
export const AcademyControlCenterPage = (props: AcademyControlCenterPageProps) => (
    <AcademyControlCenter siteId={props.siteId} />
)

export default AcademyControlCenterPage