import { Text } from "@starci/grammar/common"
import type { ReactNode } from "react"
import { CLASS_NAMES as C } from "./classNames"

type ExploreNoticeProps = { readonly title: string; readonly children: ReactNode }

/** A truth-boundary statement with supporting explanatory copy. */
const ExploreNotice = ({ title, children }: ExploreNoticeProps) => (
    <aside className={C.notice}>
        <strong className={C.title}>{title}</strong>
        <div className={C.body}>
            <Text as="p" size="sm" tone="muted">
                {children}
            </Text>
        </div>
    </aside>
)

export default ExploreNotice
