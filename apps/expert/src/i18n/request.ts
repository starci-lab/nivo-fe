import { getRequestConfig } from "next-intl/server"
import { routing } from "./routing"
import { toLocale } from "./config"

/**
 * WHERE PRODUCT COPY COMES FROM, resolved once per request on the server.
 *
 * Every string this product owns - field labels, button text, refusals, empty states, notices - is
 * a key in `src/messages/*.json`, and a component receives it already resolved.
 *
 * WHAT DOES NOT COME FROM HERE is the academy's own content. The name, the tagline and the words of
 * an expert-authored section arrive in the mounted template. This product never translates them; it
 * only picks which of the versions the expert authored to show, which `template.ts` does with the
 * same locale this file resolves.
 *
 * THE LOCALE NOW COMES FROM THE PATH. It used to be read from a cookie, and that note ended by
 * naming routing as "the next decision rather than half-built now". This is that decision: the
 * segment is resolved by `middleware.ts` before the route is matched, so `/vi` is a real address a
 * reader can send to somebody and a crawler can index -- and, the reason it stopped being optional,
 * `generateMetadata` can see it. A cookie cannot be read early enough for the description tag, so a
 * Vietnamese page was describing itself in English to every search engine.
 *
 * `requestLocale` IS VALIDATED, NOT TRUSTED. It is whatever sat in the path segment, so an
 * unrecognised value resolves to the default instead of reaching the message loader and throwing on
 * a file that is not there.
 */

/**
 * The zone every date on the screen is written in.
 *
 * Fixed rather than inferred. Left unset, next-intl formats on the server in the server's zone and
 * on the client in the reader's, so the same timestamp renders one way and hydrates into another -
 * a markup mismatch React does not patch up, which takes the handlers on that subtree down with it.
 */
const TIME_ZONE = "Asia/Ho_Chi_Minh"

export default getRequestConfig(async ({ requestLocale }) => {
    const locale = toLocale(await requestLocale)
    return {
        locale,
        timeZone: TIME_ZONE,
        messages: (await import(`../messages/${locale}.json`)).default,
    }
})

export { routing }
