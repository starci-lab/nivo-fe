import { Avatar, type AvatarData, QueryNoticeView, type QueryNoticeViewData } from "@nivo/ui"
import { SurfaceCard, Button, Button as CoreButton, Heading, Text, TextAction, Badge } from "@starci/grammar/common"

/** Resolved copy for the lead pipeline. */
export type AcademyLeadPipelineProps = AcademyLeadPipelineViewProps
/** Public API role for AcademyLeadPipelineLabels. */
type AcademyLeadPipelineLabels = {
    readonly section: string
    readonly empty: string
    readonly open: string
    readonly detail: string
    readonly advance: string
    readonly draft: string
    readonly saved: string
    readonly actionFailed: string
}

/** Atoms the pure lead pipeline draws; the connected half owns the lead request. */
type AcademyLeadPipelineData = {
    readonly leads: ReadonlyArray<ExpertSiteLeadFieldsFragment>
    readonly selected?: ExpertSiteLeadFieldsFragment
    readonly draft?: string
    readonly pendingAction?: "advance" | "draft"
    readonly message?: string
    /** The failure the connected half composed for a settled failed read. */
    readonly notice?: QueryNoticeViewData
    readonly labels: AcademyLeadPipelineLabels
}

/** Actions the pure lead pipeline emits; every argument is an atom. */
type AcademyLeadPipelineActions = {
    readonly openLead: (leadId: string) => void
    readonly advance: () => void
    readonly draftReply: () => void
    /** Re-read the leads after a failed answer. */
    readonly retryNotice: () => void
}

/** Pure lead pipeline state. */
type AcademyLeadPipelineViewProps = {
    readonly state: "resting" | "empty" | "failed" | "answered"
    readonly props: AcademyLeadPipelineData
    readonly on: AcademyLeadPipelineActions
}

/** The resting avatar draws one fixed face, so its atoms are module-level. */
const RESTING_AVATAR_PROPS: AvatarData = { size: "md" }

/** Render leads as a joined identity scan with one selected follow-up. */
const AcademyLeadPipelineContent = (input: AcademyLeadPipelineViewProps) => {
    const { state } = input
    const { leads, selected, draft, pendingAction, message, notice, labels } = input.props
    const { openLead, advance, draftReply, retryNotice } = input.on
    const leadRows: ReadonlyArray<{ lead: ExpertSiteLeadFieldsFragment; avatar: AvatarData }> = leads.map((lead) => ({
        lead,
        avatar: { name: lead.name, size: "md" },
    }))
    const rows =
        state === "resting"
            ? [0, 1, 2].map((_, index) => (
                  <div key={index}>
                      <Avatar props={RESTING_AVATAR_PROPS} isLoading />
                      <div>
                          <TextAction size="sm" isSkeleton>
                              {""}
                          </TextAction>
                          <Text isSkeleton>{""}</Text>
                      </div>

                      <Button isSkeleton>{labels.open}</Button>
                  </div>
              ))
            : leadRows.map(({ lead, avatar }) => (
                  <div key={lead.id}>
                      <Avatar props={avatar} />
                      <div>
                          <TextAction size="sm" onPress={() => openLead(lead.id)}>
                              {lead.name}
                          </TextAction>
                          <Text size="xs" tone="muted">
                              {lead.contact}
                          </Text>
                      </div>

                      <Badge tone={lead.status === ExpertSiteLeadStatus.Won ? "success" : "neutral"}>{lead.status}</Badge>
                      <CoreButton size="sm" onPress={() => openLead(lead.id)}>
                          {labels.open}
                      </CoreButton>
                  </div>
              ))
    const note = state === "empty" ? labels.empty : undefined
    return (
        <>
            {state === "failed" ? (
                <SurfaceCard label={labels.section}>
                    <div>
                        {notice === undefined ? null : <QueryNoticeView props={notice} on={{ retry: retryNotice }} />}
                    </div>
                </SurfaceCard>
            ) : note === undefined ? (
                <SurfaceCard
                    label={labels.section}
                    labelEnd={
                        (state === "answered" ? String(leads.length) : undefined) === undefined ? null : (
                            <Text size="sm" tone="muted" isSkeleton={state === "resting"}>
                                {state === "answered" ? String(leads.length) : undefined}
                            </Text>
                        )
                    }
                >
                    <div>{rows}</div>
                </SurfaceCard>
            ) : (
                <SurfaceCard label={labels.section}>
                    <div>
                        <Text size="sm" tone="muted">
                            {note}
                        </Text>
                    </div>
                </SurfaceCard>
            )}
            {selected === undefined ? null : (
                <SurfaceCard label={labels.detail}>
                    <div>
                        <Heading level={3}>{selected.name}</Heading>
                        <Text size="sm" tone="muted">
                            {draft ?? selected.message ?? selected.contact}
                        </Text>
                        <CoreButton
                            variant="primary"
                            isPending={pendingAction !== undefined}
                            onPress={draft === undefined ? draftReply : advance}
                        >
                            {draft === undefined ? labels.draft : labels.advance}
                        </CoreButton>
                    </div>
                </SurfaceCard>
            )}
            {message === undefined ? null : (
                <Text size="sm" tone="muted">
                    {message}
                </Text>
            )}
        </>
    )
}

/** Stable typed root for the Academy lead block. */
export const AcademyLeadPipelineBase = (props: AcademyLeadPipelineProps) => <AcademyLeadPipelineContent {...props} />
