import { Badge, Button, Heading, PageContainer, Text, TextAction } from "@starci/grammar/common"
import { NivoIcon } from "@nivo/ui"
import type { ReactNode } from "react"
import { SectionIntro, SiteMain } from "@/features/layouts/SiteShell"
import { SITE_LINKS } from "@/modules/landing/site"
import { CLASS_NAMES as C, SECTION_CLASS_NAMES } from "./classNames"

/** One deliberate public knowledge format from the canonical Ideas contract. */
export type IdeaContentType = "Góc nhìn" | "Framework" | "NIVO đang xây" // vn-ok: Canonical Vietnamese public labels.

/** One governed section inside a public Idea. */
export type IdeaSection = { readonly title: string; readonly paragraphs: ReadonlyArray<string> }

/** Public view model for an approved knowledge object. */
export type IdeaArticle = {
    readonly slug: string
    readonly contentType: IdeaContentType
    readonly title: string
    readonly thesis: string
    readonly summary: string
    readonly topics: ReadonlyArray<string>
    readonly author: string
    readonly publisher: string
    readonly lifecycle: "Published"
    readonly sourceVersion: string
    readonly dateNote: string
    readonly truthContext: string
    readonly sections: ReadonlyArray<IdeaSection>
    readonly canonicalReference: ExploreAction
    readonly primaryNextPath: ExploreAction
    readonly relatedSlugs: ReadonlyArray<string>
}

const CONTACT_INTENT_IDS = ["product", "partnership", "institution", "media", "talent", "general"] as const

/** One canonical relationship-routing intent. */
export type ContactIntentId = typeof CONTACT_INTENT_IDS[number]

type ExploreAction = { readonly label: string; readonly href: string }
type HeroProps = {
    readonly id: string
    readonly eyebrow: string
    readonly title: string
    readonly description: string
    readonly primary: ExploreAction
    readonly secondary?: ExploreAction
    readonly modelLabel: string
    readonly modelSteps: ReadonlyArray<string>
    readonly visual?: "trust" | "ecosystem" | "ideas"
}
type SectionProps = {
    readonly id: string
    readonly eyebrow: string
    readonly title: string
    readonly description?: string
    readonly tone?: "default" | "soft" | "dark" | "burgundy"
    readonly children: ReactNode
}
type FlowStep = { readonly title: string; readonly description: string }
type FlowProps = { readonly label: string; readonly steps: ReadonlyArray<FlowStep> }
type NoticeProps = { readonly title: string; readonly children: ReactNode }
type PathGridProps = { readonly label: string; readonly paths: ReadonlyArray<ExploreAction> }
const COPY = {
    trust: {
        heroTitle: "Tương lai tự chủ hơn không bắt đầu bằng nhiều AI hơn. Nó bắt đầu bằng một trách nhiệm được thực hiện đáng tin cậy.", // vn-ok: Canonical Vietnamese public copy.
        heroBody: "Quyền tự chủ không được mặc định. Nó phải được kiếm bằng Responsibility rõ, Outcome được kiểm chứng, Evidence và Human Accountability.", // vn-ok: Canonical Vietnamese public copy.
        startTitle: "Niềm tin không bắt đầu từ việc giao cả doanh nghiệp cho AI.", // vn-ok: Canonical Vietnamese public copy.
        startBody: "Bắt đầu bằng một Responsibility đủ rõ: điều phải xảy ra, người accountable, phạm vi hoạt động, permission, evidence và exception path.", // vn-ok: Canonical Vietnamese public copy.
        governanceTitle: "Con người giữ trách nhiệm. AI chỉ vận hành trong phạm vi được phép.", // vn-ok: Canonical Vietnamese public copy.
        governanceBody: "Human leadership giữ intent, judgment, accountability, high-risk decisions và exception decisions.", // vn-ok: Canonical Vietnamese public copy.
        evidenceTitle: "NIVO không yêu cầu bạn tin vào roadmap. NIVO phải kiếm niềm tin từ kết quả.", // vn-ok: Canonical Vietnamese public copy.
        evidenceBody: "Observed Outcome và Verified Outcome là hai trạng thái khác nhau; Verification đứng giữa quan sát và quyền mở rộng Permission.", // vn-ok: Canonical Vietnamese public copy.
        journeyTitle: "Khi niềm tin tăng, doanh nghiệp có thể giao thêm trách nhiệm — không phải giao bỏ quyền kiểm soát.", // vn-ok: Canonical Vietnamese public copy.
        possibleTitle: "Khi vận hành đáng tin hơn, những giá trị lớn hơn có thể dần mở ra.", // vn-ok: Canonical Vietnamese public copy.
        truthTitle: "Một tương lai đáng tin phải nói rõ cả điều chưa có.", // vn-ok: Canonical Vietnamese public copy.
        securityLimit: "Chưa có security-control inventory được phép công bố. Không badge, chứng nhận hoặc mức bảo mật nào được suy diễn.", // vn-ok: Canonical Vietnamese public copy.
    },
    ecosystem: {
        heroTitle: "Năng lực vận hành mạnh hơn được xây từ những bối cảnh thực.", // vn-ok: Canonical Vietnamese public copy.
        heroBody: "Hệ sinh thái NIVO kết nối bối cảnh kinh doanh, tri thức chuyên môn, năng lực triển khai và bối cảnh tổ chức để tạo operating capacity có thể học hỏi, kiểm chứng và tái sử dụng.", // vn-ok: Canonical Vietnamese public copy.
        valueTitle: "Bối cảnh, tri thức và năng lực chỉ tạo lợi thế khi chúng có thể được kết nối và tái sử dụng.", // vn-ok: Canonical Vietnamese public copy.
        actorsTitle: "Mỗi actor đóng góp một phần khác nhau vào năng lực chung.", // vn-ok: Canonical Vietnamese public copy.
        growthTitle: "Mối quan hệ sâu hơn phải được kiếm bằng fit và evidence.", // vn-ok: Canonical Vietnamese public copy.
        proofTitle: "Chỉ hiển thị những mối quan hệ có thể chứng minh.", // vn-ok: Canonical Vietnamese public copy.
        pathTitle: "Bạn muốn tham gia từ vai trò nào?", // vn-ok: Canonical Vietnamese public copy.
    },
    ideas: {
        heroTitle: "Góc nhìn, framework và những điều NIVO đang học khi xây AI-Native Business.", // vn-ok: Canonical Vietnamese public copy.
        heroBody: "Nơi NIVO diễn giải những thay đổi quan trọng, cấu trúc các mô hình vận hành và chia sẻ điều đang được học trong quá trình xây NIVO OS. Ideas là knowledge surface, không phải blog hay news feed.", // vn-ok: Canonical Vietnamese public copy.
        featuredTitle: "Bắt đầu từ những ý tưởng quan trọng nhất.", // vn-ok: Canonical Vietnamese public copy.
        typeTitle: "Bạn muốn đọc theo cách tư duy nào?", // vn-ok: Canonical Vietnamese public copy.
        curatedTitle: "Conceptual coherence trước content volume.", // vn-ok: Canonical Vietnamese public copy.
        topicTitle: "Đi sâu theo chủ đề.", // vn-ok: Canonical Vietnamese public copy.
        continueTitle: "Từ một Idea tới canonical owner phù hợp.", // vn-ok: Canonical Vietnamese public copy.
    },
} as const

