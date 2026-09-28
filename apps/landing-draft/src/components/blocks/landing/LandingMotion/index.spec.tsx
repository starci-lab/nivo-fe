import { render, screen } from "@testing-library/react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ reduced: false }));
type MotionProbeProps = ComponentProps<"div"> & { readonly children?: ReactNode; readonly animate?: unknown; readonly whileInView?: unknown; readonly position?: string; readonly index?: number; readonly style?: CSSProperties };
vi.mock("framer-motion", () => ({
  useReducedMotion: () => mocks.reduced,
  motion: {
    div: (props: MotionProbeProps) => <div data-animate={props.animate === undefined ? "off" : "on"} data-reveal={props.whileInView === undefined ? "off" : "on"}>{props.children}</div>,
    article: (props: MotionProbeProps) => <article data-reveal={props.whileInView === undefined ? "off" : "on"}>{props.children}</article>,
    li: (props: MotionProbeProps) => <li data-reveal={props.whileInView === undefined ? "off" : "on"}>{props.children}</li>,
  },
}));

import { LandingMotionArtworkDrift, LandingMotionHeroReveal, LandingMotionLoopStep, LandingMotionRoleLayer } from "./index";

describe("LandingMotion", () => {
  beforeEach(() => { mocks.reduced = false; });

  it("maps the reader motion preference into each motion primitive", () => {
    const view = render(<LandingMotionHeroReveal>Hero</LandingMotionHeroReveal>);
    expect(screen.getByText("Hero")).toHaveAttribute("data-reveal", "on");
    view.rerender(<LandingMotionLoopStep index={0} position="12%">Step</LandingMotionLoopStep>);
    expect(screen.getByText("Step")).toHaveAttribute("data-reveal", "on");
    view.rerender(<LandingMotionRoleLayer index={1}>Layer</LandingMotionRoleLayer>);
    expect(screen.getByText("Layer")).toHaveAttribute("data-reveal", "on");
    mocks.reduced = true;
    view.rerender(<LandingMotionArtworkDrift>Artwork</LandingMotionArtworkDrift>);
    expect(screen.getByText("Artwork")).toHaveAttribute("data-animate", "off");
    view.rerender(<LandingMotionHeroReveal>Hero</LandingMotionHeroReveal>);
    expect(screen.getByText("Hero")).toHaveAttribute("data-reveal", "off");
  });
});
