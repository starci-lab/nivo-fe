import { render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

type MotionProbeProps = ComponentProps<"div"> & { readonly children?: ReactNode; readonly animate?: unknown; readonly whileInView?: unknown };
vi.mock("framer-motion", () => ({
  motion: {
    div: (props: MotionProbeProps) => <div data-animate={props.animate === undefined ? "off" : "on"} data-reveal={props.whileInView === undefined ? "off" : "on"}>{props.children}</div>,
    article: (props: MotionProbeProps) => <article data-reveal={props.whileInView === undefined ? "off" : "on"}>{props.children}</article>,
    li: (props: MotionProbeProps) => <li data-reveal={props.whileInView === undefined ? "off" : "on"}>{props.children}</li>,
  },
}));

import { LandingMotionArtworkDriftBase, LandingMotionHeroRevealBase } from "./component";

describe("LandingMotionBase", () => {
  it("draws resolved reduced-motion state without reading a world preference", () => {
    const view = render(<LandingMotionHeroRevealBase isReducedMotion={false}>Hero copy</LandingMotionHeroRevealBase>);
    expect(screen.getByText("Hero copy")).toHaveAttribute("data-reveal", "on");
    view.rerender(<LandingMotionHeroRevealBase isReducedMotion>Hero copy</LandingMotionHeroRevealBase>);
    expect(screen.getByText("Hero copy")).toHaveAttribute("data-reveal", "off");
    view.rerender(<LandingMotionArtworkDriftBase isReducedMotion>Artwork</LandingMotionArtworkDriftBase>);
    expect(screen.getByText("Artwork")).toHaveAttribute("data-animate", "off");
  });
});
