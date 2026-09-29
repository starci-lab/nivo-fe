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

/** Where the live channel of a workspace stands; the hint channel is the freshness mechanism while it is up. */
export type CollabLiveStatus = "idle" | "connecting" | "subscribed" | "disconnected";

/** How often each read re-reads by itself while the live channel is down, in milliseconds. */
const COLLAB_FALLBACK_POLL_MS = {
    group: 5_000,
    notices: 15_000,
} as const;

/**
 * The polling interval a Collab read needs right now.
 *
 * ONE FRESHNESS MECHANISM PER READ. While the socket is up the pushed hint tells the surface what to
 * re-read, so nothing polls; polling exists only as the fallback for a socket that was lost or
 * refused, and stops the moment the channel is subscribed again.
 *
 * @param status - The live channel's standing.
 * @param read - Which read asks.
 * @returns The interval in milliseconds, or 0 when the hint channel owns freshness.
 */
export const collabFallbackInterval = (status: CollabLiveStatus, read: keyof typeof COLLAB_FALLBACK_POLL_MS): number =>
    status === "disconnected" ? COLLAB_FALLBACK_POLL_MS[read] : 0;
