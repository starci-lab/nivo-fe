import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { SalesHandoffBlockBase } from "./component";
import type { useSalesHandoff } from "@/hooks";
import en from "@/messages/en.json";
import viMessages from "@/messages/vi.json";

/*
 * The rendering assertions the accepted handoff direction pins, one per state that changes what an
 * operator sees: the prepared handoff and the one authorized submission, the submitting hold, the
 * status whose attempt may have started (lookup only, never a new submission), the admission that is
 * intake only, and the refusal Accounting itself stated. The copy asserted here is the real catalog,
 * so a renamed key fails this spec rather than silently rendering a key path.
 */

type Catalog = Readonly<Record<string, unknown>>;
const catalog = en.agentos.sales.handoff as Catalog;
const vietnamese = viMessages.agentos.sales.handoff as Catalog;
const messageFor = (source: Catalog, key: string): string => {
  let node: unknown = source;
  for (const part of key.split(".")) {
    if (node === null || typeof node !== "object") return key;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : key;
};
const translate = (key: string, values?: Readonly<Record<string, string | number | undefined>>): string =>
  Object.entries(values ?? {}).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), messageFor(catalog, key));
const keyPaths = (source: unknown, prefix = ""): ReadonlyArray<string> => source !== null && typeof source === "object"
  ? Object.entries(source as Record<string, unknown>).flatMap(([name, value]) => keyPaths(value, prefix.length === 0 ? name : `${prefix}.${name}`))
  : [prefix];
const inert = (target: Element | null): boolean => target !== null && (target.hasAttribute("disabled") || target.getAttribute("aria-disabled") === "true");
const buttonLabelled = (container: HTMLElement, label: string): Element | null =>
  [...container.querySelectorAll("button")].find(button => (button.textContent ?? "").includes(label)) ?? null;

const PREPARED = { handoffId: "handoff-1", status: "prepared", orderRevision: 4, actionId: null as string | null, revision: 2 };

/** The full settled view the direction's prepared state draws, overridden per state under test. */
const view = (overrides: Record<string, unknown> = {}): ReturnType<typeof useSalesHandoff> => {
  const settled: Record<string, unknown> = {
    t: translate,
    scopeWorkspace: "workspace-1",
    scopeInstallation: "installation-1",
    scopeReady: true,
    scopeStanding: "ready",
    notice: null,
    handoff: {
      standing: "ready",
      model: PREPARED as typeof PREPARED | null,
      handoffId: "handoff-1",
      setHandoffId: () => undefined,
      isLoading: false,
      reload: () => undefined
    },
    submission: {
      standing: "ready",
      fingerprint: "sha256:handoff-1",
      setFingerprint: () => undefined,
      expectedRevision: "2",
      setExpectedRevision: () => undefined,
      isSubmitting: false,
      addressable: true,
      lookupOnly: false,
      onSubmit: () => undefined
    }
  };
  const merged: Record<string, unknown> = { ...settled, ...overrides };
  for (const group of ["handoff", "submission"]) merged[group] = { ...(settled[group] as Record<string, unknown>), ...((overrides[group] as Record<string, unknown> | undefined) ?? {}) };
  return merged as unknown as ReturnType<typeof useSalesHandoff>;
};
const renderBlock = (input: Record<string, unknown> = {}) => {
  const rendered: ReactElement = <SalesHandoffBlockBase props={{ view: view(input) }} />;
  return render(rendered);
};

