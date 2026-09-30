import Image from "next/image"
import { NivoIcon } from "@nivo/ui"
import { Button, Heading, PageContainer, Text } from "@starci/grammar/common"
import { HomeMotionHeroReveal } from "../../../components/blocks/landing/HomeMotion"
import { HomeMotionHeroParallax } from "../../../components/blocks/landing/HomeMotionHeroParallax"
import { CLASS_NAMES } from "./classNames"

type HomeHeroProps = {
    readonly copy: {
        readonly eyebrow: string
        readonly titlePrefix: string
        readonly titleAccent: string
        readonly descriptor: string
        readonly supporting: string
        readonly philosophy: string
        readonly primary: string
        readonly secondary: string
        readonly signal: string
        readonly artworkAlt: string
        readonly artworkCaption: string
    }
    readonly hrefs: { readonly primary: string; readonly secondary: string }
}

/** Render the homepage promise, actions and hero artwork. */
export const HomeHero = ({ copy, hrefs }: HomeHeroProps) => (
    <section className={CLASS_NAMES.hero.section} aria-labelledby="home-hero-title">
        <PageContainer className={CLASS_NAMES.hero.container}>
            <HomeMotionHeroReveal>
                <Text as="p" size="xs" tone="accent" weight="semibold">
                    {copy.eyebrow}
                </Text>
                <Heading level={1} scale="display">
                    <span id="home-hero-title">
                        {copy.titlePrefix}{" "}
                        <span className={CLASS_NAMES.hero.titleAccent}>{copy.titleAccent}</span>
                    </span>
                </Heading>
                <Text as="p" size="sm" weight="semibold">
                    {copy.descriptor}
                </Text>
                <Text as="p" size="md" tone="muted">
                    {copy.supporting}
                </Text>
                <Text as="p" size="sm" weight="semibold">
                    {copy.philosophy}
                </Text>
                <div className={CLASS_NAMES.hero.actions}>
                    <Button
                        href={hrefs.primary}
                        variant="primary"
                        size="lg"
                        endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}
                    >
                        {copy.primary}
                    </Button>
                    <Button
                        href={hrefs.secondary}
                        variant="secondary"
                        size="lg"
                        endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}
                    >
                        {copy.secondary}
                    </Button>
                </div>
            </HomeMotionHeroReveal>
            <figure className={CLASS_NAMES.hero.visual}>
                <HomeMotionHeroParallax distance={26}>
                    <span className={CLASS_NAMES.hero.signal} aria-hidden="true">
                        {copy.signal}
                    </span>
                    <Image
                        className={CLASS_NAMES.hero.mascot}
                        src="/images/nivo-unicorn-responsibility-transparent-v18.png"
                        alt={copy.artworkAlt}
                        width={1254}
                        height={1254}
                        sizes="(max-width: 48rem) 100vw, 56vw"
                        priority
                    />
                </HomeMotionHeroParallax>
                <figcaption className={CLASS_NAMES.hero.screenReaderOnly}>{copy.artworkCaption}</figcaption>
            </figure>
        </PageContainer>
    </section>
)
