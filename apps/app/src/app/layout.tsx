import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
    title: "nivo app",
    description: "Bảng điều khiển cấp phát và vận hành.",
}

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
}

/**
 * The document shell.
 *
 * @param input - The rendered route.
 * @returns The html document.
 */
const RootLayout = ({ children }: { readonly children: React.ReactNode }) => (
    <html lang="vi" suppressHydrationWarning>
        <body className="min-h-dvh antialiased">{children}</body>
    </html>
)

export default RootLayout
