import { useTranslations } from "next-intl"
import { LoadingPageBase } from "./component"

/** Public API role for LoadingPageProps. */
export type LoadingPageProps = { readonly [key: string]: never }

/** PAGE - the answer while a route segment is resolving. */
export const LoadingPage = (props: LoadingPageProps) => {
    void props
    const t = useTranslations("boundary.loading")
    return <LoadingPageBase props={{ label: t("label") }} />
}
