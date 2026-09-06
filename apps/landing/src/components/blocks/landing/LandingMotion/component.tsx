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
  return <motion.div className={C.visualOverlay} initial={false} animate={reduced ? undefined : { y: [-5, 5, -5], rotate: [-0.35, 0.35, -0.35] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>{props.children}</motion.div>;
};

/** Reveals one operating-loop step in reading order. */
export const LandingMotionLoopStep = (props: LandingMotionLoopStepProps) => {
  const reduced = useReducedMotion();
  return <motion.li initial={false} whileInView={reduced ? undefined : { opacity: [0.5, 1], x: [-10, 0] }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.42, delay: props.index * 0.065, ease: "easeOut" }}>{props.children}</motion.li>;
};

/** Reveals one responsibility instance with a restrained stagger. */
export const LandingMotionInstanceCard = (props: LandingMotionInstanceCardProps) => {
  const reduced = useReducedMotion();
  return <motion.article initial={false} whileInView={reduced ? undefined : { opacity: [0.62, 1], x: [20, 0] }} viewport={{ once: true, amount: 0.45 }} transition={{ duration: 0.48, delay: props.index * 0.09, ease: [0.22, 1, 0.36, 1] }}>{props.children}</motion.article>;
};
