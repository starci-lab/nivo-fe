import type { Viewport } from "next";
import "../globals.css";

/*
 * The `/[locale]` shell, the stylesheet the document needs, and the framework's own viewport slot.
 *
 * The viewport declaration is Next's own exported constant, so it stays in the route file: the
 * framework reads that slot out of the route tree, and the shell, its metadata and its static
 * params live in `features/layouts/AcademyLocaleLayout`, which is what this file names and mounts.
 */
export {
    AcademyLocaleLayout as default,
    generateMetadata,
    generateStaticParams
} from "@/features/layouts/AcademyLocaleLayout";

/** Viewport behaviour for every route under this shell. */
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1
};