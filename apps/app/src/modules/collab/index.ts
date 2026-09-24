/**
 * Collab domain vocabulary shared outside the transport layer.
 *
 * `modules/api/collab` owns requests and wire shapes; the turn state a notice
 * names is a domain fact, so it lives here and the transport file imports it -
 * one home for the closed set, re-exported nowhere.
 */

/** The current authoritative state of the turn a notice names, re-read at follow time. */
export type CollabTurnState = {
    readonly state: "open" | "handled" | "ended";
    readonly handledByMemberId: string | null;
    readonly decision: "answered" | "approve" | "reject" | null;
    readonly handledAt: string | null;
};
