"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { useResolvedReducedMotion } from "@/hooks";
import { CLASS_NAMES as C } from "./classNames";

const REVEAL_TRANSITION = { duration: 0.58, ease: [0.22, 1, 0.36, 1] as const };

/** Connected hero reveal properties. */
export type LandingMotionHeroRevealProps = { readonly children: ReactNode };
/** Resolves motion preference for the hero reveal. */
export const LandingMotionHeroReveal = (props: LandingMotionHeroRevealProps) => {
  const isReducedMotion = useResolvedReducedMotion();
  return <motion.div className={C.heroCopy} initial={false} whileInView={isReducedMotion ? undefined : { opacity: [0.72, 1], y: [18, 0] }} viewport={{ once: true, amount: 0.18 }} transition={REVEAL_TRANSITION}>{props.children}</motion.div>;
};

/** Connected light-section reveal properties. */
export type LandingMotionLightSectionRevealProps = { readonly children: ReactNode };
/** Resolves motion preference for the light section reveal. */
export const LandingMotionLightSectionReveal = (props: LandingMotionLightSectionRevealProps) => {
  const isReducedMotion = useResolvedReducedMotion();
  return <motion.div className={C.sectionHeadingLight} initial={false} whileInView={isReducedMotion ? undefined : { opacity: [0.72, 1], y: [18, 0] }} viewport={{ once: true, amount: 0.18 }} transition={REVEAL_TRANSITION}>{props.children}</motion.div>;
};

/** Connected ambient-artwork properties. */
export type LandingMotionArtworkDriftProps = { readonly children: ReactNode };
/** Resolves motion preference for decorative artwork. */
export const LandingMotionArtworkDrift = (props: LandingMotionArtworkDriftProps) => {
  const isReducedMotion = useResolvedReducedMotion();
  return <motion.div className={C.visualOverlay} initial={false} animate={isReducedMotion ? undefined : { y: [-4, 4, -4], rotate: [-0.2, 0.2, -0.2] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}>{props.children}</motion.div>;
};

/** Connected operating-loop step properties. */
export type LandingMotionLoopStepProps = { readonly children: ReactNode; readonly index: number; readonly position: string };
/** Resolves motion preference for an operating-loop step. */
export const LandingMotionLoopStep = (props: LandingMotionLoopStepProps) => {
  const isReducedMotion = useResolvedReducedMotion();
  return <motion.li style={{ "--loop-x": props.position } as CSSProperties} initial={false} whileInView={isReducedMotion ? undefined : { opacity: [0.5, 1], y: [8, 0] }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.42, delay: props.index * 0.065, ease: "easeOut" }}>{props.children}</motion.li>;
};

/** Connected responsibility-card properties. */
export type LandingMotionInstanceCardProps = { readonly children: ReactNode; readonly index: number };
/** Resolves motion preference for a responsibility card. */
export const LandingMotionInstanceCard = (props: LandingMotionInstanceCardProps) => {
  const isReducedMotion = useResolvedReducedMotion();
  return <motion.article initial={false} whileInView={isReducedMotion ? undefined : { opacity: [0.62, 1], x: [28, 0], rotate: [1.4, 0] }} viewport={{ once: true, amount: 0.45 }} transition={{ duration: 0.52, delay: props.index * 0.1, ease: [0.22, 1, 0.36, 1] }}>{props.children}</motion.article>;
};

/** Connected responsibility graph properties. */
export type LandingMotionResponsibilityGraphProps = { readonly children: ReactNode };
/** Resolves motion preference for the responsibility graph. */
export const LandingMotionResponsibilityGraph = (props: LandingMotionResponsibilityGraphProps) => {
  const isReducedMotion = useResolvedReducedMotion();
  return <motion.div className={C.responsibilityGraph} initial={false} whileInView={isReducedMotion ? undefined : { opacity: [0.45, 1], scale: [0.96, 1] }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.72, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}>{props.children}</motion.div>;
};

/** Connected operating-loop track properties. */
export type LandingMotionLoopTrackProps = { readonly children: ReactNode };
/** Resolves motion preference for the operating-loop track. */
export const LandingMotionLoopTrack = (props: LandingMotionLoopTrackProps) => {
  const isReducedMotion = useResolvedReducedMotion();
  return <motion.div className={C.loopTrackShell} initial={false} whileInView={isReducedMotion ? undefined : { opacity: [0.7, 1] }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: isReducedMotion ? 0 : 0.35 }}>{props.children}</motion.div>;
};

/** Connected responsibility-layer properties. */
export type LandingMotionRoleLayerProps = { readonly children: ReactNode; readonly index: number };
/** Resolves motion preference for a responsibility layer. */
export const LandingMotionRoleLayer = (props: LandingMotionRoleLayerProps) => {
  const isReducedMotion = useResolvedReducedMotion();
  const direction = props.index === 1 ? 1 : -1;
  return <motion.article initial={false} whileInView={isReducedMotion ? undefined : { opacity: [0.5, 1], x: [direction * 28, 0] }} viewport={{ once: true, amount: 0.55 }} transition={{ duration: 0.56, delay: props.index * 0.11, ease: [0.22, 1, 0.36, 1] }}>{props.children}</motion.article>;
};