const IDEA_ARTICLES: ReadonlyArray<IdeaArticle> = [
    {
        slug: "responsibility-before-agent",
        contentType: "Góc nhìn", // vn-ok: Canonical Vietnamese public label.
        title: "Responsibility trước Agent", // vn-ok: Canonical Vietnamese public copy.
        thesis: "AI Agent là cơ chế thực thi; Responsibility mới là đơn vị kinh doanh xác định điều gì phải xảy ra, ai chịu trách nhiệm và bằng chứng nào xác nhận kết quả.", // vn-ok: Canonical Vietnamese public copy.
        summary: "Tách năng lực kỹ thuật của AI khỏi quyền được hành động trong doanh nghiệp.", // vn-ok: Canonical Vietnamese public copy.
        topics: ["Responsibility & Outcome", "Human + AI"], author: "NIVO", publisher: "NIVO", lifecycle: "Published",
        sourceVersion: "NIVO.VN V1.0 — Official Canonical Release",
        dateNote: "Nguồn chuẩn không cung cấp ngày xuất bản công khai.", // vn-ok: Canonical Vietnamese public copy.
        truthContext: "Diễn giải chiến lược; không phải tuyên bố capability sản phẩm hiện tại.", // vn-ok: Canonical Vietnamese public copy.
        sections: [
            { title: "Quan sát", paragraphs: ["Capability kỹ thuật không tự trả lời Outcome nào cần xảy ra, Boundary nào phải giữ và ai chịu Accountability cuối cùng."] }, // vn-ok: Canonical Vietnamese public copy.
            { title: "Luận điểm", paragraphs: ["Responsibility đặt Outcome, Accountability, Boundary, Permission, Evidence và Exception vào cùng một hợp đồng vận hành. Agent chỉ tham gia bên trong hợp đồng đó."] }, // vn-ok: Canonical Vietnamese public copy.
            { title: "Giới hạn", paragraphs: ["Mô hình không khẳng định mọi mức quan sát, đề xuất hay thực thi đều đang có sẵn trong NIVO OS."] }, // vn-ok: Canonical Vietnamese public copy.
        ],
        canonicalReference: { label: "System of Responsibility", href: "/system-of-responsibility" },
        primaryNextPath: { label: "Hiểu System of Responsibility", href: "/system-of-responsibility" }, // vn-ok: Canonical Vietnamese public copy.
        relatedSlugs: ["context-responsibility-outcome", "earned-autonomy-needs-evidence"],
    },
    {
        slug: "context-responsibility-outcome", contentType: "Framework",
        title: "Context · Responsibility · Outcome",
        thesis: "Một hệ vận hành AI-Native chỉ tạo giá trị bền vững khi bối cảnh được chuyển thành trách nhiệm rõ và trách nhiệm được kiểm chứng bằng Outcome.", // vn-ok: Canonical Vietnamese public copy.
        summary: "Framework ba lớp để cấu trúc một vấn đề vận hành trước automation.", // vn-ok: Canonical Vietnamese public copy.
        topics: ["AI-Native Business", "Responsibility & Outcome"], author: "NIVO", publisher: "NIVO", lifecycle: "Published",
        sourceVersion: "NIVO.VN V1.0 — Official Canonical Release",
        dateNote: "Nguồn chuẩn không cung cấp ngày xuất bản công khai.", // vn-ok: Canonical Vietnamese public copy.
        truthContext: "Framework chiến lược; không thay thế định nghĩa canonical của NIVO OS.", // vn-ok: Canonical Vietnamese public copy.
        sections: [
            { title: "Vấn đề", paragraphs: ["Dữ liệu và hành động có thể tăng mà doanh nghiệp vẫn không rõ điều gì cần xảy ra."] }, // vn-ok: Canonical Vietnamese public copy.
            { title: "Mô hình", paragraphs: ["Context mô tả thực tại; Responsibility đặt owner và boundary; Outcome tạo điểm kết thúc có thể kiểm chứng."] }, // vn-ok: Canonical Vietnamese public copy.
            { title: "Giới hạn", paragraphs: ["Framework không tự chứng minh Outcome và không cấp Permission."] }, // vn-ok: Canonical Vietnamese public copy.
        ],
        canonicalReference: { label: "NIVO OS", href: "/nivo-os" }, primaryNextPath: { label: "Tìm hiểu NIVO OS", href: "/nivo-os" }, // vn-ok: Canonical Vietnamese public copy.
        relatedSlugs: ["responsibility-before-agent", "earned-autonomy-needs-evidence"],
    },
    {
        slug: "earned-autonomy-needs-evidence", contentType: "NIVO đang xây", // vn-ok: Canonical Vietnamese public label.
        title: "Autonomy phải được kiếm bằng Evidence", // vn-ok: Canonical Vietnamese public copy.
        thesis: "Nhiều AI hơn không tạo ra nhiều quyền tự chủ hơn; Permission chỉ nên mở rộng sau khi Outcome được quan sát, kiểm chứng và tạo đủ Trust.", // vn-ok: Canonical Vietnamese public copy.
        summary: "Quan hệ giữa Evidence, Trust, Permission và operating capacity.", // vn-ok: Canonical Vietnamese public copy.
        topics: ["Trust, Governance & Autonomy", "Human + AI"], author: "NIVO", publisher: "NIVO", lifecycle: "Published",
        sourceVersion: "NIVO.VN V1.0 — Official Canonical Release",
        dateNote: "Nguồn chuẩn không cung cấp ngày xuất bản công khai.", // vn-ok: Canonical Vietnamese public copy.
        truthContext: "Định hướng governance; không phải tuyên bố full autonomy hiện tại.", // vn-ok: Canonical Vietnamese public copy.
        sections: [
            { title: "Điều đang được cấu trúc", paragraphs: ["Responsibility, Execution, Outcome, Evidence, Verification, Trust và Permission tạo thành một vòng lặp earned autonomy."] }, // vn-ok: Canonical Vietnamese public copy.
            { title: "Điều chưa được khẳng định", paragraphs: ["AI-Self-Sustaining Business là long-term destination, không phải capability hiện tại hay lời hứa kết quả."] }, // vn-ok: Canonical Vietnamese public copy.
            { title: "Điều còn mở", paragraphs: ["Permission phù hợp phụ thuộc rủi ro, Context, capability, Evidence và Human Accountability."] }, // vn-ok: Canonical Vietnamese public copy.
        ],
        canonicalReference: { label: "Trust", href: "/trust" }, primaryNextPath: { label: "Tìm hiểu Trust", href: "/trust" }, // vn-ok: Canonical Vietnamese public copy.
        relatedSlugs: ["responsibility-before-agent", "context-responsibility-outcome"],
    },
]

