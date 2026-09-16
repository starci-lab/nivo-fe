import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ reduced: false }));
vi.mock("framer-motion", () => ({ useReducedMotion: () => mocks.reduced }));
type ReducedMotionProbeProps = { readonly isReducedMotion: boolean };
vi.mock("./component", () => ({
  LandingMotionArtworkDriftBase: (props: ReducedMotionProbeProps) => <output data-testid="artwork">{String(props.isReducedMotion)}</output>,
  LandingMotionHeroRevealBase: (props: ReducedMotionProbeProps) => <output data-testid="hero">{String(props.isReducedMotion)}</output>,
  LandingMotionInstanceCardBase: () => null,
  LandingMotionLightSectionRevealBase: () => null,
  LandingMotionLoopStepBase: () => null,
  LandingMotionLoopTrackBase: () => null,
  LandingMotionResponsibilityGraphBase: () => null,
  LandingMotionRoleLayerBase: () => null,
}));

import { LandingMotionArtworkDrift, LandingMotionHeroReveal } from "./index";

describe("LandingMotion", () => {
  beforeEach(() => { mocks.reduced = false; });

  it("maps the reader motion preference into each pure motion twin", () => {
    const view = render(<LandingMotionHeroReveal>Hero</LandingMotionHeroReveal>);
    expect(screen.getByTestId("hero")).toHaveTextContent("false");
    mocks.reduced = true;
    view.rerender(<LandingMotionArtworkDrift>Artwork</LandingMotionArtworkDrift>);
    expect(screen.getByTestId("artwork")).toHaveTextContent("true");
  });
});
