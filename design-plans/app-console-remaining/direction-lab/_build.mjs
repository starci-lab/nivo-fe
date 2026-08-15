import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { Buffer } from "node:buffer"

const here = "D:/Repositories/nivo-fe/design-plans/app-console-remaining/direction-lab"
const parent = "D:/Repositories/nivo-fe/design-plans/app-console-remaining"

const read = (p) => readFileSync(p, "utf8")

const scenes = {
    a: read(join(parent, "dir-a.html")),
    b: read(join(here, "dir-b.html")),
    c: read(join(parent, "dir-c.html")),
}

const wrapped = {}
for (const id of ["a", "b", "c"]) {
    const wrap = read(join(here, `_wrap-${id}.html`))
    if (!wrap.includes("<!--SCENES-->")) throw new Error(`wrap-${id} missing SCENES marker`)
    wrapped[id] = wrap.replace("<!--SCENES-->", scenes[id].trimEnd())
}

let out = read(join(here, "_shell.html"))
for (const id of ["a", "b", "c"]) {
    const marker = `<!--DIR_${id.toUpperCase()}-->`
    if (!out.includes(marker)) throw new Error(`shell missing ${marker}`)
    out = out.replace(marker, wrapped[id])
}

writeFileSync(join(here, "index.html"), out, "utf8")

const count = (needle) => out.split(needle).length - 1
console.log(JSON.stringify({
    bytes: Buffer.byteLength(out, "utf8"),
    banner: count("DIRECTIONAL — NOT AN APPLY BASELINE"),
    idA: count('id="dir-a"'),
    idB: count('id="dir-b"'),
    idC: count('id="dir-c"'),
    scenesA: count('class="a-scene"'),
    scenesB: count('class="b-scene"'),
    scenesC: count('class="dc-scene"'),
    leftoverMarkers: count("<!--DIR_") + count("<!--SCENES-->"),
}, null, 0))
