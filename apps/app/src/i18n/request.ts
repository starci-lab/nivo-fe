import { getRequestConfig } from "next-intl/server"
import { TIME_ZONE, toLocale } from "./config"
import { routing } from "./routing"

/**
 * WHERE PRODUCT COPY COMES FROM, resolved once per request on the server.
 *
 * Every string this product owns - field labels, button text, refusals, empty states, notices - is a
 * key in `src/messages/*.json`, and a component receives it already resolved. A component never
 * holds a sentence, and never chooses which language it is in.
 *
 * WHY THAT IS A RULE AND NOT A PREFERENCE. Copy written at the call site is copy nobody can find:
 * the same word ends up spelled three ways across three screens, a term the business renames has to
 * be hunted through JSX, and a second language is impossible without touching every file that
 * happens to render a word. The catalogue makes the product's whole voice one file to read.
 *
 * THE LOCALE IS ROUTED. It arrives as `requestLocale` from the middleware, which read it out of the
 * path and fell back to the request header. It is validated here rather than trusted: whatever
 * arrives is a string from outside, and an unrecognised one reaching the message loader throws on a
 * file that is not there. `toLocale` refuses anything this app has no messages for.
 *
 * The earlier version pinned this to the default and said a signed-in console needs no segment. That
 * was true about crawlers and beside the point about READERS: without a segment a language choice
 * cannot be linked, shared, or set by an operator sending somebody a URL.
 */

export default getRequestConfig(async ({ requestLocale }) => {
    const locale = toLocale(await requestLocale)
    return {
        locale,
        timeZone: TIME_ZONE,
        messages: (await import(`../messages/${locale}.json`)).default,
    }
})

export { routing }
