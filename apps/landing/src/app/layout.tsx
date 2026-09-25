import type { Viewport } from "next";
import "./globals.css";

/*
 * The document shell, and the framework's own viewport slot.
 *
 * The viewport declaration is Next's own exported constant, so it stays in the route file; the
 * shell and its browser-level metadata live in `features/layouts/LandingShell`, which is what this
 * file names and mounts.
 */
export {
    LandingShell as default,
    LANDING_METADATA as metadata
} from "@/features/layouts/LandingShell";

/** Viewport behaviour for every route under this shell. */
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1
};