/**
 * Register the jest-dom matchers with TypeScript.
 *
 * `vitest.setup.ts` imports them so they exist at RUNTIME; without this reference `tsc` still
 * refuses `toBeInTheDocument`, and the split shows up as a green test run beside a red typecheck.
 * Every workspace includes this file so a spec added to an app later needs no second discovery.
 */
/// <reference types="@testing-library/jest-dom/vitest" />

/**
 * jest-axe ships no types and its DefinitelyTyped package drags in the Jest globals, which would
 * collide with Vitest's. Only the `axe` entry the accessibility helper calls is declared.
 */
declare module "jest-axe" {
    interface AxeViolation {
        readonly id: string
    }
    interface AxeResults {
        readonly violations: readonly AxeViolation[]
    }
    export function axe(html: Element | string): Promise<AxeResults>
}
