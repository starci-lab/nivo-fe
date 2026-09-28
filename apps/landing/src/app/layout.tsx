import type { Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { LANDING_METADATA, LandingShell } from "@/features/overlays/LandingShell";

export { LANDING_METADATA as metadata };

/*
 * The document shell, and the framework's own viewport slot.
 *
 * The viewport declaration is Next's own exported constant, so it stays in the route file; the
 * shell and its browser-level metadata live in `features/overlays/LandingShell`, which is what this
 * file names and mounts.
 */

/** Props the root route hands its shell: the routed stream. */
type LandingRouteProps = {
    readonly children: ReactNode;
};

/** Mount the landing document shell on this route segment. */
const Layout = ({ children }: LandingRouteProps) => <LandingShell>{children}</LandingShell>;

export default Layout;

/** Viewport behaviour for every route under this shell. */
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1
};
