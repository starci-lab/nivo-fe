import { SurfaceFormCard } from "@nivo/ui";
import { AuthenticationPanel, type AuthenticationPanelProps } from "@/components/blocks/auth/AuthenticationPanel";

/**
 * PAGE - `/authentication`, presentational half.
 *
 * ONE ROUTE FOR ALL THREE JOURNEYS, which is the named reference's own shape: starci has exactly one
 * authentication address and no `/sign-up` or `/forgot-password` beside it, and which journey is
 * running is panel state rather than a URL.
 *
 * WHAT THIS HALF OWNS IS THE SURFACE, and it is not a formality. `authentication-panel-card` on its
 * own is three classes; `SurfaceFormCard` is the branch that turns it into a real card with a border,
 * a ground and an elevation, and deciding that an authentication screen IS one bounded card - rather
 * than a form standing on the page - is a page-level decision. The shipped screen did not make it,
 * which is why it rendered as a form floating on the ground.
 *
 * IT RENDERS FROM A FIXTURE AND NOTHING ELSE. Every string arrives already resolved, so this file
 * needs no locale, no session and no request to draw any of its states - which is what makes the
 * state matrix testable without standing the world up first.
 */

/** Props for {@link AuthenticationPageBase}. */
export type AuthenticationPageProps = {
  /**
   * The panel's complete situation, already discriminated and already in words.
   *
   * Passed WHOLE rather than unpacked into a dozen props. The panel's own union is what guarantees
   * the copy of a state it is not drawing cannot be supplied and the copy of the one it is drawing
   * cannot be forgotten; splitting that union apart here would hand this file the job of
   * reassembling it, and every reassembly is a chance to get it wrong.
   */
  readonly panel: AuthenticationPanelProps;
};

/**
 * Draw the authentication screen.
 *
 * @param props - {@link AuthenticationPageProps}
 * @returns The page node.
 */
export const AuthenticationPageBase = (props: AuthenticationPageProps) => {
  const {
    panel
  }: AuthenticationPageProps = props;
  const cardContent = <div>
    <AuthenticationPanel {...panel} /></div>;
  return <div>




    <SurfaceFormCard ariaLabel={panel.props.title}>{cardContent}</SurfaceFormCard></div>;
};
