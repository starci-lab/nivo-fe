import { NivoIcon } from "@nivo/ui"
import { Button, Heading, PageContainer, Text } from "@starci/grammar/common"
import { HeroBand } from "../../../components/blocks/commercial/HeroBand"
import { CLASS_NAMES } from "./classNames"

const NEXT_CHIP_ICON_PROPS = { name: "next", usage: "chip" } as const

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
                <div className={CLASS_NAMES.eyebrow}>
                    <Text as="span">{copy.eyebrow}</Text>
                </div>
                <div id="company-title">
                    <Heading level={1} scale="display">
                        {copy.title}
                        <em className={CLASS_NAMES.heroEmphasis}>{copy.titleEmphasis}</em>
                    </Heading>
                </div>
                <div className={CLASS_NAMES.heroBody}>
                    <Text as="p">{copy.lede}</Text>
                </div>
                <div className={CLASS_NAMES.actionRow}>
                    <Button
                        href={hrefs.nivoOs}
                        variant="primary"
                        size="lg"
                        endContent={<NivoIcon props={NEXT_CHIP_ICON_PROPS} />}
                    >
                        {copy.primaryAction}
                    </Button>
                    <Button
                        href={hrefs.ecosystem}
                        variant="secondary"
                        size="lg"
                        endContent={<NivoIcon props={NEXT_CHIP_ICON_PROPS} />}
                    >
                        {copy.secondaryAction}
                    </Button>
                </div>
            </div>
            <div className={CLASS_NAMES.companyVisual} aria-label={copy.visualLabel}>
                <div className={CLASS_NAMES.visualOrbit} aria-hidden="true" />
                <div className={CLASS_NAMES.visualCore}>
                    <Text as="span">{copy.visualBrand}</Text>
                    <strong>{copy.visualCore}</strong>
                </div>
                <div className={`${CLASS_NAMES.orbitCard} ${CLASS_NAMES.orbitCardOne}`}>
                    <Text as="span">01</Text>
                    <strong>{copy.organization}</strong>
                </div>
                <div className={`${CLASS_NAMES.orbitCard} ${CLASS_NAMES.orbitCardTwo}`}>
                    <Text as="span">02</Text>
                    <strong>{copy.product}</strong>
                </div>
                <div className={`${CLASS_NAMES.orbitCard} ${CLASS_NAMES.orbitCardThree}`}>
                    <Text as="span">03</Text>
                    <strong>{copy.responsibility}</strong>
                </div>
            </div>
        </PageContainer>
    </HeroBand>
)
