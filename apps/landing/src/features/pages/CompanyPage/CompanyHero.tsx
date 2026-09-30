import { Button, Heading, PageContainer } from "@starci/grammar/common"
import { HeroBand } from "../../../components/blocks/commercial/HeroBand"
import { CompanyArrowIcon } from "./CompanyArrowIcon"
import { CLASS_NAMES } from "./classNames"

type CompanyHeroProps = {
    readonly copy: {
        readonly eyebrow: string
        readonly title: string
        readonly titleEmphasis: string
        readonly lede: string
        readonly primaryAction: string
        readonly secondaryAction: string
        readonly visualLabel: string
        readonly visualBrand: string
        readonly visualCore: string
        readonly organization: string
        readonly product: string
        readonly responsibility: string
    }
    readonly hrefs: {
        readonly nivoOs: string
        readonly ecosystem: string
    }
}

/** Render the Company page's profile statement and organizational visual. */
export const CompanyHero = ({ copy, hrefs }: CompanyHeroProps) => (
    <HeroBand id="nivo-is" variant="company" aria-labelledby="company-title">
        <PageContainer className={CLASS_NAMES.heroGrid}>
            <div className={CLASS_NAMES.heroCopy}>
                <span className={CLASS_NAMES.eyebrow}>{copy.eyebrow}</span>
                <Heading level={1} scale="display">
                    <span id="company-title">
                        {copy.title} <em className={CLASS_NAMES.heroEmphasis}>{copy.titleEmphasis}</em>
                    </span>
                </Heading>
                <p className={CLASS_NAMES.heroBody}>{copy.lede}</p>
                <div className={CLASS_NAMES.actionRow}>
                    <Button
                        href={hrefs.nivoOs}
                        variant="primary"
                        size="lg"
                        endContent={<CompanyArrowIcon />}
                    >
                        {copy.primaryAction}
                    </Button>
                    <Button
                        href={hrefs.ecosystem}
                        variant="secondary"
                        size="lg"
                        endContent={<CompanyArrowIcon />}
                    >
                        {copy.secondaryAction}
                    </Button>
                </div>
            </div>
            <div className={CLASS_NAMES.companyVisual} aria-label={copy.visualLabel}>
                <span className={CLASS_NAMES.visualOrbit} aria-hidden="true" />
                <div className={CLASS_NAMES.visualCore}>
                    <span>{copy.visualBrand}</span>
                    <strong>{copy.visualCore}</strong>
                </div>
                <div className={`${CLASS_NAMES.orbitCard} ${CLASS_NAMES.orbitCardOne}`}>
                    <span>01</span>
                    <strong>{copy.organization}</strong>
                </div>
                <div className={`${CLASS_NAMES.orbitCard} ${CLASS_NAMES.orbitCardTwo}`}>
                    <span>02</span>
                    <strong>{copy.product}</strong>
                </div>
                <div className={`${CLASS_NAMES.orbitCard} ${CLASS_NAMES.orbitCardThree}`}>
                    <span>03</span>
                    <strong>{copy.responsibility}</strong>
                </div>
            </div>
        </PageContainer>
    </HeroBand>
)
