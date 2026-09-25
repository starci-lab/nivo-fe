import { useReducedMotion } from "framer-motion";

/**
 * The reader's motion preference, resolved to one boolean.
 *
 * `useReducedMotion` answers `null` until the media query has been read, and every caller here has
 * exactly one question to ask -- animate or not -- so the resolution lives at the door the
 * components enter through rather than as the same ternary repeated in eight files.
 *
 * @returns Whether the reader asked the platform for reduced motion.
 */
export const useResolvedReducedMotion = () => useReducedMotion() === true;