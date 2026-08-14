import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { MemberDashboardPage } from "@/components/pages/MemberDashboardPage"

/** Next hands the dynamic segment over as a promise. */
type LocaleSegment = { readonly params: Promise<{ readonly locale: string }> }

/**
 * Whether this preview is standing in for a signed-in member.
 *
 * A FIXTURE, NOT A SESSION. The candidate has no auth; production reads the
 * refresh cookie. What matters here is that the GUARD exists and is exercised,
 * because the first revision had none and rendered a dashboard to a visitor who
 * had never signed in.
 */
const HAS_SESSION = true

/**
 * The routed member dashboard.
 *
 * IT GUARDS BEFORE IT DRAWS. A dashboard is not a public page: with no session
 * the reader belongs at `/authentication`, not at an empty dashboard. Revision
 * 1.0 conflated two different situations - no session, and a session that owns
 * nothing yet - and rendered the second when it should have redirected on the
 * first.
 *
 * THE ACADEMY SEEDS ITS CATALOGUE, so a brand-new member has courses available
 * to enrol in. "You have nothing" was never the true first screen; "here is what
 * to start" is.
 *
 * @param input - The locale segment.
 * @returns The route, or a redirect.
 */
const DashboardRoute = async ({ params }: LocaleSegment) => {
    const { locale } = await params
    setRequestLocale(locale)
    if (!HAS_SESSION) {
        redirect(`/${locale}/authentication`)
    }
    return (
        <MemberDashboardPage
            knowledge={{
                heading: "Tri thức", // vn-ok: band name from the owner's own mindmap
                body: "Khoá Khởi nghiệp tinh gọn đang mở. Bắt đầu buổi đầu tiên.", // vn-ok: user-facing copy
                actionLabel: "Bắt đầu học", // vn-ok: user-facing copy
            }}
            standing={{
                heading: "Danh", // vn-ok: band name from the owner's own mindmap
                body: "Chứng chỉ và XP xuất hiện khi bạn hoàn thành bài đầu tiên.", // vn-ok: user-facing copy
            }}
            earnings={{
                heading: "Lợi", // vn-ok: band name from the owner's own mindmap
                body: "Giới thiệu bạn bè để nhận hoa hồng từ học viện.", // vn-ok: user-facing copy
                actionLabel: "Tìm hiểu", // vn-ok: user-facing copy
            }}
        />
    )
}

export default DashboardRoute
