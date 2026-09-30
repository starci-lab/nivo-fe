/** Resolved sentences for a product hero and its illustration. */
export type ProductHeroCopy = {
    readonly eyebrow: string
    readonly title: string
    readonly descriptor: string | null
    readonly supporting: string
    readonly philosophy: string | null
    readonly signalLabel: string
    readonly signalValue: string
    readonly signalNote: string
    readonly coreName: string
    readonly coreLabel: string
    readonly nodesLabel: string
    readonly nodes: Readonly<Record<"businessIntent" | "humanLeads" | "aiOperates" | "outcomeVerified", string>>
    readonly owner: string
    readonly responsibility: string
    readonly stepsLabel: string
    readonly steps: Readonly<Record<"context" | "boundary" | "evidence", string>>
    readonly gallery: Readonly<Record<"growth" | "operate" | "money" | "create", string>>
}
