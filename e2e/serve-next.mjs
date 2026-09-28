/**
 * Serve one built app for the run — the e2e lane's shared `next start` helper.
 *
 * THE SUITE OWNS THE SERVER. Each spec boots the production server the way
 * scripts/e2e-smoke.mjs established for @nivo/app: `next start` on a run-owned loopback port,
 * polled until the first sub-500 answer, then killed on the way out (taskkill on Windows, where
 * signal delivery does not reach the spawned process tree). Nothing here reuses a developer's
 * dev server: a spec that wants one names it through its own `*_URL` env and then stops nothing.
 */
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const serveNextApp = async ({ appDir, port, timeoutMs = 45_000 }) => {
    const baseUrl = `http://127.0.0.1:${port}`;
    const server = spawn(
        process.execPath,
        [path.join(ROOT, "node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)],
        { cwd: path.join(ROOT, appDir), stdio: "inherit", shell: false, windowsHide: true },
    );

    const stop = () => {
        if (server.exitCode !== null || server.pid === undefined) return;
        if (process.platform === "win32") {
            spawnSync("taskkill", ["/pid", String(server.pid), "/t", "/f"], { stdio: "ignore", windowsHide: true });
            return;
        }
        server.kill("SIGTERM");
    };

    const deadline = Date.now() + timeoutMs;
    let lastError;
    while (Date.now() < deadline) {
        try {
            /* Readiness is any answer at all - redirects included. The scenarios assert the document,
               so the probe must not follow them into a redirect target. */
            const response = await fetch(`${baseUrl}/`, { redirect: "manual" });
            if (response.status < 500) return { baseUrl, stop };
        } catch (error) {
            lastError = error;
        }
        await new Promise((done) => setTimeout(done, 250));
    }
    stop();
    throw new Error(`${appDir} did not answer within ${timeoutMs}ms at ${baseUrl} (${lastError?.message ?? "no response"})`);
};
