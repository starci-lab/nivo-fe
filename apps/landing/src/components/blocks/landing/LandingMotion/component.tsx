"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { CLASS_NAMES as C } from "./classNames";

/** Content revealed as the landing hero enters the viewport. */
export type LandingMotionHeroRevealProps = { children: ReactNode };
/** Light-section heading content revealed on entry. */
export type LandingMotionLightSectionRevealProps = { children: ReactNode };
/** Decorative artwork content given restrained ambient movement. */
export type LandingMotionArtworkDriftProps = { children: ReactNode };
/** One ordered operating-loop step and its stagger position. */
export type LandingMotionLoopStepProps = { children: ReactNode; index: number };
/** One responsibility instance and its stagger position. */
export type LandingMotionInstanceCardProps = { children: ReactNode; index: number };
/** The code-native responsibility constellation layered over the hero artwork. */
export type LandingMotionResponsibilityGraphProps = { children: ReactNode };
/** The operating loop track whose light travels from context to trust. */
export type LandingMotionLoopTrackProps = { children: ReactNode };
/** One Human, AI or System layer in the responsibility handoff. */
export type LandingMotionRoleLayerProps = { children: ReactNode; index: number };

const revealTransition = { duration: 0.58, ease: [0.22, 1, 0.36, 1] as const };

/** Progressively reveals the hero copy without hiding its server-rendered fallback. */
export const LandingMotionHeroReveal = (props: LandingMotionHeroRevealProps) => {
  const reduced = useReducedMotion();
  return <motion.div className={C.heroCopy} initial={false} whileInView={reduced ? undefined : { opacity: [0.72, 1], y: [18, 0] }} viewport={{ once: true, amount: 0.18 }} transition={revealTransition}>{props.children}</motion.div>;
};

/** Progressively reveals the light-on-dark section heading. */
export const LandingMotionLightSectionReveal = (props: LandingMotionLightSectionRevealProps) => {
  const reduced = useReducedMotion();
  return <motion.div className={C.sectionHeadingLight} initial={false} whileInView={reduced ? undefined : { opacity: [0.72, 1], y: [18, 0] }} viewport={{ once: true, amount: 0.18 }} transition={revealTransition}>{props.children}</motion.div>;
};

/** Applies ambient movement only to the decorative hero overlay. */
export const LandingMotionArtworkDrift = (props: LandingMotionArtworkDriftProps) => {
  const reduced = useReducedMotion();
  return <motion.div className={C.visualOverlay} initial={false} animate={reduced ? undefined : { y: [-4, 4, -4], rotate: [-0.2, 0.2, -0.2] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}>{props.children}</motion.div>;
};

/** Reveals the hero graph once, then lets CSS handle its ambient signal. */
export const LandingMotionResponsibilityGraph = (props: LandingMotionResponsibilityGraphProps) => {
  const reduced = useReducedMotion();
  return <motion.div className={C.responsibilityGraph} initial={false} whileInView={reduced ? undefined : { opacity: [0.45, 1], scale: [0.96, 1] }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.72, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}>{props.children}</motion.div>;
};

/** Reveals one operating-loop step in reading order. */
export const LandingMotionLoopStep = (props: LandingMotionLoopStepProps) => {
  const reduced = useReducedMotion();
  return <motion.li initial={false} whileInView={reduced ? undefined : { opacity: [0.5, 1], x: [-10, 0] }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.42, delay: props.index * 0.065, ease: "easeOut" }}>{props.children}</motion.li>;
};

/** Illuminates the operating path in reading order as it enters view. */
export const LandingMotionLoopTrack = (props: LandingMotionLoopTrackProps) => {
  const reduced = useReducedMotion();
  return <motion.div className={C.loopTrackShell} initial={false} whileInView="visible" viewport={{ once: true, amount: 0.35 }}><motion.span className={C.loopProgress} aria-hidden="true" variants={{ visible: { scaleX: 1 } }} initial={{ scaleX: reduced ? 1 : 0 }} transition={{ duration: reduced ? 0 : 1.25, ease: [0.22, 1, 0.36, 1] }} />{props.children}</motion.div>;
};

/** Moves responsibility across the three operating layers without scroll hijacking. */
export const LandingMotionRoleLayer = (props: LandingMotionRoleLayerProps) => {
  const reduced = useReducedMotion();
  const direction = props.index === 1 ? 1 : -1;
  return <motion.article initial={false} whileInView={reduced ? undefined : { opacity: [0.5, 1], x: [direction * 28, 0] }} viewport={{ once: true, amount: 0.55 }} transition={{ duration: 0.56, delay: props.index * 0.11, ease: [0.22, 1, 0.36, 1] }}>{props.children}</motion.article>;
};

/** Reveals one responsibility instance with a restrained stagger. */
export const LandingMotionInstanceCard = (props: LandingMotionInstanceCardProps) => {
  const reduced = useReducedMotion();
  return <motion.article initial={false} whileInView={reduced ? undefined : { opacity: [0.62, 1], x: [28, 0], rotate: [1.4, 0] }} viewport={{ once: true, amount: 0.45 }} transition={{ duration: 0.52, delay: props.index * 0.1, ease: [0.22, 1, 0.36, 1] }}>{props.children}</motion.article>;
};
