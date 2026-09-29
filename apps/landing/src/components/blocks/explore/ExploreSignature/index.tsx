import { NivoIcon } from "@nivo/ui"
import { CLASS_NAMES as C } from "./classNames"

type ExploreSignatureProps = {
    readonly title: string
    readonly label: string
    readonly sequence: ReadonlyArray<string>
}

/** Compact evidence sequence that closes the Trust loop. */
const ExploreSignature = ({ title, label, sequence }: ExploreSignatureProps) => (
    <div className={C.panel}>
        <span className={C.icon} aria-hidden="true">
            <NivoIcon props={{ name: "complete", usage: "heading" }} />
        </span>
        <strong className={C.title}>{title}</strong>
        <div className={C.sequence} aria-label={label}>
            {sequence.map((item, index) => (
                <span className={C.item} key={item}>
                    {item}
                    {index < sequence.length - 1 ? <NivoIcon props={{ name: "next", usage: "chip" }} /> : null}
                </span>
            ))}
        </div>
    </div>
)

export default ExploreSignature
