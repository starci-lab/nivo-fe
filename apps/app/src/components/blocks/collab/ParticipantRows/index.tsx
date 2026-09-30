import type { ReactNode } from "react"
import type { CollabOfficeParticipant } from "@/modules/api/collab"
import type { GroupChatPageLabels } from "../../../../modules/collab/group-chat/types"
import { MemberRow } from "../MemberRow"

/** Props for one roster group that renders its empty state or shared member rows. */
type ParticipantRowsProps = {
    readonly participants: ReadonlyArray<CollabOfficeParticipant>
    readonly labels: GroupChatPageLabels
    readonly density: "compact" | "roomy" | "detailed"
    readonly empty: ReactNode
    /** Optional content shown before populated rows, such as the human count badge. */
    readonly beforeRows?: ReactNode
}

/** Render a participant group's empty state and consistently keyed member rows. */
export const ParticipantRows = (props: ParticipantRowsProps) => {
    const { participants, labels, density, empty, beforeRows } = props
    if (participants.length === 0) return empty
    const rowProps =
        density === "detailed" ? { detailed: true } : density === "roomy" ? { roomy: true } : { compact: true }
    return (
        <>
            {beforeRows}
            {participants.map((participant) => (
                <MemberRow
                    key={
                        participant.kind === "module"
                            ? (participant.moduleInstallationId ?? participant.memberId)
                            : participant.memberId
                    }
                    participant={participant}
                    labels={labels}
                    {...rowProps}
                />
            ))}
        </>
    )
}
