import type { CodegenConfig } from "@graphql-codegen/cli"

/**
 * Wire types are never written by hand: each schema copy the contract check proves is read once,
 * every .graphql document under the api module is validated against its schema, and the result types
 * and the documents themselves are emitted into __generated__/. The output is rebuilt before every
 * typecheck, test and build, so it is never committed.
 *
 * The console speaks two backend schemas through one endpoint: `core` and `agentos-controlplane`.
 * A document belongs to the control plane when its file is named `<module>.controlplane.graphql`;
 * every other document belongs to core.
 */
const generated = {
    plugins: ["typescript", "typescript-operations", "typed-document-node"],
    config: {
        documentMode: "string",
        immutableTypes: true,
        useTypeImports: true,
        dedupeOperationSuffix: true,
        avoidOptionals: {
            // A field the wire always answers, null or not, is a required member; only input objects
            // keep optional members so a request names just what it asks.
            field: true,
            inputValue: false,
            object: false,
            defaultValue: false,
        },
    },
}

const config: CodegenConfig = {
    generates: {
        "src/modules/api/__generated__/core.ts": {
            schema: "src/modules/api/contract/core.graphql",
            documents: ["src/modules/api/**/*.graphql", "!src/modules/api/**/*.controlplane.graphql", "!src/modules/api/contract/**"],
            ...generated,
        },
        "src/modules/api/__generated__/agentos-controlplane.ts": {
            schema: "src/modules/api/contract/agentos-controlplane.graphql",
            documents: ["src/modules/api/**/*.controlplane.graphql"],
            ...generated,
        },
    },
}

export default config
