"use client";

import type { ReactNode } from "react";
import { useResolvedReducedMotion } from "@/hooks";
import {
  LandingMotionArtworkDriftBase,
  LandingMotionHeroRevealBase,
  LandingMotionInstanceCardBase,
  LandingMotionLightSectionRevealBase,
  LandingMotionLoopStepBase,
  LandingMotionLoopTrackBase,
  LandingMotionResponsibilityGraphBase,
  LandingMotionRoleLayerBase,
} from "./component";

/** Connected hero reveal properties. */
export type LandingMotionHeroRevealProps = { readonly children: ReactNode };
/** Connected light-section reveal properties. */
export type LandingMotionLightSectionRevealProps = { readonly children: ReactNode };
/** Connected ambient-artwork properties. */
export type LandingMotionArtworkDriftProps = { readonly children: ReactNode };
/** Connected operating-loop step properties. */
export type LandingMotionLoopStepProps = { readonly children: ReactNode; readonly index: number; readonly position: string };
/** Connected responsibility-card properties. */
export type LandingMotionInstanceCardProps = { readonly children: ReactNode; readonly index: number };
/** Connected responsibility graph properties. */
export type LandingMotionResponsibilityGraphProps = { readonly children: ReactNode };
/** Connected operating-loop track properties. */
export type LandingMotionLoopTrackProps = { readonly children: ReactNode };
/** Connected responsibility-layer properties. */
export type LandingMotionRoleLayerProps = { readonly children: ReactNode; readonly index: number };

/** Resolves motion preference for the hero reveal. */
export const LandingMotionHeroReveal = (props: LandingMotionHeroRevealProps) => (
  <LandingMotionHeroRevealBase {...props} isReducedMotion={useResolvedReducedMotion()} />
);

/** Resolves motion preference for the light section reveal. */
export const LandingMotionLightSectionReveal = (props: LandingMotionLightSectionRevealProps) => (
  <LandingMotionLightSectionRevealBase {...props} isReducedMotion={useResolvedReducedMotion()} />
);

/** Resolves motion preference for decorative artwork. */
export const LandingMotionArtworkDrift = (props: LandingMotionArtworkDriftProps) => (
  <LandingMotionArtworkDriftBase {...props} isReducedMotion={useResolvedReducedMotion()} />
);

/** Resolves motion preference for an operating-loop step. */
export const LandingMotionLoopStep = (props: LandingMotionLoopStepProps) => (
  <LandingMotionLoopStepBase {...props} isReducedMotion={useResolvedReducedMotion()} />
);

/** Resolves motion preference for a responsibility card. */
export const LandingMotionInstanceCard = (props: LandingMotionInstanceCardProps) => (
  <LandingMotionInstanceCardBase {...props} isReducedMotion={useResolvedReducedMotion()} />
);

/** Resolves motion preference for the responsibility graph. */
export const LandingMotionResponsibilityGraph = (props: LandingMotionResponsibilityGraphProps) => (
  <LandingMotionResponsibilityGraphBase {...props} isReducedMotion={useResolvedReducedMotion()} />
);

/** Resolves motion preference for the operating-loop track. */
export const LandingMotionLoopTrack = (props: LandingMotionLoopTrackProps) => (
  <LandingMotionLoopTrackBase {...props} isReducedMotion={useResolvedReducedMotion()} />
);

/** Resolves motion preference for a responsibility layer. */
export const LandingMotionRoleLayer = (props: LandingMotionRoleLayerProps) => (
  <LandingMotionRoleLayerBase {...props} isReducedMotion={useResolvedReducedMotion()} />
);
