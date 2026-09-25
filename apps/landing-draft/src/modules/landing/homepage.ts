import { SITE_LINKS } from "./site"

/** One step in a public explanatory flow; it never implies runtime completion. */
export type PublicFlowStep = {
    readonly id: string
    readonly label: string
    readonly description: string
}

/** Canonical Homepage copy selected from the approved Homepage V1.0 contract. */
export const HOMEPAGE_COPY = {
    hero: {
        eyebrow: "NIVO",
        title: "Nền tảng vận hành kinh doanh AI-Native", // vn-ok: approved visitor copy
        titlePrefix: "Nền tảng vận hành kinh doanh", // vn-ok: approved visitor copy
        titleAccent: "AI-Native",
        descriptor: "AI-Native Business Operating Platform",
        supporting: "NIVO xây NIVO OS để giúp doanh nghiệp chuyển bối cảnh kinh doanh thành trách nhiệm rõ, phối hợp con người và AI để thực thi, kiểm chứng kết quả và học từ vận hành.", // vn-ok: approved visitor copy
        philosophy: "Human Leads. AI Operates. System Learns.",
        primary: { href: SITE_LINKS.nivoOs, label: "Tìm hiểu NIVO OS" }, // vn-ok: approved visitor copy
        secondary: { href: SITE_LINKS.applications, label: "Khám phá Giải pháp" }, // vn-ok: approved visitor copy
        artworkAlt: "Kỳ lân NIVO trong vòng vận hành kết nối con người, AI, trách nhiệm và kết quả có thể kiểm chứng.", // vn-ok: approved visitor copy
        artworkCaption: "Context, Responsibility, Human + AI, Verified outcome.",
    },
    today: {
        status: "NIVO today · Building, operating & verifying",
        headline: "Đang xây. Đang vận hành. Đang kiểm chứng.", // vn-ok: approved visitor copy
        focusLabel: "Current focus",
        focus: ["Lead", "Revenue"],
        principle: "Evidence before scale.",
    },
    relevance: {
        eyebrow: "Giải pháp", // vn-ok: approved visitor copy
        title: "Bắt đầu từ một kết quả kinh doanh cần được đảm bảo.", // vn-ok: approved visitor copy
        supporting: "NIVO không bắt đầu từ câu hỏi “cần thêm AI Agent nào?”. NIVO bắt đầu từ điều doanh nghiệp cần xảy ra, trách nhiệm phải được đảm bảo và bằng chứng xác nhận kết quả thực sự đạt được.", // vn-ok: approved visitor copy
        exampleLabel: "Ví dụ trọng tâm", // vn-ok: approved visitor copy
        example: ["Lead", "Revenue"],
        responsibility: "Đảm bảo cơ hội bán hàng quan trọng không bị bỏ quên và luôn có bước tiếp theo rõ ràng.", // vn-ok: approved visitor copy
        steps: [
            { id: "need", label: "Business need", description: "Điều doanh nghiệp cần xảy ra." }, // vn-ok: approved visitor copy
            { id: "responsibility", label: "Responsibility", description: "Trách nhiệm và giới hạn được xác định rõ." }, // vn-ok: approved visitor copy
            { id: "execution", label: "Human + AI execution", description: "Con người dẫn dắt, AI vận hành trong giới hạn." }, // vn-ok: approved visitor copy
            { id: "evidence", label: "Evidence", description: "Kết quả được đối chiếu bằng bằng chứng." }, // vn-ok: approved visitor copy
        ] satisfies ReadonlyArray<PublicFlowStep>,
        flowLabel: "Từ nhu cầu kinh doanh đến bằng chứng", // vn-ok: approved visitor copy
        action: "Khám phá Giải pháp", // vn-ok: approved visitor copy
    },
    operatingModel: {
        eyebrow: "NIVO OS · System of Responsibility",
        title: "Từ điều doanh nghiệp cần xảy ra đến kết quả có thể kiểm chứng.", // vn-ok: approved visitor copy
        supporting: "Không chỉ tự động hóa công việc. Hệ thống hóa trách nhiệm.", // vn-ok: approved visitor copy
        anatomyLabel: "Bốn thành phần của một Responsibility", // vn-ok: approved visitor copy
        rolesLabel: "Vai trò trọng tâm", // vn-ok: approved visitor copy
        anatomy: [
            { id: "outcome", icon: "complete", label: "Outcome", description: "Định nghĩa kết quả thực sự quan trọng." }, // vn-ok: approved visitor copy
            { id: "accountability", icon: "account", label: "Accountability", description: "Làm rõ ai chịu trách nhiệm đến cùng." }, // vn-ok: approved visitor copy
            { id: "boundary", icon: "code", label: "Boundary", description: "Xác định phạm vi và những gì nằm ngoài phạm vi." }, // vn-ok: approved visitor copy
            { id: "evidence", icon: "review", label: "Evidence", description: "Cho thấy điều gì đã xảy ra bằng chứng cứ xác thực." }, // vn-ok: approved visitor copy
        ] as const,
        steps: [
            { id: "intent", label: "Business intent", description: "Mục tiêu, ưu tiên và giá trị." }, // vn-ok: approved visitor copy
            { id: "context", label: "Context & state", description: "Bối cảnh, dữ liệu và trạng thái hiện tại." }, // vn-ok: approved visitor copy
            { id: "responsibility", label: "Responsibility", description: "Trách nhiệm, ranh giới và nguyên tắc." }, // vn-ok: approved visitor copy
            { id: "execution", label: "Governed execution", description: "Thực thi có kiểm soát và giám sát." }, // vn-ok: approved visitor copy
            { id: "outcome", label: "Verified outcome", description: "Kết quả được đối chiếu bằng bằng chứng." }, // vn-ok: approved visitor copy
        ] satisfies ReadonlyArray<PublicFlowStep>,
        roleVisuals: [
            {
                src: "/images/operating/human-leads-v2.png",
                label: "Human leads",
                description: "Con người giữ mục tiêu, phán đoán và trách nhiệm.", // vn-ok: approved visitor copy
            },
            {
                src: "/images/operating/ai-operates-v2.png",
                label: "AI operates",
                description: "AI vận hành trong giới hạn trách nhiệm đã xác định.", // vn-ok: approved visitor copy
            },
            {
                src: "/images/operating/system-learns-v2.png",
                label: "System learns",
                description: "Hệ thống học từ vận hành và bằng chứng thực tế.", // vn-ok: approved visitor copy
            },
            {
                src: "/images/operating/verified-outcome-v2.png",
                label: "Verified outcome",
                description: "Kết quả được đối chiếu trước khi mở rộng.", // vn-ok: approved visitor copy
            },
        ],
        principle: "Action ≠ Outcome",
        principleBody: "Hoàn thành tác vụ chưa chắc là hoàn thành trách nhiệm.", // vn-ok: approved visitor copy
        flowLabel: "Mô hình vận hành NIVO OS", // vn-ok: approved visitor copy
        primaryAction: "Tìm hiểu NIVO OS", // vn-ok: approved visitor copy
        secondaryAction: "Tìm hiểu System of Responsibility", // vn-ok: approved visitor copy
    },
    commercial: {
        eyebrow: "Bắt đầu với NIVO", // vn-ok: approved visitor copy
        title: "Bắt đầu với một trách nhiệm thật.", // vn-ok: approved visitor copy
        supporting: "Tìm đúng business need, hiểu responsibility, rồi chọn cách bắt đầu phù hợp. Mức giá sở hữu quyết định thương mại; activation sở hữu giao dịch và trạng thái dùng thử.", // vn-ok: approved visitor copy
        routeLabel: "Lộ trình bắt đầu", // vn-ok: approved visitor copy
        route: ["Tìm đúng business need", "Hiểu responsibility", "Xem cách bắt đầu"], // vn-ok: approved visitor copy
        primaryAction: "Xem Mức giá", // vn-ok: approved visitor copy
        assistedAction: "Cần trao đổi thêm?", // vn-ok: approved visitor copy
    },
    trust: {
        eyebrow: "The trust layer",
        title: ["Evidence", "Trust", "Permission"],
        supporting: "Quyền mở rộng phạm vi và mức tự chủ chỉ tăng lên sau khi trách nhiệm được thực thi trong giới hạn rõ và kết quả được kiểm chứng.", // vn-ok: approved visitor copy
        futureLabel: "Định hướng dài hạn", // vn-ok: approved visitor copy
        futureTitle: "Doanh nghiệp tự chủ hơn. Thông minh hơn. Bền vững hơn.", // vn-ok: approved visitor copy
        futureBody: "AI-Self-Sustaining Business là đích đến dài hạn, không phải một capability hiện tại hay lời hứa bán hàng.", // vn-ok: approved visitor copy
        trustAction: "Tìm hiểu Trust", // vn-ok: approved visitor copy
        ecosystemAction: "Khám phá Hệ sinh thái", // vn-ok: approved visitor copy
    },
    ideas: {
        eyebrow: "NIVO Ideas",
        title: "Những ý tưởng đang định hình NIVO.", // vn-ok: approved visitor copy
        supporting: "Khám phá góc nhìn, framework và những điều NIVO đang học trong quá trình xây dựng một System of Responsibility.", // vn-ok: approved visitor copy
        action: "Khám phá Ideas", // vn-ok: approved visitor copy
    },
    nextPathLabel: "Chọn bước tiếp theo", // vn-ok: approved visitor copy
} as const