const Hero = (props: HeroProps) => (
    <section id={props.id} className={C.hero} data-visual={props.visual} aria-labelledby={`${props.id}-title`}>
        <PageContainer className={C.heroInner}>
            <div className={C.heroCopy}>
                <Text as="p" size="xs" tone="accent" weight="semibold">{props.eyebrow}</Text>
                <Heading level={1} scale="display"><span id={`${props.id}-title`}>{props.title}</span></Heading>
                <Text as="p" size="md" tone="muted">{props.description}</Text>
                <div className={C.actionRow}>
                    <Button href={props.primary.href} variant="primary" size="lg" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{props.primary.label}</Button>
                    {props.secondary === undefined ? null : <Button href={props.secondary.href} variant="secondary" size="lg" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{props.secondary.label}</Button>}
                </div>
            </div>
            <div className={C.heroModel} aria-label={props.modelLabel}>
                <div className={C.heroModelTop}><span className={C.heroModelPulse} aria-hidden="true" /><Text as="span" size="xs" weight="semibold">{props.modelLabel}</Text></div>
                <ol className={C.heroModelList}>
                    {props.modelSteps.map((step, index) => <li key={step}>
                        <span className={C.heroModelIndex}>{String(index + 1).padStart(2, "0")}</span>
                        <span className={C.heroModelIcon} aria-hidden="true"><NivoIcon props={{ name: index === props.modelSteps.length - 1 ? "complete" : index === 0 ? "search" : "code", usage: "heading" }} /></span>
                        <strong>{step}</strong>
                        {index < props.modelSteps.length - 1 ? <span className={C.heroModelNext} aria-hidden="true"><NivoIcon props={{ name: "next", usage: "chip" }} /></span> : null}
                    </li>)}
                </ol>
            </div>
        </PageContainer>
    </section>
)

