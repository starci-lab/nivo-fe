import { getRequestConfig } from "next-intl/server"
import { locale as rootLocale } from "next/root-params"
import { TIME_ZONE, toLocale } from "./config"

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
 * THE LOCALE IS ROUTED, AND IT IS READ FROM THE SEGMENT ITSELF. `next/root-params` hands back the
 * `[locale]` param of the root layout this render belongs to. It replaces next-intl's
 * `requestLocale`, which next-intl deprecated in favour of exactly this: that parameter reached the
 * middleware's header when no route had announced the locale first, and reading a header is what
 * made a render dynamic. A root param is known before the render begins, so the same value now
 * arrives without costing the route its prerender - see the note in `[locale]/layout.tsx`.
 *
 * IT IS VALIDATED RATHER THAN TRUSTED, and doubly so now. Whatever sat in the path is a string from
 * outside, and an unrecognised one reaching the message loader throws on a file that is not there.
 * `next/root-params` is also untyped in Next 16.1.6 - the module ships as a bare `declare module`
 * until the compiler generates its types, so what it returns is `any` and neither `tsc` nor eslint
 * has anything to say about it. `toLocale` is the boundary that makes it a `Locale` again: it
 * checks the value at runtime and falls back to the default, so an `any` never travels past here.
 *
 * The earlier version pinned this to the default and said a signed-in console needs no segment. That
 * was true about crawlers and beside the point about READERS: without a segment a language choice
 * cannot be linked, shared, or set by an operator sending somebody a URL.
 */

export default getRequestConfig(async () => {
    const locale = toLocale(await rootLocale())
    return {
        locale,
        timeZone: TIME_ZONE,
        messages: (await import(`../messages/${locale}.json`)).default,
    }
})

export { routing } from "./routing"
