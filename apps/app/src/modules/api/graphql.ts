import { createGraphqlClient } from "@nivo/api"
import { CORE_API_URL } from "@/modules/config"

/**
 * The console's binding of the shared core-API client.
 *
 * TWO THINGS TRAVEL, AND ONLY ONE OF THEM IS READABLE HERE. The access token is a Bearer header the
 * client sets from memory. The refresh token is an HttpOnly cookie the browser carries on its own -
 * `nivo_refresh_token`, written by the backend with `sameSite: "lax"` and `path: "/"` - which is why
 * every call uses `credentials: "include"`: without it the cookie is simply not sent and a refresh
 * silently behaves like a signed-out user. Same-site holds across the development port split, and in
 * production `app.nivo.vn` and the API share `nivo.vn`; what the split does require is CORS, which the
 * backend already allows for this origin with credentials.
 *
 * THE MODULE-SIDE DOORS. The session store is a `modules/` owner, which may not import the hooks root,
 * so it binds its token and language readers through the setters here; a component binds through the
 * `useAccessTokenFrom` / `useLocaleFrom` hooks (`@/hooks/auth`), which call the same setters.
 */
export const { graphql, graphqlEnvelope, graphqlFields, setAccessTokenReader, setLocaleReader } = createGraphqlClient({
    endpoint: CORE_API_URL,
    credentials: "include",
})
