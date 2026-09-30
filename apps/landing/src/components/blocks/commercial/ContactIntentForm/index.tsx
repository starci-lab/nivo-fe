import { NivoIcon } from "@nivo/ui"
import { Button, Form, RadioGroup, Text } from "@starci/grammar/common"
import { CardGrid } from "../CardGrid"
import { CLASS_NAMES } from "./classNames"

/** One localized intent option shown by the relationship router. */
type ContactIntentOption = {
    readonly id: string
    readonly label: string
    readonly description: string
}

/** Props for the route-safe, renderer-backed intent selector. */
type ContactIntentFormProps = {
    readonly action: string
    readonly initialIntent?: string | null
    readonly legend: string
    readonly options: ReadonlyArray<ContactIntentOption>
    readonly submitLabel: string
}

const CHECK_CHIP_ICON_PROPS = { name: "complete", usage: "chip" } as const

const ArrowIcon = () => <NivoIcon props={{ name: "next", usage: "chip" }} />

/** Accessible renderer-backed intent choices for the relationship router. */
export const ContactIntentForm = (props: ContactIntentFormProps) => (
    <div className={CLASS_NAMES.form}>
        <Form id="adaptive-form" action={props.action} method="get">
            <CardGrid variant="intent">
                <RadioGroup
                    name="intent"
                    label={props.legend}
                    isLabelHidden
                    defaultValue={props.initialIntent ?? undefined}
                    options={props.options.map((option, index) => ({
                        value: option.id,
                        label: (
                            <Text as="span">
                                <Text as="span">{String(index + 1).padStart(2, "0")}</Text>
                                <strong className={CLASS_NAMES.cardTitle}>{option.label}</strong>
                                <small className={CLASS_NAMES.cardDescription}>{option.description}</small>
                                <Text as="span" data-contact-intent-check="true" aria-hidden="true">
                                    <NivoIcon props={CHECK_CHIP_ICON_PROPS} />
                                </Text>
                            </Text>
                        ),
                    }))}
                    orientation="horizontal"
                />
            </CardGrid>
            <Button type="submit" variant="primary" size="lg" endContent={<ArrowIcon />}>
                {props.submitLabel}
            </Button>
        </Form>
    </div>
)
