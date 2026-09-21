import type { Metadata } from "next"
import { NivoIcon } from "@nivo/ui"
import { Badge, Button, Heading, PageContainer, Text, TextAction } from "@starci/grammar/common"
import { SiteMain } from "@/components/site"
import styles from "../commercial-corporate.module.css"

/** Search and sharing metadata for the canonical Company route. */
export const metadata: Metadata = {
    title: "Company",
    description: "NIVO là ai, vì sao tồn tại, đang hướng tới đâu và vận hành theo Human Leads. AI Operates. System Learns.", // vn-ok: Canonical Vietnamese public copy.
    alternates: { canonical: "/company" },
}

/** The `/company` framework adapter. */
const VALUES = [
    { index: "01", name: "Kết quả thật", meaning: "Không nhầm lẫn activity với business outcome.", implication: "Outcome over Activity" }, // vn-ok: Canonical Vietnamese public copy.
    { index: "02", name: "Đơn giản hóa", meaning: "Giảm operating complexity mà không che mất sự thật.", implication: "Remove before adding" }, // vn-ok: Canonical Vietnamese public copy.
    { index: "03", name: "Kỷ luật & minh bạch dữ liệu", meaning: "State, assumption và Evidence phải được phân biệt.", implication: "Truth before appearance" }, // vn-ok: Canonical Vietnamese public copy.
    { index: "04", name: "AI nâng đỡ con người", meaning: "AI tăng capacity, không xóa accountability.", implication: "Human accountability remains" }, // vn-ok: Canonical Vietnamese public copy.
    { index: "05", name: "Tiến hóa cùng đội ngũ & hệ sinh thái", meaning: "Learning mạnh hơn khi có thể tái sử dụng.", implication: "Learn / Reuse / Improve" }, // vn-ok: Canonical Vietnamese public copy.
] as const

const TODAY = [
    ["Today", "Organization, master product, category và strategic center."], // vn-ok: Canonical Vietnamese public copy.
    ["Building / Verifying", "Capability đang được xây hoặc kiểm chứng."], // vn-ok: Canonical Vietnamese public copy.
    ["Building toward", "Strategic target direction."],
    ["Not yet claimed", "Không claim full autonomy, universal fit hoặc category leadership."], // vn-ok: Canonical Vietnamese public copy.
] as const

const PHILOSOPHY = [
    { icon: "account", title: "Human Leads", body: "Purpose, judgment và accountability." }, // vn-ok: Canonical Vietnamese public copy.
    { icon: "agentos", title: "AI Operates", body: "Observe, recommend hoặc execute trong Boundary và Permission." }, // vn-ok: Canonical Vietnamese public copy.
    { icon: "complete", title: "System Learns", body: "Context, Evidence, exceptions và corrections cải thiện operation." }, // vn-ok: Canonical Vietnamese public copy.
] as const

const ArrowIcon = () => <NivoIcon props={{ name: "next", usage: "chip" }} />

