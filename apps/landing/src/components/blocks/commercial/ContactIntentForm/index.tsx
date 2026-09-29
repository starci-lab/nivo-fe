import { NivoIcon } from "@nivo/ui"
import { Button, RadioGroup } from "@starci/grammar/common"
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

const ArrowIcon = () => <NivoIcon props={{ name: "next", usage: "chip" }} />

/** Accessible renderer-backed intent choices for the relationship router. */
export const ContactIntentForm = (props: ContactIntentFormProps) => (
    <form id="adaptive-form" className={CLASS_NAMES.form} action={props.action} method="get">
        <CardGrid variant="intent">
            <RadioGroup
                name="intent"
                label={props.legend}
                isLabelHidden
                defaultValue={props.initialIntent ?? undefined}
                options={props.options.map((option, index) => ({
                    value: option.id,
                    label: (
                        <span className={CLASS_NAMES.cardCopy}>
                            <span className={CLASS_NAMES.cardIndex}>{String(index + 1).padStart(2, "0")}</span>
                            <strong className={CLASS_NAMES.cardTitle}>{option.label}</strong>
                            <small className={CLASS_NAMES.cardDescription}>{option.description}</small>
                            <span
                                className={CLASS_NAMES.cardCheck}
                                data-contact-intent-check="true"
                                aria-hidden="true"
                            >
                                <NivoIcon props={{ name: "complete", usage: "chip" }} />
                            </span>
                        </span>
                    ),
                }))}
                orientation="horizontal"
            />
        </CardGrid>
        <Button type="submit" variant="primary" size="lg" endContent={<ArrowIcon />}>
            {props.submitLabel}
        </Button>
    </form>
)
