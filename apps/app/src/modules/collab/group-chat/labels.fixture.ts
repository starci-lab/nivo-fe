import { createTranslator } from "next-intl"
import viMessages from "@/messages/vi.json"
import { buildGroupChatLabels } from "./labels"
import type { GroupChatPageLabels } from "./types"

/** Resolved Vietnamese catalog copy used by pure block tests: the page's own label builder over the real `vi` catalog. */
export const labels: GroupChatPageLabels = buildGroupChatLabels(
    createTranslator({
        locale: "vi",
        messages: viMessages,
        namespace: "console.groupChat",
        onError: (error) => {
            throw error
        },
    }),
    () => "09:14",
)
