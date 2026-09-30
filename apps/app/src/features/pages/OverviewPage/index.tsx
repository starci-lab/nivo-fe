import { OverviewPage as OverviewPageBlock } from "@/components/blocks/console/OverviewPage"

/** Empty route input for the console overview. */
export type OverviewPageProps = { readonly [key: string]: never }

/** Compose the interactive console overview block below the server route. */
export const OverviewPage = (props: OverviewPageProps) => {
    void props
    return <OverviewPageBlock />
}

export default OverviewPage