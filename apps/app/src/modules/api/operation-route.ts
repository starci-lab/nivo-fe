/**
 * The registered installation operation route, shared by every module client that speaks it.
 *
 * Sales, Accounting and the AgentOS shell each POST or GET one registered `name@version` under
 * `/api/v1/agentos/workspaces/...` on the core API. What is the same for all of them lives here: the
 * address, the bound on the stable identity, the closed error names the route answers by, the
 * bearer-only credential, and which {@link FailureKind} each of those names is. What is different -
 * the module's own result grammar and its refusal vocabulary - stays in the module's client.
 *
 * BEARER ONLY, NEVER THE COOKIE. `credentials: "omit"` keeps the refresh cookie at the core session
 * boundary; the access token travels in the Authorization header only - never in a URL, browser
 * storage or a log.
 *
 * ONE CALL IS ONE REQUEST. No loop, no timer and no re-send. A caller replays the SAME stable identity
 * if it decides to try again, which is what keeps a replay one intent.
 */
import { CORE_API_URL } from "@/modules/config";
import type { FailureKind } from "./outcome";
import { send } from "./transport";

/** The registered installation operation route prefix; an absolute path, so it replaces `/graphql`. */
export const OPERATION_ROUTE_PREFIX = "/api/v1/agentos/workspaces";

/** The three installation coordinates every operation address carries. */
export type InstallationScope = {
  readonly workspaceId: string;
  readonly instanceId: string;
  readonly installationId: string;
};

/** The longest stable identity the route accepts, mirroring its own bound. */
const MAXIMUM_REQUEST_ID_LENGTH = 512;

/** The closed error names the route answers by. UNAUTHENTICATED arrives as a status, never a body. */
export type RouteErrorName =
  | "BAD_REQUEST"
  | "REFUSED"
  | "UNSUPPORTED_OPERATION_VERSION"
  | "OPERATION_NOT_REGISTERED_FOR_INSTALLATION"
  | "CURRENT_AUTHORITY_UNAVAILABLE"
  | "CONTROLPLANE_UNAVAILABLE"
  | "DEADLINE_EXCEEDED";

const ROUTE_ERROR_NAMES: ReadonlySet<string> = new Set<RouteErrorName>([
  "BAD_REQUEST",
  "REFUSED",
  "UNSUPPORTED_OPERATION_VERSION",
  "OPERATION_NOT_REGISTERED_FOR_INSTALLATION",
  "CURRENT_AUTHORITY_UNAVAILABLE",
  "CONTROLPLANE_UNAVAILABLE",
  "DEADLINE_EXCEEDED"
]);

/** Whether a reply kind is one of the route's closed error names. */
export const isRouteErrorName = (value: unknown): value is RouteErrorName => typeof value === "string" && ROUTE_ERROR_NAMES.has(value);

/** What this browser half adds: conditions the route never gets to name. */
export type RouteTransportCode = "UNAUTHENTICATED" | "UNREACHABLE" | "MALFORMED_ANSWER" | "UNEXPECTED_RESULT_KIND" | "ECHOED_IDENTITY_MISMATCH" | "BAD_REQUEST";

/** Which failure kind a route or module refusal code states; a code no table names is unavailable. */
export const routeFailureKind = (code: string): FailureKind => {
  switch (code) {
    case "UNAUTHENTICATED":
      return "refused";
    case "REFUSED":
    case "forbidden":
    case "SALES_REFUSED_DENIED":
      return "forbidden";
    case "OPERATION_NOT_REGISTERED_FOR_INSTALLATION":
      return "not-found";
    case "BAD_REQUEST":
    case "UNSUPPORTED_OPERATION_VERSION":
    case "validation":
    case "conflict":
    case "SALES_REFUSED_INVALID":
    case "SALES_REFUSED_CONFLICT":
      return "invalid";
    default:
      return "unavailable";
  }
};

/** A plain record: an object that is neither null nor an array. */
export const isClosedRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

/** Bounded printable text; a control byte would split or hide the wire field it travels in. */
export const isPrintableIdentity = (value: string): boolean =>
  value.length > 0 &&
  value.length <= MAXIMUM_REQUEST_ID_LENGTH &&
  [...value].every(character => {
    const code = character.codePointAt(0) ?? 0;
    return code >= 0x20 && code !== 0x7f;
  });

/**
 * Build the one address of one registered operation.
 *
 * The three coordinates are percent-encoded because they are caller-held; the operation name is not,
 * because it is one of a closed set of literal registered names and the receiver matches its `@1`
 * version separator verbatim.
 *
 * @param scope - The installation the operation is addressed to.
 * @param operation - The registered `name@version`.
 * @returns The absolute address.
 */
export const operationAddress = (scope: InstallationScope, operation: string): string =>
  new URL(
    `${OPERATION_ROUTE_PREFIX}/${encodeURIComponent(scope.workspaceId)}/instances/${encodeURIComponent(scope.instanceId)}/installations/${encodeURIComponent(scope.installationId)}/operations/${operation}`,
    CORE_API_URL
  ).toString();

/** What one operation request settled as: the reply body, or the transport condition that stopped it. */
export type RouteExchange =
  | { readonly arrived: true; readonly body: unknown }
  | { readonly arrived: false; readonly code: RouteTransportCode; readonly reason: string; readonly requestId: string | null };

/**
 * Send exactly one operation request and classify how it travelled.
 *
 * The body of a non-2xx reply is still handed back: the route names its refusals in the body
 * (`kind: "REFUSED"`), so a module reads them from there whatever the status was. Only a 401, which
 * the route states as a status and never as a body, and a body that is not JSON, stop here.
 *
 * @param accessToken - The volatile bearer token, or null when the session minted none.
 * @param address - The operation address.
 * @param requestId - The stable identity the caller minted for this intent.
 * @param request - The operation's request document.
 * @returns The body that arrived, or the condition that stopped the request.
 */
export const sendOperation = async (accessToken: string | null, address: string, requestId: string, request: unknown): Promise<RouteExchange> => {
  if (!isPrintableIdentity(requestId)) {
    return { arrived: false, code: "BAD_REQUEST", reason: "The stable operation identity is empty, over-long or carries a control byte.", requestId };
  }
  if (accessToken === null || accessToken.length === 0) {
    return { arrived: false, code: "UNAUTHENTICATED", reason: "No access token is held, so no request left the browser.", requestId: null };
  }
  const sent = await send({ url: address, method: "POST", credentials: "omit", accessToken, json: { requestId, input: request } });
  if (sent.ok) return { arrived: true, body: sent.data.body };
  if (sent.kind === "refused") return { arrived: false, code: "UNAUTHENTICATED", reason: "Core refused the bearer token.", requestId };
  if (sent.status === null) return { arrived: false, code: "UNREACHABLE", reason: `The Core route could not be reached: ${sent.reason}`, requestId };
  if (sent.body === null) return { arrived: false, code: "MALFORMED_ANSWER", reason: "The route answer is not JSON.", requestId };
  return { arrived: true, body: sent.body };
};
