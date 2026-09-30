import { useRef, useState } from "react"

type WorkbenchCommandAnswer = {
    readonly ok: boolean
    readonly code?: string | null
    readonly reason?: string | null
}

type WorkbenchNotice = { readonly kind: "success" | "refused"; readonly message: string }

type WorkbenchCommandOptions<TAnswer extends WorkbenchCommandAnswer> = {
    readonly key: string
    readonly value: unknown
    readonly press: (requestId: string) => Promise<TAnswer>
    readonly readback: (() => Promise<TAnswer | undefined>) | null
    readonly describe: (answer: TAnswer) => WorkbenchNotice | null
}

type UseWorkbenchCommandOptions = {
    readonly refusal: (code: string, reason: string) => string
    readonly unsettled: string
    readonly unreachable: string
    readonly acceptsFailedAnswer?: (code: string) => boolean
}

type Intent = { readonly fingerprint: string; readonly token: string }

let requestSequence = 0
const requestId = (): string => {
    const uuid = globalThis.crypto?.randomUUID?.()
    if (uuid !== undefined) return uuid
    requestSequence += 1
    return `command-${Date.now()}-${requestSequence}`
}

/** Own the shared command identity, pending, refusal, and readback settlement lifecycle. */
export const useWorkbenchCommand = (options: UseWorkbenchCommandOptions) => {
    const [notice, setNotice] = useState<WorkbenchNotice | null>(null)
    const [pendingKeys, setPendingKeys] = useState<ReadonlySet<string>>(() => new Set())
    const intents = useRef<Record<string, Intent>>({})
    const activeKeys = useRef(new Set<string>())

    const tokenFor = (key: string, value: unknown): string => {
        const fingerprint = JSON.stringify(value) ?? "undefined"
        const prior = intents.current[key]
        if (prior?.fingerprint === fingerprint) return prior.token
        const token = requestId()
        intents.current[key] = { fingerprint, token }
        return token
    }

    const settle = async <TAnswer extends WorkbenchCommandAnswer>(
        command: WorkbenchCommandOptions<TAnswer>,
    ): Promise<void> => {
        if (activeKeys.current.has(command.key)) return
        activeKeys.current.add(command.key)
        setPendingKeys(new Set(activeKeys.current))
        setNotice(null)
        try {
            const answer = await command.press(tokenFor(command.key, command.value))
            if (!answer.ok && options.acceptsFailedAnswer?.(answer.code ?? "") !== true) {
                setNotice({
                    kind: "refused",
                    message: options.refusal(answer.code ?? "", answer.reason ?? ""),
                })
                return
            }
            const settled = command.readback === null ? answer : await command.readback()
            const result = settled?.ok === true ? command.describe(settled) : null
            if (result === null) {
                setNotice({ kind: "refused", message: options.unsettled })
                return
            }
            if (result.kind === "success") delete intents.current[command.key]
            setNotice(result)
        } catch {
            setNotice({ kind: "refused", message: options.unreachable })
        } finally {
            activeKeys.current.delete(command.key)
            setPendingKeys(new Set(activeKeys.current))
        }
    }

    return {
        notice,
        settle,
        isPending: (key: string): boolean => pendingKeys.has(key),
    }
}
