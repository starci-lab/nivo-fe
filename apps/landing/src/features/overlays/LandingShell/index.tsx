import { NivoGrammarRoot } from "@nivo/ui";
import type { Metadata } from "next";
import type { ComponentProps } from "react";
import { LANDING_DESCRIPTION } from "@/modules/landing/copy";

/**
 * Browser-level metadata for every route under this shell.
 *
 * NAMED FOR THE ROUTE SLOT IT IS RE-EXPORTED AS, because a frozen module value here has to read as
 * the constant it is; `app/layout.tsx` is the file Next handed the slot to, so that is the file that
 * says `metadata`.
 */
export const LANDING_METADATA: Metadata = {
    title: "NIVO Agentic OS — System of Responsibility",
    description: LANDING_DESCRIPTION
};

/** Props for {@link LandingShell}. */
type LandingShellProps = {
    /** The rendered route. */
    readonly children: ComponentProps<"div">["children"];
};

/**
 * The document shell.
 *
 * It selects the NIVO family once, at the root, so no screen below it has to remember a theme, and
 * it declares the document's language for the same reason the copy is authored in Vietnamese.
 *
 * @param input - The rendered route.
 * @returns The html document.
 */
export const LandingShell = ({
    children
}: LandingShellProps) => <html lang="vi" suppressHydrationWarning>
        <body className="min-h-dvh antialiased">
            <NivoGrammarRoot>{children}</NivoGrammarRoot>
        </body>
    </html>;

export default LandingShell;
