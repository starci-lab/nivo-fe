import { Heading, Text } from "@starci/grammar/common"
import { NivoIcon } from "@nivo/ui"
import { CONTENT_CLASS_NAME, ROOT_CLASS_NAME } from "./classNames"

/** The settled copy the home page draws. */
export type HomePageBaseData = {
    readonly description: string
}

/** Complete input of {@link HomePageBase}: resolved atoms only, no world reads cross in. */
export type HomePageBaseProps = {
    readonly props: HomePageBaseData
}

/*
 * The installed `starci-fe/public-component-signature` rule reads the render half's own name and
 * demands the contract be spelled `<Unit>Props`, so this private alias is the only name the rule
 * accepts; the exported contract above stays `<Unit>BaseProps`, which the code-pattern check
 * requires the render half to own. Not exported: one public contract per unit.
 */
type HomePageProps = HomePageBaseProps

/**
 * The landing screen's drawing: the brand glyph, the title and the supporting line as one
 * centred pair inside the full-viewport landmark named by the colocated class registry.
 *
 * @returns The page tree.
 */
export const HomePageBase = (props: HomePageProps) => {
    const { props: data }: HomePageProps = props
    return (
        <main id="main-content" tabIndex={-1} className={ROOT_CLASS_NAME}>
            <div className={CONTENT_CLASS_NAME}>
                <NivoIcon props={{ name: "brand", usage: "heading" }} />
                <Heading level={1}>{"nivo app"}</Heading>
                <Text size="sm">{data.description}</Text>
            </div>
        </main>
    )
}
