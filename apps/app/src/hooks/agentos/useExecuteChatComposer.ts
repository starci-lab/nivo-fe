import { useState } from "react"

/** Own the editable draft and its reset identity for one Execute conversation. */
export const useExecuteChatComposer = (onSend: (content: string) => void) => {
    const [draft, setDraft] = useState("")
    const [composerKey, setComposerKey] = useState(0)
    const submit = () => {
        const content = draft.trim()
        if (content.length === 0) return
        onSend(content)
        setDraft("")
        setComposerKey((current) => current + 1)
    }
    return { draft, composerKey, setDraft, submit }
}
