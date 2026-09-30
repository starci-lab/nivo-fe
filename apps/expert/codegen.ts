import type { CodegenConfig } from "@graphql-codegen/cli"

/**
 * Wire types are never written by hand: the schema copy the contract check proves is read once,
 * every .graphql document under the api module is validated against it, and the result types and
 * the documents themselves are emitted into __generated__/. The output is rebuilt before every
 * typecheck, test and build, so it is never committed.
 */
const config: CodegenConfig = {
    schema: "src/modules/api/contract/expert-academy-api.graphql",
    documents: ["src/modules/api/**/*.graphql", "!src/modules/api/contract/**"],
    generates: {
        "src/modules/api/__generated__/graphql.ts": {
            plugins: ["typescript", "typescript-operations", "typed-document-node"],
            config: {
                documentMode: "string",
                immutableTypes: true,
                useTypeImports: true,
                dedupeOperationSuffix: true,
                avoidOptionals: { field: true, inputValue: false, object: false, defaultValue: false },
            },
        },
    },
}

export default config
