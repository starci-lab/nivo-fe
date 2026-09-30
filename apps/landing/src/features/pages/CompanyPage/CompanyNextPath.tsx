import { Heading, PageContainer, TextAction } from "@starci/grammar/common"
import { CompanyArrowIcon } from "./CompanyArrowIcon"
import { CLASS_NAMES } from "./classNames"

type CompanyNextPathProps = {
    readonly eyebrow: string
    readonly title: string
    readonly label: string
    readonly links: ReadonlyArray<{ readonly id: string; readonly label: string; readonly href: string }>
}

/** Render the Company page's localized next destinations. */
export const CompanyNextPath = ({ eyebrow, title, label, links }: CompanyNextPathProps) => (
    <section id="company-next-path" className={CLASS_NAMES.companyCta} aria-labelledby="company-next-title">
        <PageContainer className={CLASS_NAMES.ctaGrid}>
            <div>
                <span className={CLASS_NAMES.eyebrow}>{eyebrow}</span>
                <Heading level={2}>
                    <span id="company-next-title">{title}</span>
                </Heading>
            </div>
            <nav className={CLASS_NAMES.ctaLinks} aria-label={label}>
                {links.map((link) => (
                    <TextAction
                        href={link.href}
                        appearance="route"
                        endContent={<CompanyArrowIcon />}
                        key={link.id}
                    >
                        {link.label}
                    </TextAction>
                ))}
            </nav>
        </PageContainer>
    </section>
)
