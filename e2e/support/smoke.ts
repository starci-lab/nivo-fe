import { spawn, spawnSync, type ChildProcess } from "node:child_process"
import process from "node:process"
import { resolve } from "node:path"

const rootDir = resolve(__dirname, "..", "..")

export interface SmokeResult {
    status: number
    path: string
}

/** Exercise the production Next server, never an already-running development process. */
export const runSmoke = async (): Promise<SmokeResult> => {
    const port = process.env.NIVO_FE_E2E_PORT ?? "13067"
    const externalUrl = process.env.NIVO_FE_E2E_URL?.replace(/\/$/, "")
    const smokePath = process.env.NIVO_FE_E2E_PATH ?? "/en"
    const baseUrl = externalUrl ?? `http://127.0.0.1:${port}`
    let server: ChildProcess | undefined

    const stop = () => {
        if (!server || server.exitCode !== null) return
        if (process.platform === "win32" && server.pid !== undefined) {
            spawnSync("taskkill", ["/pid", String(server.pid), "/t", "/f"], {
                stdio: "ignore",
                windowsHide: true,
            })
            return
        }
        server.kill("SIGTERM")
    }
    const waitForServer = async (): Promise<Response> => {
        const deadline = Date.now() + 45_000
        while (Date.now() < deadline) {
            try {
                const response = await fetch(`${baseUrl}${smokePath}`)
                if (response.status < 500) return response
            } catch {
                await new Promise((done) => setTimeout(done, 250))
            }
        }
        throw new Error(`Nivo FE did not become ready at ${baseUrl}`)
    }

    try {
        if (!externalUrl) {
            server = spawn(
                process.execPath,
                [
                    resolve(rootDir, "node_modules/next/dist/bin/next"),
                    "start",
                    "--hostname",
                    "127.0.0.1",
                    "--port",
                    port,
                ],
                {
                    cwd: resolve(rootDir, "apps/app"),
                    stdio: "inherit",
                    shell: false,
                    windowsHide: true,
                },
            )
        }
        const response = await waitForServer()
        const body = await response.text()
        if (!response.ok || !body.trim()) {
            throw new Error(
                `Nivo FE smoke failed: ${baseUrl}${smokePath} returned HTTP ${response.status} or an empty document`,
            )
        }
        console.log(`Nivo FE smoke passed: GET ${smokePath} returned ${response.status}`)
        return { status: response.status, path: smokePath }
    } finally {
        stop()
    }
}
