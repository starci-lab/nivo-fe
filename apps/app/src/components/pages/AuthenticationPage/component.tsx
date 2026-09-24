import { NivoBrand, NivoUnicornArtwork } from "@nivo/ui";
import { Heading, SurfaceCard, Text, TextAction } from "@starci/grammar/common";
import { AuthenticationPanel, type AuthenticationPanelProps } from "@/components/blocks/auth/AuthenticationPanel";
import {
  AUTH_EXIT_CLASS_NAME,
  AUTH_EXITS_CLASS_NAME,
  AUTH_HEADING_CLASS_NAME,
  AUTH_PAGE_CLASS_NAME,
  AUTH_TASK_COLUMN_CLASS_NAME,
  AUTH_VIGNETTE_CLASS_NAME
} from "./classNames";

/**
 * PAGE - `/authentication`, presentational half.
 *
 * ONE ROUTE FOR ALL THREE JOURNEYS. Sign in, sign up and password recovery stay panel state rather
 * than becoming separate addresses, so this page can change its composition without changing any
 * authentication behaviour.
 *
 * THE COMPOSITION IS THE ACCEPTED DIRECTION'S. An external heading and its line stand ABOVE one
 * soft, borderless form surface; the surface is the only card on the page; the exits - the other
 * journey and the way back from a challenge - sit BELOW it, outside the surface. Nothing is nested
 * in a second surface, and the form surface's width is Grammar's own `formCompact` measure rather
 * than a number this file invents.
 *
 * THE BRAND IS DRAWN HERE AND THE MASCOT ONLY ON SIGN-IN-READY. `NivoBrand` is the page's own
 * element on every state. The unicorn band is not: the record reserves the right-side desktop area
 * for it on ONE state (`auth-desktop-mascot-vignette`, `states: [sign-in-ready]`), so it is drawn
 * when the first step of a password sign-in is showing and nothing is being refused or waited on -
 * and it is decorative, so it is hidden from assistive technology and leaves the layout entirely
 * below desktop.
 */

/** Where the reader may go instead, drawn outside the surface. */
export type AuthenticationPageExit = {
  /** The question the action answers, or `""` for an exit that stands alone. */
  readonly question: string;
  /** The action's own words. */
  readonly action: string;
  /** What taking it does. */
  readonly onPress: () => void;
};

/**
 * Props for {@link AuthenticationPageBase}.
 *
 * Named `…ViewProps` with a `…Props` alias, the same pattern the connected `index.tsx` uses for
 * its own empty `AuthenticationPageProps`: the two files each own a type of that name for a
 * different role, and aliasing the pure half's real shape keeps the two from reading as one
 * shared contract.
 */
export type AuthenticationPageViewProps = {
  /** The panel's complete translated state and actions. */
  readonly panel: AuthenticationPanelProps;
  /** Everything offered below the surface, in reading order. */
  readonly exits: ReadonlyArray<AuthenticationPageExit>;
};
/** Public API role for {@link AuthenticationPageViewProps}. */
export type AuthenticationPageProps = AuthenticationPageViewProps;

/**
 * Whether this panel is the state the direction reserves the mascot for.
 *
 * SIGN-IN-READY, AND NOTHING ELSE: the first step of a password sign-in, with no wait and no
 * sentence in front of the reader. A refusal, an undecided result or a settled notice is not a
 * place to decorate, and neither is a challenge the reader is still working through - the brand
 * forbids the mascot on a failure surface and the record binds it to this one state.
 *
 * @param panel - The panel about to be drawn.
 * @returns Whether the reserved area holds the mascot band.
 */
const showsMascot = (panel: AuthenticationPanelProps): boolean => {
  if (panel.state !== "details") return false;
  return panel.props.mode === "signIn" && !panel.props.isError && panel.props.statusMessage === "" && !panel.props.isPending;
};

/**
 * Draw the authentication screen.
 *
 * @param props - {@link AuthenticationPageProps}
 * @returns The page node.
 */
export const AuthenticationPageBase = (props: AuthenticationPageProps) => {
  const {
    panel,
    exits
  }: AuthenticationPageProps = props;
  const panelIdentity = panel.state === "details" || panel.state === "code" ? `${panel.state}:${panel.props.mode}` : panel.state;

  return <main className={AUTH_PAGE_CLASS_NAME}>
    <section aria-label={panel.props.title} className={AUTH_TASK_COLUMN_CLASS_NAME}>
      <NivoBrand props={{ label: "Nivo", variant: "lockup", scale: "navbar" }} />

      <div className={AUTH_HEADING_CLASS_NAME}>
        <Heading level={1} scale="display">{panel.props.title}</Heading>
        <Text size="sm" tone="muted">{panel.props.subtitle}</Text>
      </div>

      <SurfaceCard measure="formCompact" composition="single" frame="bounded">
        <AuthenticationPanel key={panelIdentity} {...panel} />
      </SurfaceCard>

      <div className={AUTH_EXITS_CLASS_NAME}>{exits.map(exit => <div key={`${exit.question}${exit.action}`} className={AUTH_EXIT_CLASS_NAME}>
          {exit.question === "" ? null : <Text size="sm" tone="muted">{exit.question}</Text>}
          <TextAction size="sm" onPress={exit.onPress}>{exit.action}</TextAction>
        </div>)}</div>
    </section>

    {showsMascot(panel) ? <aside aria-hidden="true" className={AUTH_VIGNETTE_CLASS_NAME}>
        <NivoUnicornArtwork props={{ tone: "brand" }} />
      </aside> : null}
  </main>;
};