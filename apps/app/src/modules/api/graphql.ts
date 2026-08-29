/**
 * The nivo core API, reached with `fetch` and nothing else.
 *
 * WHY NO CLIENT LIBRARY, AND WHY THAT ANSWER IS NOT THE EXPERT APP'S. `apps/expert` runs two public
 * unauthenticated calls and its own transport says a normalised cache would be a dependency that had
 * not earned itself - correct there. This app is the opposite case on every count except one: it has
 * a session, a refresh cycle and mutations that invalidate each other. What it still does NOT have
 * is a set of interdependent reads worth normalising; the console pages each own one query. So the
 * missing piece is a SESSION, not a cache, and a cache library would arrive to solve the half that
 * is not the problem. When two screens start reading the same entity and disagreeing about it, that
 * is the moment to reconsider.
 *
 * TWO THINGS TRAVEL, AND ONLY ONE OF THEM IS READABLE HERE. The access token is a Bearer header this
 * module sets from memory. The refresh token is an HttpOnly cookie the browser carries on its own -
 * `nivo_refresh_token`, written by the backend with `sameSite: "lax"` and `path: "/"`. JavaScript
 * cannot read it, which is the point, and it is why every call sets `credentials: "include"`: without
 * that the cookie is simply not sent and a refresh silently behaves like a signed-out user.
 *
 * SAME-SITE HOLDS ACROSS THE PORT SPLIT. `localhost:3067` and `localhost:3068` are different ORIGINS
 * but the same SITE, and `SameSite=Lax` is decided by site rather than by port - so the cookie does
 * travel in development. In production `app.nivo.vn` and the API share `nivo.vn`, so it holds there
 * too. What the port split does require is CORS, and the backend already allows this origin with
 * credentials: `CORS_ORIGIN=http://localhost:3067` in `.env.override`.
 */

/** Where the core API answers. Overridable so a deployed build can point at its own host. */
const ENDPOINT = process.env.NEXT_PUBLIC_CORE_API_URL ?? "http://localhost:3068/graphql";

/**
 * Every response this API sends, whatever the operation.
 *
 * The shape comes from `GraphQLTransformInterceptor`: the payload is wrapped with a `success` flag
 * and a localised `message` rather than returned bare. A caller therefore has three failure modes to
 * tell apart - the request never arrived, GraphQL refused the document, and the operation ran and
 * was refused - and conflating them is how a wrong password gets reported as "network problem".
 */
interface Envelope<T> {
  /** The operation's payload, or null when there is none. */
  readonly data: T | null;
  /** A machine-readable refusal code, when the backend supplies one. */
  readonly error?: string | null;
  /** The refusal or success sentence, already in the reader's language. */
  readonly message: string;
  /** Whether the operation itself succeeded. */
  readonly success: boolean;
}

/** What a caller gets back: the payload, or the reason there is none. */
export type Result<T> = {
  readonly ok: true;
  readonly data: T;
} | {
  readonly ok: false;
  readonly reason: string;
  readonly code?: string;
};

/** How a caller supplies the credential without this module knowing where sessions are kept. */
export type TokenReader = () => string | null;

/** How a caller supplies the reader's language without this module knowing how routing works. */
export type LocaleReader = () => string;

/**
 * The access token this transport puts on the wire.
 *
 * A FUNCTION RATHER THAN A VALUE, because the token is replaced on every refresh and a value captured
 * at module load would be the one that expired. Held here rather than imported from the session so
 * the dependency runs one way: the session knows about the transport, and the transport knows only
 * how to ask for a string.
 */
let readToken: TokenReader = () => null;

/**
 * The language every refusal should come back in.
 *
 * THE BACKEND ALREADY HAS THE SENTENCES. Every resolver declares both `[Locale.En]` and `[Locale.Vi]`
 * messages, and `GraphQLTransformInterceptor` picks English every time - its own comment says "no
 * per-request locale detection in nivo yet". So the Vietnamese half of the API's voice is written and
 * unreachable. This header is the FE end of closing that; until the interceptor reads it, a refusal
 * still arrives in English and the screen shows the API's sentence as it was sent.
 */
let readLocale: LocaleReader = () => "vi";

/**
 * Tell the transport where the current access token lives.
 *
 * @param reader - Answers with the token in force right now, or null when signed out.
 */
export const useAccessTokenFrom = (reader: TokenReader) => {
  readToken = reader;
};

/**
 * Tell the transport which language the reader is in.
 *
 * @param reader - Answers with the active locale.
 */
export const useLocaleFrom = (reader: LocaleReader) => {
  readLocale = reader;
};

/**
 * Run one GraphQL operation.
 *
 * NEVER THROWS. Every call site is a submit handler or a page render, and both have something better
 * to show than a stack trace: the API's own refusal sentence. A thrown error inside a submit would
 * leave the form in its pending state forever.
 *
 * @param query - The operation document.
 * @param variables - Its variables, if any.
 * @returns The unwrapped payload, or why there is none.
 */
export const graphql = async <T,>(query: string, variables?: Readonly<Record<string, unknown>>): Promise<Result<T>> => {
  const token = readToken();
  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      // The refresh cookie rides on this. Without it `refreshSession` looks like a signed-out
      // user rather than like a missing credential, which is a much harder failure to read.
      credentials: "include",
      headers: {
        "content-type": "application/json",
        /*
         * Standard `Accept-Language` rather than a private header, so the backend can read it
         * with the same mechanism any other client would use and no bespoke contract has to
         * be agreed for it.
         */
        "accept-language": readLocale(),
        ...(token === null ? {} : {
          authorization: `Bearer ${token}`
        })
      },
      body: JSON.stringify({
        query,
        variables: variables ?? {}
      })
    });
  } catch {
    return {
      ok: false,
      reason: "network",
      code: "NETWORK"
    };
  }
  let body: {
    data?: Record<string, Envelope<T>>;
    errors?: ReadonlyArray<{
      message: string;
    }>;
  };
  try {
    body = await response.json();
  } catch {
    return {
      ok: false,
      reason: "malformed",
      code: "MALFORMED"
    };
  }

  /*
   * A GraphQL-level error is a different animal from a refused operation: the document was wrong,
   * or the request was unauthenticated before any resolver ran. It never carries the interceptor's
   * envelope, so it has to be read before the envelope is looked for.
   */
  if (body.errors !== undefined && body.errors.length > 0) {
    return {
      ok: false,
      reason: body.errors[0].message,
      code: "GRAPHQL"
    };
  }
  const envelope = body.data === undefined ? undefined : Object.values(body.data)[0];
  if (envelope === undefined) {
    return {
      ok: false,
      reason: "empty",
      code: "EMPTY"
    };
  }
  if (!envelope.success || envelope.data === null) {
    return {
      ok: false,
      reason: envelope.message,
      code: envelope.error ?? undefined
    };
  }
  return {
    ok: true,
    data: envelope.data
  };
};