const Section = (props: SectionProps) => {
    const inverse = props.tone === "dark" || props.tone === "burgundy"
    return <section id={props.id} className={SECTION_CLASS_NAMES[props.tone ?? "default"]} aria-labelledby={`${props.id}-title`}><PageContainer className={C.sectionInner}><SectionIntro id={`${props.id}-title`} eyebrow={props.eyebrow} title={props.title} description={props.description} inverse={inverse} />{props.children}</PageContainer></section>
}

const Flow = (props: FlowProps) => <ol className={C.flow} aria-label={props.label}>{props.steps.map((step, index) => <li key={step.title}><span className={C.flowIndex}>{String(index + 1).padStart(2, "0")}</span><span className={C.flowTitle}>{step.title}</span><span className={C.flowBody}>{step.description}</span></li>)}</ol>
const Notice = (props: NoticeProps) => <aside className={C.truthNotice}><strong>{props.title}</strong><Text as="p" size="sm" tone="muted">{props.children}</Text></aside>
const PathGrid = (props: PathGridProps) => <nav className={C.pathGrid} aria-label={props.label}>{props.paths.map((path, index) => <div className={C.card} key={path.href}><span className={C.pathIndex}>{String(index + 1).padStart(2, "0")}</span><TextAction href={path.href} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{path.label}</TextAction></div>)}</nav>

