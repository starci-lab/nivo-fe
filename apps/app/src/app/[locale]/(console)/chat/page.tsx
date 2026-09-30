import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { GroupChatPage } from "@/features/pages/GroupChatPage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const metadata = await getTranslations("metadata.chat")
    const page = await getTranslations("console.groupChat")
    return {
        title: metadata("title"),
        description: page("description"),
    }
}

/** Mount the single-business mixed-member group-chat surface. */
const Page = () => <GroupChatPage />

export default Page
