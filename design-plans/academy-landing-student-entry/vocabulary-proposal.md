# Vocabulary proposal — WITHDRAWN

Case `case-academy-entry`, raised and withdrawn during Preview on 2026-08-13.
**Nothing is proposed. Canon needs no change.** This file is kept rather than deleted because the
wrong reading it records is an easy one to repeat.

## What was claimed

That `auth-entry-stack` was unbuildable, because

```ts
credentials: { leaf: "form" }      // contracts/index.ts:995
```

names a leaf that does not exist — `@nivo/ui` ships 28 leaves and none is called `form`. Two
successive edits were proposed on that basis: first repointing the slot at `form-column`, then
building a 29th leaf.

## Why it was wrong

`leaf: "form"` is a **name**, not a path. `defineLeafComponent(name, props, render)` stamps a leaf
identity onto a render written at the call site; it never requires a file under `leaves/`. The same
candidate already relied on this without noticing — `defineLeafComponent("input", {}, () => <input …/>)`
satisfies an `input` slot with no `Input` component involved.

The reference settles it. `starci-academy-fe/src/components/blocks/auth/AuthenticationPanel/component.tsx:309`:

```tsx
credentials: defineLeafComponent("form", {}, () => (
    <form onSubmit={submit}>
        <Tree contract="stacked-peer-controls" render={…} />
    </form>
)),
```

starci has **47 leaves and no `Form` among them**, and its contract registry is identical to nivo's —
same two sites (`leaf: ["form", "divider"]` and `credentials: { leaf: "form" }`), same `why`, because
nivo's was copied from it. A shape running in production cannot be evidence that the vocabulary it
uses is broken.

## The reasoning error, named

The claim was derived from a **folder convention** rather than from the mechanism: `leaf: "x"` was
read as "there must be `leaves/X/index.tsx`", `ls leaves/` disagreed, and canon was declared at
fault. Two things made the wrong reading comfortable:

- `divider`, sitting beside `form` in the same slot array, **is** a real leaf — so the array looked
  like one built entry and one missing one.
- An earlier grep counted `leaf: "form"` and missed `leaf: ["form", "divider"]`, so the defect was
  reported as appearing once when it appeared twice. Being wrong about the count made the second
  proposal look better evidenced than it was.

Both proposals were put to the user and one was approved before the error was found. The correction
came from the user asking why anything was being written at all when HeroUI and starci already
existed — which is the question the phase should have asked itself.

## What actually happens

No canon edit. No new leaf. `AuthenticationPanel` satisfies `credentials` exactly as the reference
does, and the candidate proves it with `tsc` rather than asserting it.