/** Canonical `/trust` page owner. */
export const TrustPage = () => {
    const contract = [["Outcome", "Điều gì phải xảy ra?"], ["Accountability", "Ai chịu trách nhiệm cuối cùng?"], ["Boundary", "Hệ thống hoạt động trong phạm vi nào?"], ["Permission", "AI được phép làm gì?"], ["Evidence", "Điều gì chứng minh Outcome?"], ["Exception", "Khi nào con người can thiệp?"]] as const // vn-ok: Canonical Vietnamese public copy.
    return <SiteMain><div className={C.page} data-page="trust">
        <Hero id="future-worth-earning" eyebrow="Trust" title={COPY.trust.heroTitle} description={COPY.trust.heroBody} primary={{ label: "Xem Trust được xây như thế nào", href: "#trust-starts-small" }} modelLabel="Trust starts with operating reality" modelSteps={["One real responsibility", "Verified outcome", "Trust"]} visual="trust" /> {/* vn-ok: Canonical Vietnamese public copy. */}
        <Section id="trust-starts-small" eyebrow="Start small" title={COPY.trust.startTitle} description={COPY.trust.startBody} tone="soft"><div className={C.contractGrid}>{contract.map(([term, body]) => <article className={C.card} key={term}><Text as="p" size="xs" tone="accent" weight="semibold">{term}</Text><Text as="p" size="sm">{body}</Text></article>)}</div><Flow label="Start-small model" steps={[{ title: "One real responsibility", description: "Một trách nhiệm thật và đủ rõ." }, { title: "Controlled execution", description: "Thực thi trong Boundary và Permission." }, { title: "Verified outcome", description: "Kết quả được kiểm chứng bằng Evidence." }]} /></Section> {/* vn-ok: Canonical Vietnamese public copy. */}
        <Section id="human-ai-governance" eyebrow="Human + AI governance" title={COPY.trust.governanceTitle} description={COPY.trust.governanceBody}><div className={C.sectionSplit}><blockquote className={C.quote}>Capability kỹ thuật không tự trở thành business permission.</blockquote><div className={C.contractGrid}>{["Minimum necessary context", "Controlled access", "Explicit permission", "Traceability", "Human oversight", "Recovery"].map((item) => <article className={C.card} key={item}><Heading level={3}>{item}</Heading></article>)}</div></div><Notice title="Security must be proven by control.">{COPY.trust.securityLimit}</Notice></Section> {/* vn-ok: Canonical Vietnamese public copy. */}
        <Section id="evidence-before-scale" eyebrow="Evidence before scale" title={COPY.trust.evidenceTitle} description={COPY.trust.evidenceBody} tone="burgundy"><Flow label="Earned Trust Loop" steps={["Responsibility", "Execution", "Outcome observed", "Evidence", "Verification", "Verified outcome", "Trust", "Permission", "More responsibility"].map((title) => ({ title, description: "Mỗi bước có owner, state và giới hạn rõ." }))} /><div className={C.signaturePanel}><span className={C.signatureIcon} aria-hidden="true"><NivoIcon props={{ name: "complete", usage: "heading" }} /></span><strong>Autonomy must be earned.</strong><div className={C.inlineSequence} aria-label="Verified Outcomes, Evidence, Trust, More Permission">{["Verified Outcomes", "Evidence", "Trust", "More Permission"].map((item, index) => <span key={item}>{item}{index < 3 ? <NivoIcon props={{ name: "next", usage: "chip" }} /> : null}</span>)}</div></div></Section> {/* vn-ok: Canonical Vietnamese public copy. */}
        <Section id="transformation-journey" eyebrow="The transformation journey" title={COPY.trust.journeyTitle} description="Maturity direction; không phải lộ trình bắt buộc hoặc cam kết capability hiện tại."><Flow label="Transformation journey" steps={["Human-dependent operations", "Systemized context & responsibility", "Governed Human + AI", "Reliable business loops", "AI-Native Business"].map((title) => ({ title, description: "Operating capacity chỉ mở rộng khi Evidence và governance cho phép." }))} /></Section> {/* vn-ok: Canonical Vietnamese public copy. */}
        <Section id="what-becomes-possible" eyebrow="Customer value horizon" title={COPY.trust.possibleTitle} description="Các horizon có điều kiện, không phải outcome được NIVO bảo đảm." tone="soft"><div className={C.valueGrid}>{[["Near-term · Evidence-gated", "Vận hành rõ hơn"], ["Needs user validation", "An tâm và chủ động hơn"], ["Long-term possibility", "Thêm thời gian cho điều quan trọng"], ["Conditional possibility", "Có điều kiện tạo giá trị lớn hơn"]].map(([state, title]) => <article className={C.card} key={title}><Badge tone="neutral">{state}</Badge><Heading level={3}>{title}</Heading></article>)}</div><Notice title="AI-Self-Sustaining Business · Long-term destination">Không phải doanh nghiệp không cần con người, current capability hoặc guarantee.</Notice></Section> {/* vn-ok: Canonical Vietnamese public copy. */}
        <Section id="truth-before-promise" eyebrow="Truth before promise" title={COPY.trust.truthTitle} description="Current, Verified, Experimental, Target và Long-term phải được gọi bằng tên." tone="dark"><div className={C.definitionGrid}>{[["Current", "Điều đang đúng hiện tại."], ["Verified", "Điều có Evidence phù hợp."], ["Experimental", "Điều đang được thử trong Context giới hạn."], ["Target", "Capability NIVO đang hướng tới."], ["Long-term", "Hướng trưởng thành dài hạn."]].map(([term, meaning]) => <article className={C.card} key={term}><Heading level={3}>{term}</Heading><Text as="p" size="sm">{meaning}</Text></article>)}</div><PathGrid label="Trust next paths" paths={[{ label: "Tìm hiểu NIVO OS", href: "/nivo-os" }, { label: "Trao đổi về Trust & Security", href: "/contact?intent=product" }, { label: "Hiểu System of Responsibility", href: "/system-of-responsibility" }]} /></Section> {/* vn-ok: Canonical Vietnamese public copy. */}
    </div></SiteMain>
}

