import { TextAction } from "@starci/grammar/common"
import { NivoIcon } from "@nivo/ui"
import { useLocalizedHref } from "@/hooks"
import { CLASS_NAMES as C } from "./classNames"

const NEXT_CHIP_ICON = { name: "next", usage: "chip" } as const

type ExplorePath = { readonly label: string; readonly href: string }
type ExplorePathGridProps = { readonly label: string; readonly paths: ReadonlyArray<ExplorePath> }

/** Numbered links to the next governed public destinations. */
const ExplorePathGrid = ({ label, paths }: ExplorePathGridProps) => {
    const href = useLocalizedHref()
    return (
        <nav className={C.list} aria-label={label}>
            {paths.map((path, index) => (
                <div className={C.card} key={path.href}>
                    <span className={C.index}>{String(index + 1).padStart(2, "0")}</span>
                    <TextAction
                        href={href(path.href)}
                        appearance="route"
                    >
                        <span className={C.actionContent}>
                            {path.label}
                            <NivoIcon key="next" props={NEXT_CHIP_ICON} />
                        </span>
                    </TextAction>
                </div>
            ))}
        </nav>
    )
}

export default ExplorePathGrid
