import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { GroupChatPage } from "@/features/pages/GroupChatPage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.chat")
    return {
        title: t("title"),
        description: t("description"),
    }
}

/** Mount the single-business mixed-member group-chat surface. */
const Page = () => <GroupChatPage />

export default Page
