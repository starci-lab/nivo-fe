import { CLASS_NAMES as C } from "./classNames"

type ExploreFlowStep = { readonly title: string; readonly description: string }
type ExploreFlowProps = {
    readonly label: string
    readonly steps: ReadonlyArray<ExploreFlowStep>
    readonly tabletResponsive?: boolean
}

/** Ordered steps used to make each page's public model visible and scannable. */
const ExploreFlow = ({ label, steps, tabletResponsive = false }: ExploreFlowProps) => (
    <ol className={tabletResponsive ? C.tabletResponsiveList : C.list} aria-label={label}>
        {steps.map((step, index) => (
            <li className={C.step} key={step.title}>
                <span className={C.index}>{String(index + 1).padStart(2, "0")}</span>
                <span className={C.headingClassName}>{step.title}</span>
                <span className={C.body}>{step.description}</span>
            </li>
        ))}
    </ol>
)

export default ExploreFlow
