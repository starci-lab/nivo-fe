import { NivoGrammarRoot } from "../../leaves/NivoGrammar"
import { RouteStateView, type RouteStateViewData } from "../RouteStateView"
import { Skeleton } from "@starci/grammar/common"

/** Resolved copy of the root-layout error answer. */
export type GlobalErrorPageBaseData = Pick<RouteStateViewData, "message" | "description" | "actionLabel">

/** The recovery action the root-layout error answer offers. */
type GlobalErrorPageBaseActions = { readonly retry: () => void }

/** Complete input for the root-layout error answer's drawing. */
type GlobalErrorPageBaseProps = {
    readonly props: GlobalErrorPageBaseData | undefined
    readonly on: GlobalErrorPageBaseActions
}

type GlobalErrorPageProps = GlobalErrorPageBaseProps

/** Draw the root-layout failure with its own grammar root and loading geometry. */
export const GlobalErrorPageBase = ({ props, on }: GlobalErrorPageProps) => (
    <NivoGrammarRoot>
        {props === undefined ? (
            <Skeleton shape="text" lines={3} />
        ) : (
            <RouteStateView props={{ role: "alert", ...props }} on={{ action: on.retry }} />
        )}
    </NivoGrammarRoot>
)
