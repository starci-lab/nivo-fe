import { NivoGrammarRoot } from "@nivo/ui";
import type { ReactNode } from "react";
import { SiteShell } from "./component";

export { PUBLIC_SITE_URL, SITE_DESCRIPTION, SITE_TITLE } from "@/modules/landing/site";
export { SITE_CLASS_NAMES } from "./classNames";
export { ProcessFlow, type ProcessFlowProps } from "../../../components/blocks/landing/ProcessFlow";
export { SectionIntro, type SectionIntroProps } from "../../../components/blocks/landing/SectionIntro";
export { SiteFooter } from "../SiteFooter";
export { SiteHeader } from "../SiteHeader";
export { SiteMain, type SiteMainProps } from "../SiteMain";
export { SiteShell, type SiteShellProps } from "./component";

/** Props for {@link SiteShellDocument}. */
type SiteShellDocumentProps = {
    /** The rendered route. */
    readonly children: ReactNode;
};

/**
 * The document shell.
 *
 * It selects the NIVO family once, in its light register -- the one this public surface is drawn for
 * -- so no screen below has to remember a theme, and it declares the document's language for the same
 * reason the copy is authored in Vietnamese.
 *
 * THE SITE CONSTANTS TRAVEL OUT THROUGH THIS FILE TOO, and that is deliberate rather than incidental:
 * the routing tree may reach project code only through a feature entry, and the shell owns the site's
 * own identity -- its address, its title, its description -- so the entry that holds the shell is the
 * entry that can hand them to a route's metadata or to its `robots`/`sitemap` handlers.
 *
 * @param input - The rendered route.
 * @returns The html document.
 */
export const SiteShellDocument = ({
    children
}: SiteShellDocumentProps) => (
    <html lang="vi">
        <body>
            <NivoGrammarRoot theme="light">
                <SiteShell>{children}</SiteShell>
            </NivoGrammarRoot>
        </body>
    </html>
);

export default SiteShellDocument;
