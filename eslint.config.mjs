// >>> sync-fe-lint.mjs -- canon rule wiring, do not edit by hand >>>
/*
 * The rules are authored in the trust tree and MIRRORED here by sync-fe-lint.mjs. Do not edit
 * anything under plugins/eslint-canon/ and do not add a rule to it: the next run overwrites the
 * folder, and a rule that exists only here is a second answer to a question canon already answers.
 *
 * What this repository does own is the config below - which globs the rules apply to.
 */
import starciFe, {
    recommended as starciRecommended,
    linterOptions as starciLinterOptions,
    starciFeConfig,
} from "./plugins/eslint-canon/index.mjs"
// <<< sync-fe-lint.mjs -- canon rule wiring <<<
import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import { defineConfig } from "eslint/config"

/**
 * The contract gate for this workspace.
 *
 * WHY THIS FILE DID NOT EXIST UNTIL NOW, AND WHAT THAT COST. All four packages already declared a
 * `lint` script and eslint was already installed, so the gate looked present in every package.json
 * and in `turbo run lint`. It was not: with no config file eslint exits with code 2 and the words
 * "couldn't find an eslint.config file", so the shared component package - the one that owns the
 * contract registry - has never once been checked against the rules it is built on.
 *
 * WHY THE RULE MODULES ARE THE SAME ONES AS THE SINGLE-APP REPOSITORY. The tier vocabulary here is
 * identical - `leaves`, `composites`, `branches`, `blocks`, `contracts` - and so is the registry
 * shape, right down to the `buildContracts({` call the reader parses. Only the prefix above the
 * tiers differs: `packages/ui/src/*` instead of `src/components/*`. The rule modules read that
 * prefix from a list in `plugins/eslint/registry.mjs` rather than writing it out, which is what
 * makes one implementation serve both layouts instead of a fork that drifts.
 *
 * A copy that had kept the old prefix would have been WORSE than no gate at all: the registry
 * reader returns null when it cannot find the table, every registry rule then does nothing, and
 * eslint reports a clean tree. Green, silent, and wrong.
 */
export default defineConfig([
    {
        ignores: [
            "**/.next/**",
            "**/node_modules/**",
            "**/dist/**",
            "**/out/**",
            "**/.turbo/**",
            "**/coverage/**",
            "**/next-env.d.ts",
            // Agent scratch holds full worktrees of this same repository. Left unignored, eslint
            // lints a stale second copy of every file and buries the real findings.
            "**/.claude/**",
            // Design artifacts are scratch - review labs, directional HTML, server logs, the
            // scenario harness around a candidate - and a gate nobody can get green is a gate
            // nobody reads.
            //
            // THE PATTERNS ARE NARROW ON PURPOSE, and the wide version was tried first in the
            // sibling repository. Ignoring `**/.artifacts/**` and re-including
            // `!**/.artifacts/**/candidate/src/**` reports zero problems and lints nothing: a
            // global ignore stops eslint descending into the directory at all, so the negation
            // never gets a chance and even an explicit `eslint <candidate path>` answers "file
            // ignored". Zero errors because nothing was read is the exact failure this whole
            // configuration exists to prevent.
            "**/.artifacts/**/*.log",
            "**/.artifacts/**/*.html",
            "**/.artifacts/**/*.css",
            "**/.artifacts/**/cases*.js",
            "**/.artifacts/**/review*.js",
            "**/.artifacts/**/design-record.js",
            // The review harness around a candidate: a scenario switcher and a theme toggle. It
            // declares no target path and is never ported, so holding it to production rules would
            // only teach the next author to move real work into the harness to escape them.
            "**/.artifacts/**/candidate/app/**",
            "**/.artifacts/**/candidate/*.{ts,mjs,js}",
            // This workspace files its direction labs under `design-plans/` rather than
            // `.artifacts/`. Same content, same reason: a directional `cases.js` is a comparison
            // instrument, not product source.
            "design-plans/**/cases*.js",
            "design-plans/**/review*.js",
            "design-plans/**/*.{html,css,log}",
        ],
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: { globals: globals.browser },
    },
    tseslint.configs.recommended,
    /*
     * THE CANON BLOCK, built rather than written.
     *
     * This repository states one thing about the law - which shape it has - and the trust tree
     * decides the rest: which globs that shape implies, which rules are on, at what severity,
     * and that an inline comment may not switch one off. A block written out here would be a
     * second opinion about all four, and the previous one had already drifted to a different
     * rule count from its sibling and from canon.
     */
    starciFeConfig({
        layout: "monorepo",
        plugin: starciFe,
        recommended: starciRecommended,
        linterOptions: starciLinterOptions,
    }),
    {
        // A connected block and its pure twin are an architectural boundary, not a local lint
        // preference. Inline config is disabled in both halves so neither `eslint-disable` nor
        // `eslint-enable` can turn that boundary off.
        files: [
            "packages/ui/src/blocks/**/{index,component}.tsx",
            "**/candidate/src/**/blocks/**/{index,component}.tsx",
        ],
        linterOptions: { noInlineConfig: true },
    },
    {
        /*
         * The enforcement layer is source too, and it is NODE source: rule modules and their twin
         * tests read `process` and run under the test runner, never in a browser. Without this the
         * repository-wide `globals.browser` is all they get and every one of those reads is an
         * undefined variable.
         *
         * THE PATH IS `eslint-canon`, NOT `eslint`, and the difference cost a red gate: the mirror
         * folder was renamed when it became generated output and this glob was left behind, so it
         * matched nothing and said so in the only way a non-matching glob can - silently.
         */
        files: ["plugins/eslint-canon/**/*.{js,mjs,cjs}"],
        languageOptions: { globals: globals.node },
        rules: { indent: "off" },
    },
    {
        files: ["scripts/**/*.{js,mjs,cjs}"],
        languageOptions: { globals: globals.node },
    },
])
