import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useWorkbenchCommand } from "./useWorkbenchCommand"

type Answer = { readonly ok: boolean; readonly code?: string; readonly data?: string }

const useCommand = () =>
    useWorkbenchCommand({
        refusal: (code) => `refused:${code}`,
        unsettled: "unsettled",
        unreachable: "unreachable",
        acceptsFailedAnswer: (code) => code === "outcome_unknown",
    })

describe("useWorkbenchCommand", () => {
    it("refuses a command answer without reading back and clears its pending key", async () => {
        const readback = vi.fn(async (): Promise<Answer | undefined> => undefined)
        const { result } = renderHook(useCommand)

        await act(async () => {
            await result.current.settle<Answer>({
                key: "submit",
                value: { id: "one" },
                press: async () => ({ ok: false, code: "denied" }),
                readback,
                describe: () => ({ kind: "success", message: "settled" }),
            })
        })

        expect(readback).not.toHaveBeenCalled()
        expect(result.current.notice).toEqual({ kind: "refused", message: "refused:denied" })
        expect(result.current.isPending("submit")).toBe(false)
    })

    it("keeps an uncertain command pending through readback and reuses its identity until success", async () => {
        const tokens: Array<string> = []
        let finishReadback: ((answer: Answer | undefined) => void) | undefined
        const readback = vi.fn(
            () =>
                new Promise<Answer | undefined>((resolve) => {
                    finishReadback = resolve
                }),
        )
        const command = {
            key: "submit",
            value: { id: "one" },
            press: async (token: string): Promise<Answer> => {
                tokens.push(token)
                return { ok: false, code: "outcome_unknown" }
            },
            readback,
            describe: (answer: Answer) =>
                answer.data === undefined ? null : { kind: "success" as const, message: answer.data },
        }
        const { result } = renderHook(useCommand)

        await act(async () => {
            const first = result.current.settle(command)
            await Promise.resolve()
            expect(result.current.isPending("submit")).toBe(true)
            finishReadback?.(undefined)
            await first
        })

        expect(result.current.notice).toEqual({ kind: "refused", message: "unsettled" })
        expect(result.current.isPending("submit")).toBe(false)

        await act(async () => {
            await result.current.settle<Answer>({
                ...command,
                readback: async () => ({ ok: true, data: "confirmed" }),
            })
        })

        expect(tokens[1]).toBe(tokens[0])
        expect(result.current.notice).toEqual({ kind: "success", message: "confirmed" })

        await act(async () => {
            await result.current.settle<Answer>({
                ...command,
                readback: async () => ({ ok: true, data: "confirmed again" }),
            })
        })

        expect(tokens[2]).not.toBe(tokens[1])
    })
})