const ACTORS = [
    { name: "Customers", role: "Reality source / Operating partner", contribution: "Real Context + Responsibility + Execution Reality + Evidence", value: "Operating Capability + Visibility + Learning", outcome: "Grounded operating patterns", status: "Current actor model · Relationships: Verify", action: { label: "Khám phá Giải pháp", href: "/applications" }, future: false }, // vn-ok: Canonical Vietnamese public copy.
    { name: "Partners & Experts", role: "Capability extension", contribution: "Domain Expertise + Implementation Capacity + Market Context", value: "Reusable capability + new value-delivery paths", outcome: "Repeatable application patterns", status: "Current actor model · Relationships: Verify", action: { label: "Trao đổi về Hợp tác", href: "/contact?intent=partnership" }, future: false }, // vn-ok: Canonical Vietnamese public copy.
    { name: "Institutions", role: "Responsible adoption at ecosystem scale", contribution: "Program + Ecosystem + Institutional Context", value: "Responsible adoption capability", outcome: "Broader AI-Native capability", status: "Current actor model · Programs: Verify", action: { label: "Trao đổi về Hợp tác Tổ chức", href: "/contact?intent=institution" }, future: false }, // vn-ok: Canonical Vietnamese public copy.
    { name: "Future Builders", role: "Future extensibility", contribution: "Future extensions + integrations", value: "Potential future participation", outcome: "Expanded operating capacity", status: "Future · Không phải developer program hoặc marketplace hiện tại", action: { label: "Tìm hiểu NIVO OS", href: "/nivo-os" }, future: true }, // vn-ok: Canonical Vietnamese public copy.
] as const

/** Canonical `/ecosystem` page owner with exactly four actor groups. */
export const EcosystemPage = () => {
    return <SiteMain><div className={C.page} data-page="ecosystem">
        <Hero id="why-ecosystem" eyebrow="Hệ sinh thái NIVO" title={COPY.ecosystem.heroTitle} description={COPY.ecosystem.heroBody} primary={{ label: "Hiểu cách giá trị được tạo ra", href: "#value-exchange" }} secondary={{ label: "Tìm hiểu NIVO OS", href: "/nivo-os" }} modelLabel="Shared operating capacity" modelSteps={["Contribution", "Scoped collaboration", "Evidence", "Reusable capacity"]} visual="ecosystem" /> {/* vn-ok: Canonical Vietnamese public copy. */}
        <Section id="value-exchange" eyebrow="Value model" title={COPY.ecosystem.valueTitle} description="Strategic operating thesis; không phải proof của current network effect." tone="burgundy"><Flow label="Shared Operating Capacity" steps={["Real business context", "Domain expertise", "Implementation capacity", "Institutional context", "Scoped collaboration", "Evidence", "Reusable operating capacity"].map((title) => ({ title, description: "Contribution được kết nối, kiểm chứng và tái sử dụng đúng bối cảnh." }))} /><Notice title="Future extensibility">Future option; không phải developer program, marketplace hoặc open platform hiện tại.</Notice></Section> {/* vn-ok: Canonical Vietnamese public copy. */}
        <Section id="actors" eyebrow="Who participates" title={COPY.ecosystem.actorsTitle} description="Contribution, value received và shared outcome là ba lớp khác nhau."><div className={C.actorGrid} role="list" aria-label="Bốn actor của hệ sinh thái NIVO">{ACTORS.map((actor, index) => <article className={C.actor} data-future={actor.future ? "true" : undefined} role="listitem" key={actor.name}><span className={C.actorIndex}>{String(index + 1).padStart(2, "0")}</span><Badge tone={actor.future ? "accent" : "neutral"}>{actor.future ? "Future" : "Actor model · Current"}</Badge><Heading level={3}>{actor.name}</Heading><Text as="p" size="sm" weight="semibold">{actor.role}</Text><dl><div><dt>Contribution</dt><dd>{actor.contribution}</dd></div><div><dt>Value received</dt><dd>{actor.value}</dd></div><div><dt>Potential shared outcome</dt><dd>{actor.outcome}</dd></div><div><dt>Truth status</dt><dd>{actor.status}</dd></div></dl><TextAction href={actor.action.href} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{actor.action.label}</TextAction></article>)}</div></Section> {/* vn-ok: Canonical Vietnamese public copy. */}
        <Section id="relationship-growth" eyebrow="Trust + participation" title={COPY.ecosystem.growthTitle} description="Relationship depth không đến từ logo hoặc quyền truy cập mặc định." tone="soft"><Flow label="Relationship development" steps={["Interest", "Fit", "Context", "Scoped collaboration", "Evidence", "Deeper relationship"].map((title) => ({ title, description: "Start small. Verify value. Deepen the relationship." }))} /><TextAction href={SITE_LINKS.trust} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>Tìm hiểu Trust</TextAction></Section> {/* vn-ok: Canonical Vietnamese public copy. */}
        <Section id="ecosystem-proof" eyebrow="Ecosystem in practice" title={COPY.ecosystem.proofTitle}><Notice title="No public proof inventory">Không logo, badge, customer count hoặc relationship claim nào được suy diễn từ dữ liệu chưa xác minh.</Notice></Section> {/* vn-ok: Canonical Vietnamese public copy. */}
        <Section id="choose-path" eyebrow="Progression" title={COPY.ecosystem.pathTitle} description="Ecosystem giải thích; Contact định tuyến." tone="dark"><PathGrid label="Actor-specific routes" paths={ACTORS.map(({ name, action }) => ({ label: `${name} · ${action.label}`, href: action.href }))} /></Section> {/* vn-ok: Canonical Vietnamese public copy. */}
    </div></SiteMain>
}

