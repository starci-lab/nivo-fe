import { locale as rootLocale } from "next/root-params"
import { getRequestConfig } from "next-intl/server"
import { createRequestResolver, type RequestConfigOptions } from "./request-config"

/**
 * Build the server request config from the root `[locale]` segment while each app keeps its own
 * catalogs. Reading next-intl's deprecated request locale uses a proxy header and makes the route
 * dynamic; the root param is available without giving up prerendering. The value still passes
 * through the app's validator before it can select messages.
 */
export const createRequestConfig = <Locale extends string>(options: RequestConfigOptions<Locale>) => {
    const resolve = createRequestResolver(options)
    return getRequestConfig(async () => resolve(await rootLocale()))
}
