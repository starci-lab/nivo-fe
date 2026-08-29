import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LANDING_DESCRIPTION } from "@/resources/copy";
import type { ComponentProps } from "react";

/** Browser-level metadata for every route under this shell. */
export const metadata: Metadata = {
  title: "nivo",
  description: LANDING_DESCRIPTION
};

/** Viewport behaviour for every route under this shell. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

/** Props for {@link RootLayout}. */
interface RootLayoutProps {
  /** The rendered route. */
  readonly children: ComponentProps<"div">["children"];
}

/**
 * The document shell.
 *
 * @param input - The rendered route.
 * @returns The html document.
 */
const RootLayout = ({
  children
}: RootLayoutProps) => <html lang="vi" suppressHydrationWarning>
        <body className="min-h-dvh antialiased">{children}</body>
    </html>;
export default RootLayout;