/** Props for the Ideas discovery page owner. */
export type IdeasPageProps = { readonly selectedType?: IdeaContentType | null }
/** Canonical `/ideas` knowledge discovery owner. */
export const IdeasPage = (props: IdeasPageProps) => {
    const visible = props.selectedType === null || props.selectedType === undefined ? IDEA_ARTICLES : IDEA_ARTICLES.filter(({ contentType }) => contentType === props.selectedType)
    const [featured, ...supporting] = visible
    return <SiteMain><div className={C.page} data-page="ideas">
        <Hero id="knowledge-identity" eyebrow="NIVO Ideas" title={COPY.ideas.heroTitle} description={COPY.ideas.heroBody} primary={{ label: "Khám phá Ideas", href: "#featured" }} secondary={{ label: "Tìm hiểu NIVO OS", href: "/nivo-os" }} modelLabel="Knowledge progression" modelSteps={["Discover", "Understand", "Connect"]} visual="ideas" /> {/* vn-ok: Canonical Vietnamese public copy. */}
        <Section id="featured" eyebrow="Featured knowledge" title={COPY.ideas.featuredTitle} description="Editorial curation; không phải latest hoặc most clicked." tone="soft">{featured === undefined ? <Notice title="No approved object">Không tạo filler để lấp layout.</Notice> : <div className={C.ideaGrid}><article className={C.ideaCardFeatured}><span className={C.editorialMark}>NIVO / 01</span><Badge tone="accent">{featured.contentType}</Badge><Heading level={3}>{featured.title}</Heading><Text as="p" size="md">{featured.thesis}</Text><TextAction href={`/ideas/${featured.slug}`} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>Đọc Idea</TextAction></article>{supporting.map((idea, index) => <article className={C.ideaCard} key={idea.slug}><span className={C.editorialMark}>0{index + 2}</span><Badge tone="neutral">{idea.contentType}</Badge><Heading level={3}>{idea.title}</Heading><Text as="p" size="sm">{idea.thesis}</Text><TextAction href={`/ideas/${idea.slug}`} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>Đọc Idea</TextAction></article>)}</div>}</Section> {/* vn-ok: Canonical Vietnamese public copy. */}
        <Section id="by-type" eyebrow="Explore by type" title={COPY.ideas.typeTitle} description="Content type không thay đổi truth state hoặc lifecycle."><nav className={C.typeGrid} aria-label="Ideas content types">{[["Góc nhìn", "goc-nhin", "Interpret"], ["Framework", "framework", "Structure"], ["NIVO đang xây", "nivo-dang-xay", "Learn by doing"]].map(([label, query, role], index) => <article className={C.card} key={query}><span className={C.pathIndex}>0{index + 1}</span><Text as="p" size="xs" tone="accent">{role}</Text><Heading level={3}>{label}</Heading><TextAction href={`/ideas?type=${query}#featured`} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>Khám phá</TextAction></article>)}</nav></Section> {/* vn-ok: Canonical Vietnamese public copy. */}
        <Section id="curated" eyebrow="Curated knowledge" title={COPY.ideas.curatedTitle} description="Editorial collection; không phải taxonomy hoặc page mới." tone="burgundy"><PathGrid label="Curated Ideas" paths={IDEA_ARTICLES.map((idea) => ({ label: idea.title, href: `/ideas/${idea.slug}` }))} /></Section> {/* vn-ok: Canonical Vietnamese public copy. */}
        <Section id="by-topic" eyebrow="Explore by topic" title={COPY.ideas.topicTitle} description="Topic là metadata thứ cấp."><ul className={C.topicList}>{["AI-Native Business", "Leadership & Operating Model", "Responsibility & Outcome", "Human + AI", "Trust, Governance & Autonomy", "Growth & Revenue", "Knowledge & Decision"].map((topic) => <li key={topic}><span>{topic}</span></li>)}</ul></Section>
        <Section id="continue-learning" eyebrow="Continue learning" title={COPY.ideas.continueTitle} description="Idea diễn giải; canonical page định nghĩa." tone="dark"><PathGrid label="Ideas next paths" paths={[{ label: "NIVO OS", href: "/nivo-os" }, { label: "System of Responsibility", href: "/system-of-responsibility" }, { label: "Giải pháp", href: "/applications" }, { label: "Trust", href: "/trust" }, { label: "Về NIVO", href: "/company" }]} /></Section> {/* vn-ok: Canonical Vietnamese public copy. */}
    </div></SiteMain>
}

