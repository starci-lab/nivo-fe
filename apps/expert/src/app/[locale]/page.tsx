import { AcademyPage } from "@/components/pages/AcademyPage"

/**
 * The `/[locale]` route.
 *
 * IT NO LONGER READS THE SEGMENT. It used to call `setRequestLocale` with the awaited param, which
 * was route wiring rather than drawing: it told next-intl which locale the render was for, because
 * nothing else could. `src/i18n/request.ts` now reads the segment directly through
 * `next/root-params`, so the locale reaches the message loader without a route having to hand it
 * over - and the route goes back to doing the one thing a route is for.
 *
 * @returns The route.
 */
const AcademyRoute = () => <AcademyPage />

export default AcademyRoute
