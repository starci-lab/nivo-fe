import { Heading, Text } from "@starci/grammar/core";
import { NivoBrand } from "@nivo/ui";
import { LANDING_DESCRIPTION } from "@/resources/copy";
import { CONTENT_CLASS_NAME, ROOT_CLASS_NAME } from "./classNames";

/** Props for the static landing page. */
export type LandingPageProps = Record<string, never>;

/**
 * PAGE - the public landing screen.
 *
 * It draws one leaf from the shared package on purpose: it is the smallest thing that proves the
 * workspace link, the Next transpile step and the Tailwind `@source` line all work. When this page
 * renders a sized glyph, the scaffold is sound and screens can be built on it.
 *
 * It also proves the part that is easy to skip: that a screen can say what it looks like WITHOUT
 * writing a class. The glyph, the title and the supporting line are one centred pair named by a
 * registry key, and the landmark around them is the `host` its registry entry names, not a
 * hand-written `main`.
 *
 * One file rather than two, per SPLIT-6: the split exists because a request exists, and this screen
 * makes none.
 *
 * @returns The page.
 */
export const LandingPage = (props: LandingPageProps) => {
  void props;
  return <main className={ROOT_CLASS_NAME}>
        <div className={CONTENT_CLASS_NAME}>
            <NivoBrand props={{
        label: "nivo",
        variant: "lockup",
        scale: "hero"
      }} />
            <Heading level={1}>{"nivo"}</Heading>
            <Text size="sm">{LANDING_DESCRIPTION}</Text>
        </div>
    </main>;
};
