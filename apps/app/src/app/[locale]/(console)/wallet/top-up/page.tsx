import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { WalletPage } from "@/features/pages/WalletPage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.walletTopUp")
    return {
        title: t("title"),
        description: t("description"),
    }
}

/** Deep link that opens the wallet's accepted top-up modal. */
const Page = () => <WalletPage />

export default Page