/** Valid structured data containing only canonical entity relationships. */
export const HOMEPAGE_STRUCTURED_DATA = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization",
            "@id": "https://nivo.vn/#organization",
            name: "NIVO",
            url: "https://nivo.vn/",
        },
        {
            "@type": "WebSite",
            "@id": "https://nivo.vn/#website",
            name: "NIVO.VN",
            url: "https://nivo.vn/",
            inLanguage: "vi",
            publisher: { "@id": "https://nivo.vn/#organization" },
        },
        {
            "@type": "WebPage",
            "@id": "https://nivo.vn/#webpage",
            name: HOMEPAGE_COPY.hero.title,
            url: "https://nivo.vn/",
            inLanguage: "vi",
            isPartOf: { "@id": "https://nivo.vn/#website" },
            about: { "@id": "https://nivo.vn/#organization" },
        },
    ],
}).replaceAll("<", "\\u003c")

/** Final intent routes preserve the six architectural user jobs without a CTA wall. */
export const HOMEPAGE_NEXT_PATHS = [
    {
        title: "Tìm hiểu", // vn-ok: approved visitor copy
        links: [
            { href: SITE_LINKS.nivoOs, label: "NIVO OS" },
            { href: SITE_LINKS.applications, label: "Giải pháp" }, // vn-ok: approved visitor copy
        ],
    },
    {
        title: "Bắt đầu", // vn-ok: approved visitor copy
        links: [
            { href: SITE_LINKS.pricing, label: "Mức giá" }, // vn-ok: approved visitor copy
        ],
    },
    {
        title: "Kết nối", // vn-ok: approved visitor copy
        links: [
            { href: SITE_LINKS.company, label: "Về NIVO" }, // vn-ok: approved visitor copy
            { href: SITE_LINKS.contact, label: "Liên hệ" }, // vn-ok: approved visitor copy
        ],
    },
] as const