describe("SalesHandoffBlockBase", () => {
  it("keeps every handoff copy key in both catalogues", () => {
    expect([...keyPaths(vietnamese)].sort()).toEqual([...keyPaths(catalog)].sort());
  });

  it("draws the prepared handoff exactly as the read disclosed it, with one submission offered", () => {
    const { container } = renderBlock();
    const text = container.textContent ?? "";
    expect(text).toContain(translate("title"));
    expect(text).toContain(translate("status.prepared"));
    expect(text).toContain(translate("handoff.identity", { handoff: "handoff-1", order: 4 }));
    expect(text).toContain(translate("handoff.revision", { revision: 2 }));
    expect(text).toContain(translate("handoff.actionNone"));
    expect(text).toContain(translate("submission.fingerprint"));
    expect(text).toContain(translate("submission.expectedRevision"));
    expect(text).toContain(translate("submission.note"));
    expect(text).toContain(translate("rail.installation", { workspace: "workspace-1", installation: "installation-1" }));
    expect(text).not.toContain(translate("status.accountingAdmitted"));
  });

  it("keeps the surface geometry with inert effects while the handoff read is still loading", () => {
    const { container } = renderBlock({ handoff: { standing: "loading", model: null }, submission: { standing: "loading", addressable: false }, scopeReady: false, scopeStanding: "loading" });
    const text = container.textContent ?? "";
    expect(text).toContain(translate("standing.loading"));
    expect(text).not.toContain("handoff-1");
    expect(container.querySelectorAll("button").length).toBeGreaterThan(0);
    expect(inert(buttonLabelled(container, translate("submission.submit")))).toBe(true);
  });

  it("shows one empty notice and no invented fact when the identity holds no handoff", () => {
    const { container } = renderBlock({ handoff: { standing: "empty", model: null }, submission: { standing: "empty", addressable: false } });
    const text = container.textContent ?? "";
    expect(text).toContain(translate("handoff.empty"));
    expect(text).toContain(translate("handoff.emptyHint"));
    expect(text).not.toContain(translate("handoff.revision", { revision: 2 }));
  });

  it("offers only a safe re-read on an error, with no cached handoff fact", () => {
    const { container } = renderBlock({ handoff: { standing: "unavailable", model: null }, submission: { standing: "unavailable", addressable: false } });
    const text = container.textContent ?? "";
    expect(text).toContain(translate("standing.safeToRetry"));
    expect(text).toContain(translate("standing.nothingChanged"));
    expect(text).not.toContain("handoff-1");
    expect(inert(buttonLabelled(container, translate("submission.submit")))).toBe(true);
  });

  it("clears protected facts on a denial and states a non-disclosing refusal", () => {
    const { container } = renderBlock({ handoff: { standing: "denied", model: null }, submission: { standing: "denied", addressable: false }, scopeStanding: "denied" });
    const text = container.textContent ?? "";
    expect(text).toContain(translate("refusal.forbidden"));
    expect(text).not.toContain("handoff-1");
    expect(text).not.toContain(translate("handoff.identity", { handoff: "handoff-1", order: 4 }));
  });

  it("holds a second submission while the first is still in flight", () => {
    const { container } = renderBlock({ submission: { isSubmitting: true, addressable: false } });
    const text = container.textContent ?? "";
    expect(text).toContain(translate("submission.submitting"));
    expect(inert(buttonLabelled(container, translate("submission.submit")))).toBe(true);
  });

  it("leaves only a lookup open once the attempt may have started", () => {
    const { container } = renderBlock({ handoff: { model: { ...PREPARED, status: "outcome-unknown" } }, submission: { lookupOnly: true, addressable: false } });
    const text = container.textContent ?? "";
    expect(text).toContain(translate("status.outcomeUnknown"));
    expect(text).toContain(translate("submission.lookupOnly"));
    expect(text).not.toContain(translate("submission.held"));
    expect(inert(buttonLabelled(container, translate("submission.submit")))).toBe(true);
  });

  it("shows an admission as intake only, never as a completed effect", () => {
    const { container } = renderBlock({ handoff: { model: { ...PREPARED, status: "accounting-admitted", actionId: "action-1", revision: 3 } }, submission: { addressable: false } });
    const text = container.textContent ?? "";
    expect(text).toContain(translate("status.accountingAdmitted"));
    expect(text).toContain(translate("handoff.intakeOnly"));
    expect(text).toContain(translate("handoff.action", { action: "action-1" }));
    expect(inert(buttonLabelled(container, translate("submission.submit")))).toBe(true);
  });

  it("states the refusal Accounting itself returned rather than a surface guess", () => {
    const { container } = renderBlock({
      handoff: { model: { ...PREPARED, status: "accounting-refused" } },
      submission: { addressable: false },
      notice: { kind: "refused", message: translate("refusal.validation") }
    });
    const text = container.textContent ?? "";
    expect(text).toContain(translate("status.accountingRefused"));
    expect(text).toContain(translate("refusal.validation"));
  });

  it("claims a submission only from a handoff that reads back with it", () => {
    const settled = renderBlock({ notice: { kind: "success", message: translate("submission.settled", { status: translate("status.accountingAdmitted") }) } }).container.textContent ?? "";
    expect(settled).toContain(translate("submission.settled", { status: translate("status.accountingAdmitted") }));
  });
});