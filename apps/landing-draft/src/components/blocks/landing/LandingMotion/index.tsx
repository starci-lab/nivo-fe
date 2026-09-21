"use client";

import { useReducedMotion } from "framer-motion";
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
import type {
  LandingMotionArtworkDriftProps as LandingMotionArtworkDriftBaseProps,
  LandingMotionHeroRevealProps as LandingMotionHeroRevealBaseProps,
  LandingMotionInstanceCardProps as LandingMotionInstanceCardBaseProps,
  LandingMotionLightSectionRevealProps as LandingMotionLightSectionRevealBaseProps,
  LandingMotionLoopStepProps as LandingMotionLoopStepBaseProps,
  LandingMotionLoopTrackProps as LandingMotionLoopTrackBaseProps,
  LandingMotionResponsibilityGraphProps as LandingMotionResponsibilityGraphBaseProps,
  LandingMotionRoleLayerProps as LandingMotionRoleLayerBaseProps,
} from "./component";

/** Connected hero reveal properties. */
export type LandingMotionHeroRevealProps = Omit<LandingMotionHeroRevealBaseProps, "isReducedMotion">;
/** Connected light-section reveal properties. */
export type LandingMotionLightSectionRevealProps = Omit<LandingMotionLightSectionRevealBaseProps, "isReducedMotion">;
/** Connected ambient-artwork properties. */
export type LandingMotionArtworkDriftProps = Omit<LandingMotionArtworkDriftBaseProps, "isReducedMotion">;
/** Connected operating-loop step properties. */
export type LandingMotionLoopStepProps = Omit<LandingMotionLoopStepBaseProps, "isReducedMotion">;
/** Connected responsibility-card properties. */
export type LandingMotionInstanceCardProps = Omit<LandingMotionInstanceCardBaseProps, "isReducedMotion">;
/** Connected responsibility graph properties. */
export type LandingMotionResponsibilityGraphProps = Omit<LandingMotionResponsibilityGraphBaseProps, "isReducedMotion">;
/** Connected operating-loop track properties. */
export type LandingMotionLoopTrackProps = Omit<LandingMotionLoopTrackBaseProps, "isReducedMotion">;
/** Connected responsibility-layer properties. */
export type LandingMotionRoleLayerProps = Omit<LandingMotionRoleLayerBaseProps, "isReducedMotion">;

const useResolvedReducedMotion = (): boolean => useReducedMotion() === true;

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
