import { PageContainer } from "@starci/grammar/common"
import type { ReactNode } from "react"
import { SectionIntro } from "@/features/layouts/SiteShell"
import { CLASS_NAMES as C } from "./classNames"

type ExploreSectionProps = {
    readonly id: string
    readonly eyebrow: string
    readonly title: string
    readonly description?: string
    readonly tone?: "default" | "soft" | "dark" | "burgundy"
    readonly children: ReactNode
}

/** Section heading, tone and content frame shared by the exploration pages. */
const ExploreSection = ({ id, eyebrow, title, description, tone = "default", children }: ExploreSectionProps) => {
    const inverse = tone === "dark" || tone === "burgundy"
    return (
        <section
            id={id}
            className={tone === "soft" ? C.soft : tone === "dark" ? C.dark : tone === "burgundy" ? C.burgundy : C.section}
            aria-labelledby={`${id}-title`}
        >
            <PageContainer className={C.inner}>
                <SectionIntro
                    id={`${id}-title`}
                    eyebrow={eyebrow}
                    title={title}
                    description={description}
                    inverse={inverse}
                />
                {children}
            </PageContainer>
        </section>
    )
}

export default ExploreSection
