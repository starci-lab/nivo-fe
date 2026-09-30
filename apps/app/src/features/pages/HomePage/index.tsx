import { useTranslations } from "next-intl"
import { HomePageBase } from "./component"

/** Public API role for HomePageProps. */
export type HomePageProps = { readonly [key: string]: never }

/**
 * PAGE - the control plane's landing screen.
 *
 * It draws one leaf from the shared package on purpose: it is the smallest thing that proves the
 * workspace link, the Next transpile step and the Tailwind `@source` line all work. When this page
 * renders a sized glyph, the scaffold is sound and screens can be built on it.
 *
 * It also proves the part that is easy to skip: that a screen can say what it looks like WITHOUT
 * writing a class. The glyph, the title and the supporting line are one centred pair named by a
 * registry key, and the landmark around them is the `host` its registry entry names, not a
 * hand-written `main`.
 *
 * One file rather than two, per SPLIT-6: the split exists because a request exists, and this screen
 * makes none.
 *
 * @returns The page.
 */
export const HomePage = (props: HomePageProps) => {
    void props
    const t = useTranslations("app")
    const consoleCopy = useTranslations("console")
    return <HomePageBase props={{ brandLabel: consoleCopy("brand"), description: t("description") }} />
}
