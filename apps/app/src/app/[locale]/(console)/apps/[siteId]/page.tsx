import { AcademyControlCenterPage } from "@/components/pages/AcademyControlCenterPage"

/** Dynamic identity supplied by the locale-aware Academy route. */
export type AcademyControlCenterRouteProps = { readonly params: Promise<{ readonly siteId: string }> }

/** Mount one exact owner-scoped Academy control center. */
const AcademyControlCenterRoute = async ({ params }: AcademyControlCenterRouteProps) => {
    const { siteId } = await params
    return <AcademyControlCenterPage siteId={siteId} />
}

export default AcademyControlCenterRoute