const CompanyRoute = () => (
    <div className={`${styles.routeFrame} ${styles.companyRoute}`}>
        <SiteMain>
            <article className={styles.companyPage}>
                <section id="nivo-is" className={styles.companyHero} aria-labelledby="company-title">
                    <PageContainer className={styles.heroGrid}>
                        <div className={styles.heroCopy}>
                            <span className={styles.eyebrow}>NIVO · AI-NATIVE BUSINESS</span>
                            <Heading level={1} scale="display">
                                <span id="company-title">NIVO xây năng lực vận hành cho thế hệ doanh nghiệp <em>AI-Native.</em></span> {/* vn-ok: Canonical Vietnamese public copy. */}
                            </Heading>
                            <Text as="p" size="md" tone="muted">NIVO là AI-Native Business Operating Platform giúp Nhà lãnh đạo chuyển những việc vận hành quan trọng từ phụ thuộc vào trí nhớ và sự theo sát thủ công thành trách nhiệm rõ, vận hành có kiểm soát và kết quả được kiểm chứng.</Text> {/* vn-ok: Canonical Vietnamese public copy. */}
                            <div className={styles.actionRow}>
                                <Button href="/nivo-os" variant="primary" size="lg" endContent={<ArrowIcon />}>Tìm hiểu NIVO OS</Button> {/* vn-ok: Canonical Vietnamese public label. */}
                                <Button href="/ecosystem" variant="secondary" size="lg" endContent={<ArrowIcon />}>Khám phá Hệ sinh thái</Button> {/* vn-ok: Canonical Vietnamese public label. */}
                            </div>
                        </div>
                        <div className={styles.companyVisual} aria-label="Organization, product and strategic center">
                            <span className={styles.visualOrbit} aria-hidden="true" />
                            <div className={styles.visualCore}>
                                <span>NIVO</span>
                                <strong>Strategic center</strong>
                            </div>
                            <div className={`${styles.orbitCard} ${styles.orbitCardOne}`}>
                                <span>01</span><strong>Organization</strong>
                            </div>
                            <div className={`${styles.orbitCard} ${styles.orbitCardTwo}`}>
                                <span>02</span><strong>NIVO OS</strong>
                            </div>
                            <div className={`${styles.orbitCard} ${styles.orbitCardThree}`}>
                                <span>03</span><strong>Responsibility</strong>
                            </div>
                        </div>
                    </PageContainer>
                </section>

                <section id="nivo-today" className={styles.todaySection} aria-labelledby="company-today-title">
                    <PageContainer>
                        <div className={styles.sectionHeading}>
                            <span className={styles.eyebrow}>NIVO TODAY</span>
                            <Heading level={2}><span id="company-today-title">Đang xây. Đang kiểm chứng. Chỉ mở rộng khi có Evidence.</span></Heading> {/* vn-ok: Canonical Vietnamese public copy. */}
                            <Text as="p" size="md" tone="muted">Current identity đi trước history.</Text> {/* vn-ok: Canonical Vietnamese public copy. */}
                        </div>
                        <div className={styles.todayGrid}>
                            {TODAY.map(([title, body], index) => (
                                <article className={styles.todayCard} key={title}>
                                    <span className={styles.cardIndex}>{String(index + 1).padStart(2, "0")}</span>
                                    <Heading level={3}>{title}</Heading>
                                    <Text as="p" size="sm" tone="muted">{body}</Text>
                                </article>
                            ))}
                        </div>
                    </PageContainer>
                </section>

                <section id="provenance" className={styles.provenanceSection} aria-labelledby="company-provenance-title">
                    <PageContainer>
                        <div className={styles.sectionHeading}>
                            <span className={styles.eyebrow}>HOW NIVO GOT HERE</span>
                            <Heading level={2}><span id="company-provenance-title">Năng lực được tích lũy qua từng lớp vận hành.</span></Heading> {/* vn-ok: Canonical Vietnamese public copy. */}
                            <Text as="p" size="md" tone="muted">Hành trình giải thích sự tiến hóa của capability; lịch sử không được dùng thay cho bằng chứng hiện tại.</Text> {/* vn-ok: Canonical Vietnamese public copy. */}
                        </div>
                        <ol className={styles.provenanceLine} aria-label="NIVO capability evolution">
                            {[
                                ["01", "Digital delivery", "Biến nhu cầu thành sản phẩm có thể vận hành."], // vn-ok: Canonical Vietnamese public copy.
                                ["02", "System building", "Chuẩn hóa context, workflow và trách nhiệm."], // vn-ok: Canonical Vietnamese public copy.
                                ["03", "AI-Native operations", "Đưa AI vào giới hạn, permission và evidence."], // vn-ok: Canonical Vietnamese public copy.
                                ["04", "NIVO today", "Master product và strategic center đang được kiểm chứng."], // vn-ok: Canonical Vietnamese public copy.
                            ].map(([index, title, body]) => (
                                <li key={index}>
                                    <span>{index}</span>
                                    <div><strong>{title}</strong><small>{body}</small></div>
                                </li>
                            ))}
                        </ol>
                    </PageContainer>
                </section>

                <section id="mission" className={styles.statementSection} aria-labelledby="company-mission-title">
                    <PageContainer className={styles.statementGrid}>
                        <div className={styles.statementLead}>
                            <span className={styles.eyebrow}>SỨ MỆNH</span> {/* vn-ok: Canonical Vietnamese public label. */}
                            <Heading level={2}><span id="company-mission-title">Vì sao NIVO tồn tại?</span></Heading> {/* vn-ok: Canonical Vietnamese public copy. */}
                            <div className={styles.sequence} aria-label="Context, Responsibility, Real Outcome, Scalable Capacity">
                                {["Context", "Responsibility", "Real Outcome", "Scalable Capacity"].map((item, index) => (
                                    <span key={item}><strong>{item}</strong>{index < 3 ? <ArrowIcon /> : null}</span>
                                ))}
                            </div>
                        </div>
                        <blockquote className={styles.missionQuote}>Giúp thế hệ <strong>LÃNH ĐẠO Việt Nam</strong> có thêm thời gian cho tầm nhìn, con người và quyết định tạo tương lai — bằng NIVO OS, nơi bối cảnh kinh doanh được chuyển thành trách nhiệm rõ, kết quả thật và năng lực vận hành có thể mở rộng.</blockquote> {/* vn-ok: Canonical Vietnamese public copy. */}
                    </PageContainer>
                </section>

                <section id="vision" className={styles.visionSection} aria-labelledby="company-vision-title">
                    <PageContainer className={styles.visionGrid}>
                        <div className={styles.sectionHeading}>
                            <span className={styles.eyebrow}>TẦM NHÌN</span> {/* vn-ok: Canonical Vietnamese public label. */}
                            <Heading level={2}><span id="company-vision-title">NIVO đang hướng tới tương lai nào?</span></Heading> {/* vn-ok: Canonical Vietnamese public copy. */}
                            <Text as="p" size="md">NIVO hướng tới trở thành nền tảng vận hành kinh doanh AI-Native tiên phong tại Việt Nam — nơi con người dẫn dắt, AI vận hành trong giới hạn rõ và hệ thống học từ kết quả.</Text> {/* vn-ok: Canonical Vietnamese public copy. */}
                        </div>
                        <ol className={styles.visionSteps}>
                            <li><span>01</span><div><strong>AI-Native Business</strong><small>Responsibility-centered operating capacity.</small></div></li>
                            <li><span>02</span><div><strong>More governed autonomy</strong><small>Permission tăng dựa trên Evidence.</small></div></li> {/* vn-ok: Canonical Vietnamese public copy. */}
                            <li><span>03</span><div><strong>AI-Self-Sustaining Business</strong><small>Long-term destination; không phải current capability.</small></div></li> {/* vn-ok: Canonical Vietnamese public copy. */}
                        </ol>
                    </PageContainer>
                </section>

                <section id="philosophy" className={styles.philosophySection} aria-labelledby="company-philosophy-title">
                    <PageContainer>
                        <div className={styles.sectionHeadingInverse}>
                            <span className={styles.eyebrow}>HOW NIVO OPERATES</span>
                            <Heading level={2}><span id="company-philosophy-title">Con người dẫn dắt. AI vận hành. Hệ thống học hỏi.</span></Heading> {/* vn-ok: Canonical Vietnamese public copy. */}
                            <Text as="p" size="md">Human Leads. AI Operates. System Learns.</Text>
                        </div>
                        <div className={styles.philosophyGrid}>
                            {PHILOSOPHY.map((item, index) => (
                                <article key={item.title}>
                                    <span className={styles.philosophyIcon}><NivoIcon props={{ name: item.icon, usage: "heading" }} /></span>
                                    <span className={styles.cardIndex}>{String(index + 1).padStart(2, "0")}</span>
                                    <Heading level={3}>{item.title}</Heading>
                                    <Text as="p" size="sm">{item.body}</Text>
                                </article>
                            ))}
                        </div>
                    </PageContainer>
                </section>

                <section id="values" className={styles.valuesSection} aria-labelledby="company-values-title">
                    <PageContainer>
                        <div className={styles.sectionHeading}>
                            <span className={styles.eyebrow}>WHAT NIVO VALUES</span>
                            <Heading level={2}><span id="company-values-title">Giá trị phải đi cùng hành vi và hàm ý quyết định.</span></Heading> {/* vn-ok: Canonical Vietnamese public copy. */}
                            <Text as="p" size="md" tone="muted">Value không chỉ là icon hoặc câu truyền cảm hứng.</Text> {/* vn-ok: Canonical Vietnamese public copy. */}
                        </div>
                        <div className={styles.valuesGrid}>
                            {VALUES.map((value) => (
                                <article key={value.name}>
                                    <span className={styles.cardIndex}>{value.index}</span>
                                    <Heading level={3}>{value.name}</Heading>
                                    <Text as="p" size="sm" tone="muted">{value.meaning}</Text>
                                    <Badge tone="neutral">{value.implication}</Badge>
                                </article>
                            ))}
                        </div>
                    </PageContainer>
                </section>

                <section id="leadership" className={styles.truthSection} aria-labelledby="company-truth-title">
                    <PageContainer className={styles.truthGrid}>
                        <div>
                            <span className={styles.eyebrow}>LEADERSHIP · TRUTH BOUNDARY</span>
                            <Heading level={2}><span id="company-truth-title">Leadership = Responsibility before prestige.</span></Heading>
                        </div>
                        <div className={styles.truthNotice}>
                            <Badge tone="warning">Roster not published</Badge>
                            <Text as="p" size="sm">Names, public roles và responsibility areas phải được xác minh trước release. Trang không suy diễn title, bio, photo hoặc profile link.</Text> {/* vn-ok: Canonical Vietnamese public copy. */}
                        </div>
                    </PageContainer>
                </section>

                <section id="company-next-path" className={styles.companyCta} aria-labelledby="company-next-title">
                    <PageContainer className={styles.ctaGrid}>
                        <div><span className={styles.eyebrow}>CONTINUE</span><Heading level={2}><span id="company-next-title">Tôi hiểu NIVO rồi. Tôi nên đi đâu tiếp?</span></Heading></div> {/* vn-ok: Canonical Vietnamese public copy. */}
                        <nav className={styles.ctaLinks} aria-label="Company next paths">
                            {[["Tìm hiểu NIVO OS", "/nivo-os"], ["Khám phá Hệ sinh thái", "/ecosystem"], ["Liên hệ", "/contact"], ["Tìm hiểu Trust", "/trust"]].map(([label, href]) => ( // vn-ok: Canonical Vietnamese public labels.
                                <TextAction href={href} appearance="route" endContent={<ArrowIcon />} key={href}>{label}</TextAction>
                            ))}
                        </nav>
                    </PageContainer>
                </section>
            </article>
        </SiteMain>
    </div>
)

export default CompanyRoute
