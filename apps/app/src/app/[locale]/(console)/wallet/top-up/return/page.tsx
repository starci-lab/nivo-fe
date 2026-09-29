import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { WalletPage } from "@/features/pages/WalletPage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.walletTopUpReturn")
    return {
        title: t("title"),
        description: t("description"),
    }
}

/** Provider return route; the connected wallet reconciles persisted balance evidence. */
const Page = () => <WalletPage />

export default Page
