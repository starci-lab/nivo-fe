import { copyFile, mkdir } from "node:fs/promises"
import { resolve } from "node:path"

const packageRoot = resolve(import.meta.dirname, "..")
const outputDirectory = resolve(packageRoot, "dist")

await mkdir(outputDirectory, { recursive: true })
await copyFile(resolve(packageRoot, "src/styles.css"), resolve(outputDirectory, "styles.css"))
await copyFile(
    resolve(packageRoot, "src/leaves/NivoGrammar/nivo.css"),
    resolve(outputDirectory, "family.css"),
)
