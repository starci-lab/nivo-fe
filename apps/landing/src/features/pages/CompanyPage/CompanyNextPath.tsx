import { NivoIcon } from "@nivo/ui"
import { Heading, PageContainer, TextAction, Text, SurfaceCard } from "@starci/grammar/common"
import { CLASS_NAMES } from "./classNames"

const NEXT_CHIP_ICON_PROPS = { name: "next", usage: "chip" } as const

type CompanyNextPathProps = {
    readonly eyebrow: string
    readonly title: string
    readonly label: string
    readonly links: ReadonlyArray<{ readonly id: string; readonly label: string; readonly href: string }>
}

/** Render the Company page's localized next destinations. */
export const CompanyNextPath = ({ eyebrow, title, label, links }: CompanyNextPathProps) => (
    <div role="region" id="company-next-path" className={CLASS_NAMES.companyCta} aria-labelledby="company-next-title">
        <SurfaceCard frame="frameless">
            <PageContainer className={CLASS_NAMES.ctaGrid}>
                <div>
                    <div className={CLASS_NAMES.eyebrow}>
                        <Text as="span">{eyebrow}</Text>
                    </div>
                    <div id="company-next-title">
                        <Heading level={2}>{title}</Heading>
                    </div>
                </div>
                <div role="navigation" className={CLASS_NAMES.ctaLinks} aria-label={label}>
                    {links.map((link) => (
                        <TextAction
                            href={link.href}
                            appearance="route"
                            endContent={<NivoIcon props={NEXT_CHIP_ICON_PROPS} />}
                            key={link.id}
                        >
                            {link.label}
                        </TextAction>
                    ))}
                </div>
            </PageContainer>
        </SurfaceCard>
    </div>
)
