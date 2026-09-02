import Image from "next/image";
import { AuthenticationPanel, type AuthenticationPanelProps } from "@/components/blocks/auth/AuthenticationPanel";
import {
  AUTH_FORM_CONTENT_CLASS_NAME,
  AUTH_FORM_REGION_CLASS_NAME,
  AUTH_PAGE_CLASS_NAME,
  AUTH_VISUAL_ACCENT_CLASS_NAME,
  AUTH_VISUAL_CLASS_NAME,
  AUTH_VISUAL_IMAGE_CLASS_NAME,
  AUTH_VISUAL_SCRIM_CLASS_NAME
} from "./classNames";

/**
 * PAGE - `/authentication`, presentational half.
 *
 * ONE ROUTE FOR ALL THREE JOURNEYS. Sign in, sign up and password recovery stay panel state rather
 * than becoming separate addresses, so this page can change its composition without changing any
 * authentication behaviour.
 *
 * THE COMPOSITION IS DELIBERATELY FLAT. The product image owns the left side on wide screens and the
 * form stands directly on the right-side page surface. There is no card, border or elevation around
 * it. On narrow screens the decorative image leaves the reading order entirely so the form remains
 * the first and only task.
 */

/** Props for {@link AuthenticationPageBase}. */
export type AuthenticationPageProps = {
  /** The panel's complete translated state and actions. */
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
  const panelIdentity = panel.state === "details" || panel.state === "code" ? `${panel.state}:${panel.props.mode}` : panel.state;

  return <main className={AUTH_PAGE_CLASS_NAME}>
    <aside aria-hidden="true" className={AUTH_VISUAL_CLASS_NAME}>
      <Image
        src="/images/nivo-login-infra-anime.png"
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 55vw, 0px"
        className={AUTH_VISUAL_IMAGE_CLASS_NAME}
      />
      <div className={AUTH_VISUAL_SCRIM_CLASS_NAME} />
      <div className={AUTH_VISUAL_ACCENT_CLASS_NAME} />
    </aside>

    <section aria-label={panel.props.title} className={AUTH_FORM_REGION_CLASS_NAME}>
      <div className={AUTH_FORM_CONTENT_CLASS_NAME}>
        <AuthenticationPanel key={panelIdentity} {...panel} />
      </div>
    </section>
  </main>;
};
