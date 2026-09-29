import { Button, Heading, PageContainer, Text } from "@starci/grammar/common"
import { NivoIcon } from "@nivo/ui"
import { useLocalizedHref } from "../../../../hooks"
import { CLASS_NAMES as C } from "./classNames"

type ExploreAction = { readonly label: string; readonly href: string }
type ExploreHeroProps = {
    readonly id: string
    readonly eyebrow: string
    readonly title: string
    readonly description: string
    readonly primary: ExploreAction
    readonly secondary?: ExploreAction
    readonly modelLabel: string
    readonly modelSteps: ReadonlyArray<string>
    readonly visual?: "trust" | "ecosystem" | "ideas"
}

/** Shared discovery hero and its short visual model. */
const ExploreHero = (props: ExploreHeroProps) => {
    const href = useLocalizedHref()
    return (
        <section id={props.id} className={C.section} data-visual={props.visual} aria-labelledby={`${props.id}-title`}>
            <span className={C.ring} aria-hidden="true" />
            <span className={C.dots} aria-hidden="true" />
            <PageContainer className={C.inner}>
                <div className={C.copy}>
                    <Text as="p" size="xs" tone="accent" weight="semibold">
                        {props.eyebrow}
                    </Text>
                    <Heading level={1} scale="display">
                        <span id={`${props.id}-title`}>{props.title}</span>
                    </Heading>
                    <Text as="p" size="md" tone="muted">
                        {props.description}
                    </Text>
                    <div className={C.actions}>
                        <span className={C.action}>
                            <Button
                                href={href(props.primary.href)}
                                variant="primary"
                                size="lg"
                                endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}
                            >
                                {props.primary.label}
                            </Button>
                        </span>
                        {props.secondary === undefined ? null : (
                            <span className={C.action}>
                                <Button
                                    href={href(props.secondary.href)}
                                    variant="secondary"
                                    size="lg"
                                    endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}
                                >
                                    {props.secondary.label}
                                </Button>
                            </span>
                        )}
                    </div>
                </div>
                <div className={C.model} aria-label={props.modelLabel}>
                    <span className={C.modelEdge} aria-hidden="true" />
                    <span className={C.modelHalo} aria-hidden="true" />
                    <div className={C.modelTop}>
                        <span className={C.modelPulse} aria-hidden="true" />
                        <Text as="span" size="xs" weight="semibold">
                            {props.modelLabel}
                        </Text>
                    </div>
                    <ol className={C.modelList}>
                        {props.modelSteps.map((step, index) => (
                            <li
                                className={
                                    index === 1
                                        ? C.modelStepTwo
                                        : index === 2
                                          ? C.modelStepThree
                                          : index === 3 && props.visual === "ecosystem"
                                            ? C.modelStepFour
                                            : C.modelStep
                                }
                                key={step}
                            >
                                <span className={C.modelIndex}>{String(index + 1).padStart(2, "0")}</span>
                                <span className={C.modelIcon} aria-hidden="true">
                                    <NivoIcon
                                        props={{
                                            name:
                                                index === props.modelSteps.length - 1
                                                    ? "complete"
                                                    : index === 0
                                                      ? "search"
                                                      : "code",
                                            usage: "heading",
                                        }}
                                    />
                                </span>
                                <strong className={C.modelStepTitle}>{step}</strong>
                                {index < props.modelSteps.length - 1 ? (
                                    <span className={C.modelNext} aria-hidden="true">
                                        <NivoIcon props={{ name: "next", usage: "chip" }} />
                                    </span>
                                ) : null}
                            </li>
                        ))}
                    </ol>
                </div>
            </PageContainer>
        </section>
    )
}

export default ExploreHero
