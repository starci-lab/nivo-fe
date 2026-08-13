"use client"

import { useTranslations } from "next-intl"
import { _DangerZone } from "./component"

/**
 * BLOCK - the lifecycle actions that destroy work, connected half.
 *
 * TARGET PATH: `apps/app/src/components/blocks/resource/DangerZone/index.tsx`.
 *
 * IT KNOWS WHAT THESE ACTIONS MEAN, which is what makes it a block rather than a row of buttons.
 * `rebuild` destroys the container and builds it again; `reprovision` destroys the DATA. A component
 * that only knew "two presses, one of them serious" could not have written that sentence, and the
 * sentence is the whole reason this owner exists.
 *
 * IT IS RENDERED ONLY FOR AN OPERATOR, AND THE PAGE DECIDES THAT. The ops endpoints sit behind
 * `PlatformOperatorHttpGuard`, so a customer cannot call them at all. A disabled button would promise
 * a control that does not exist for that reader; absence is the honest shape, and it is a STATE of
 * the page above rather than a prop of this block (BLOCK-2).
 *
 * WHY IT SPLITS THOUGH IT FETCHES NOTHING. SPLIT-6 excuses a surface with no REQUEST, and this was
 * written as one file on that reading. The lint refused it, and the lint is right: a block calling
 * `useTranslations` reaches for the translation runtime, so its drawing half could not be rendered
 * from a fixture - which is the property the split exists to protect. Copy is resolved before it
 * crosses (SPLIT-4), and only then is there one file where DATA can go wrong and another where
 * DRAWING can.
 */

/** Props for {@link DangerZone}. */
export interface DangerZoneProps {
    /** Whether the reader may reach the operator-only endpoints at all. */
    readonly isOperator: boolean
}

/**
 * The destructive lifecycle actions, for a reader who can actually reach them.
 *
 * @param props - {@link DangerZoneProps}
 * @returns The block, or nothing at all when the reader is not an operator.
 */
export const DangerZone = ({ isOperator }: DangerZoneProps) => {
    const t = useTranslations("resourceDetail")
    if (!isOperator) {
        return null
    }
    return (
        <_DangerZone
            props={{
                title: t("dangerLabel"),
                description: t("dangerBody"),
                rebuildLabel: t("rebuild"),
                reprovisionLabel: t("reprovision"),
            }}
            on={{ rebuild: () => undefined, reprovision: () => undefined }}
        />
    )
}

/** Source-level tier marker. */
export const meta = { shape: "block", world: "connected" } as const
