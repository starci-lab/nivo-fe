/**
 * Register the jest-dom matchers with TypeScript.
 *
 * `vitest.setup.ts` imports them so they exist at RUNTIME; without this reference `tsc` still
 * refuses `toBeInTheDocument`, and the split shows up as a green test run beside a red typecheck.
 * Every workspace includes this file so a spec added to an app later needs no second discovery.
 */
/// <reference types="@testing-library/jest-dom/vitest" />