/** Props for one canonical Idea detail page owner. */
export type IdeaDetailPageProps = { readonly idea: IdeaArticle }
/** Article owner keeping direct thesis, authority, truth and continuation explicit. */
export const IdeaDetailPage = (props: IdeaDetailPageProps) => {
    const related = props.idea.relatedSlugs.map((slug) => IDEA_ARTICLES.find((item) => item.slug === slug)).filter((item): item is IdeaArticle => item !== undefined).slice(0, 3)
    return <SiteMain><article className={C.page} data-page="idea-detail"><header className={C.articleHero}><PageContainer><div className={C.articleHeader}><Badge tone="accent">{props.idea.contentType}</Badge><Heading level={1} scale="display">{props.idea.title}</Heading><p className={C.articleThesis}>{props.idea.thesis}</p><dl className={C.articleMeta}><div><dt>Author</dt><dd>{props.idea.author}</dd></div><div><dt>Publisher</dt><dd>{props.idea.publisher}</dd></div><div><dt>Lifecycle</dt><dd>{props.idea.lifecycle}</dd></div><div><dt>Source</dt><dd>{props.idea.sourceVersion}</dd></div></dl><Text as="p" size="sm" tone="muted">{props.idea.dateNote}</Text></div></PageContainer></header><Section id="idea-body" eyebrow="Knowledge object" title="Reasoning"><div className={C.articleBody}>{props.idea.sections.map((section, index) => <section className={C.articleSection} aria-labelledby={`idea-section-${index}`} key={section.title}><span className={C.articleSectionIndex}>{String(index + 1).padStart(2, "0")}</span><Heading level={2}><span id={`idea-section-${index}`}>{section.title}</span></Heading>{section.paragraphs.map((paragraph) => <Text as="p" size="md" key={paragraph}>{paragraph}</Text>)}</section>)}</div></Section><Section id="idea-truth-context" eyebrow="Truth / evidence context" title="Claim and limitation" tone="soft"><Notice title="Truth context">{props.idea.truthContext}</Notice><div className={C.card}><Text as="p" size="xs" tone="accent">Canonical reference</Text><TextAction href={props.idea.canonicalReference.href} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{props.idea.canonicalReference.label}</TextAction></div></Section><Section id="idea-next-path" eyebrow="Primary next path" title="Continue" tone="burgundy"><PathGrid label="One primary next path" paths={[props.idea.primaryNextPath]} /><nav className={C.ideaGrid} aria-label="Related Ideas">{related.map((idea) => <article className={C.ideaCard} key={idea.slug}><Badge tone="neutral">{idea.contentType}</Badge><Heading level={3}>{idea.title}</Heading><TextAction href={`/ideas/${idea.slug}`} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>Read</TextAction></article>)}</nav></Section></article></SiteMain>
}

/** Returns a public Idea by its stable route slug. */
export const getIdeaBySlug = (slug: string) => IDEA_ARTICLES.find((idea) => idea.slug === slug)

/** Static route identities for the approved public Idea objects. */
export const IDEA_SLUGS = IDEA_ARTICLES.map(({ slug }) => ({ slug }))

/** Resolves a public Ideas query without changing truth state or lifecycle. */
export const normalizeIdeaType = (value: string | ReadonlyArray<string> | undefined): IdeaContentType | null => {
    const candidate = Array.isArray(value) ? value[0] : value
    if (candidate === "goc-nhin") return "Góc nhìn" // vn-ok: Canonical Vietnamese public label.
    if (candidate === "framework") return "Framework"
    if (candidate === "nivo-dang-xay") return "NIVO đang xây" // vn-ok: Canonical Vietnamese public label.
    return null
}

/** Accepts only the six public Contact query values. */
export const normalizeContactIntent = (value: string | ReadonlyArray<string> | undefined): ContactIntentId | null => {
    const candidate = Array.isArray(value) ? value[0] : value
    return CONTACT_INTENT_IDS.find((id) => id === candidate) ?? null
}
