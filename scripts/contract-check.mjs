#!/usr/bin/env node
/**
 * scripts/contract-check.mjs -- verify the committed backend schema copies.
 *
 * Each app keeps byte copies of the backend GraphQL schemas it speaks under
 * apps/<app>/src/modules/api/contract/<name>.graphql, and the sha256 of each is recorded beside it, so a
 * refresh is always one committed pair of files. This check refuses when a copy and its recorded hash drift
 * apart; given the nivo-backend contracts directory as an argument (or NIVO_BACKEND_CONTRACTS), it also
 * refuses when a copy is not the backend's current contract byte-for-byte.
 *
 *   node scripts/contract-check.mjs [../nivo-backend/contracts]
 *
 * Or through npm:  npm run contract:check
 */

import { createHash } from "node:crypto"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const APPS_WITH_CONTRACTS = ["app", "expert"]

/** Aborts with a readable message rather than a stack trace. */
const die = (message) => {
    console.error(`contract-check: ${message}`)
    process.exit(1)
}

const backendRoot = process.argv[2] ?? process.env.NIVO_BACKEND_CONTRACTS
let checked = 0
for (const app of APPS_WITH_CONTRACTS) {
    const directory = join(REPO_ROOT, "apps", app, "src", "modules", "api", "contract")
    if (!existsSync(directory)) die(`${directory} is missing - the schema copies are required`)
    const copies = readdirSync(directory).filter((name) => name.endsWith(".graphql"))
    if (copies.length === 0) die(`${directory} holds no .graphql schema copy`)
    for (const name of copies) {
        const copyPath = join(directory, name)
        const hashPath = `${copyPath}.sha256`
        if (!existsSync(hashPath)) die(`${hashPath} is missing - record sha256 of the schema copy in it when the copy is refreshed`)
        const copy = readFileSync(copyPath)
        const recorded = readFileSync(hashPath, "utf8").trim()
        const actual = createHash("sha256").update(copy).digest("hex")
        if (actual !== recorded) {
            die(`${copyPath} does not match its recorded hash (${actual} != ${recorded}) - refresh the copy and the .sha256 together`)
        }
        if (backendRoot !== undefined) {
            const source = join(backendRoot, name.replace(/\.graphql$/u, ""), "schema.graphql")
            if (!existsSync(source)) die(`backend schema ${source} does not exist`)
            if (readFileSync(source, "utf8").replaceAll("\r\n", "\n") !== copy.toString("utf8")) {
                die(`${copyPath} is not the same text as ${source} (line endings aside) - refresh it with npm run contract:emit in nivo-backend, then copy it here`)
            }
        }
        checked += 1
    }
}
console.log(
    backendRoot === undefined
        ? `${checked} schema copies match their recorded hashes.`
        : `${checked} schema copies match ${backendRoot} and their recorded hashes.`,
)
