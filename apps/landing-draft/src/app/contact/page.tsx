import type { Metadata } from "next"
import { NivoIcon } from "@nivo/ui"
import { Badge, Button, Heading, PageContainer, Text, TextAction } from "@starci/grammar/common"
import { normalizeContactIntent, type ContactIntentId } from "@/components/pages/explore"
import { SiteMain } from "@/components/site"
import styles from "../commercial-corporate.module.css"

/** Search and sharing metadata for the canonical Contact route. */
export const metadata: Metadata = {
    title: "Liên hệ NIVO", // vn-ok: Canonical Vietnamese public label.
    description: "Chọn đúng relationship intent và đi thẳng tới canonical answer trước khi cung cấp dữ liệu không cần thiết.", // vn-ok: Canonical Vietnamese public copy.
    alternates: { canonical: "/contact" },
}

type ContactRouteProps = {
    readonly searchParams: Promise<{ readonly intent?: string | readonly string[] }>
}

type ContactIntent = {
    readonly id: ContactIntentId
    readonly label: string
    readonly userJob: string
    readonly expectation: string
    readonly directPaths: readonly { readonly label: string; readonly href: string }[]
}

const CONTACT_INTENTS: readonly ContactIntent[] = [
    { id: "product", label: "Product Assistance", userJob: "Tìm hiểu, đánh giá hoặc cần hỗ trợ liên quan đến NIVO OS.", expectation: "Ưu tiên đường tự phục vụ trước một trao đổi trực tiếp.", directPaths: [{ label: "Tìm hiểu NIVO OS", href: "/nivo-os" }, { label: "Khám phá Giải pháp", href: "/applications" }, { label: "Xem Mức giá", href: "/pricing" }] }, // vn-ok: Canonical Vietnamese public copy.
    { id: "partnership", label: "Partnership", userJob: "Cùng NIVO mở rộng expertise, implementation hoặc market capability.", expectation: "Hiểu hệ sinh thái trước; kênh tiếp nhận đang chờ xác minh.", directPaths: [{ label: "Khám phá Hệ sinh thái", href: "/ecosystem" }] }, // vn-ok: Canonical Vietnamese public copy.
    { id: "institution", label: "Institution", userJob: "Trao đổi về chương trình, tổ chức hoặc ecosystem collaboration.", expectation: "Kênh tiếp nhận đang chờ owner và privacy path được xác minh.", directPaths: [{ label: "Tìm hiểu Trust", href: "/trust" }] }, // vn-ok: Canonical Vietnamese public copy.
    { id: "media", label: "Media", userJob: "Báo chí, nội dung và truyền thông.", expectation: "Chưa có kênh truyền thông được xác minh để công bố.", directPaths: [{ label: "Về NIVO", href: "/company" }] }, // vn-ok: Canonical Vietnamese public copy.
    { id: "talent", label: "Talent", userJob: "Quan tâm đến việc làm việc hoặc đóng góp cùng NIVO.", expectation: "Không ngụ ý có vị trí tuyển dụng hiện tại.", directPaths: [{ label: "Về NIVO", href: "/company" }] }, // vn-ok: Canonical Vietnamese public copy.
    { id: "general", label: "General", userJob: "Một yêu cầu khác chưa phù hợp với các nhóm trên.", expectation: "Fallback only; chưa có kênh chung được xác minh.", directPaths: [{ label: "Khám phá NIVO.VN", href: "/" }] }, // vn-ok: Canonical Vietnamese public copy.
] as const

const DIRECT_PATHS = [
    ["Tìm hiểu NIVO OS", "/nivo-os"], ["Khám phá Giải pháp", "/applications"], // vn-ok: Canonical Vietnamese public labels.
    ["Xem Mức giá", "/pricing"], ["Khám phá Hệ sinh thái", "/ecosystem"], // vn-ok: Canonical Vietnamese public labels.
    ["Tìm hiểu Trust", "/trust"], ["Về NIVO", "/company"], ["Đăng nhập", "https://app.nivo.vn"], // vn-ok: Canonical Vietnamese public labels.
] as const

const ArrowIcon = () => <NivoIcon props={{ name: "next", usage: "chip" }} />

/** The `/contact` adapter validates query state before the relationship router sees it. */
const ContactRoute = async ({ searchParams }: ContactRouteProps) => {
    const query = await searchParams
    const initialIntent = normalizeContactIntent(query.intent)
    const selected = CONTACT_INTENTS.find(({ id }) => id === initialIntent)

    return (
        <div className={`${styles.routeFrame} ${styles.contactRoute}`}>
            <SiteMain>
                <div className={styles.contactPage}>
                    <section id="choose-intent" className={styles.contactHero} aria-labelledby="contact-title">
                        <PageContainer className={styles.contactHeroGrid}>
                            <div className={styles.heroCopy}>
                                <span className={styles.eyebrow}>LIÊN HỆ NIVO · RELATIONSHIP ROUTER</span> {/* vn-ok: Canonical Vietnamese public label. */}
                                <Heading level={1} scale="display"><span id="contact-title">Bạn muốn trao đổi với NIVO về điều gì?</span></Heading> {/* vn-ok: Canonical Vietnamese public copy. */}
                                <Text as="p" size="md" tone="muted">Chọn mục phù hợp nhất. Nếu nhu cầu có thể được giải quyết trực tiếp trên NIVO.VN, trang sẽ đưa bạn tới đúng nơi thay vì yêu cầu điền form không cần thiết.</Text> {/* vn-ok: Canonical Vietnamese public copy. */}
                                <Button href="#intent-router" variant="primary" size="lg" endContent={<ArrowIcon />}>Chọn mục phù hợp</Button> {/* vn-ok: Canonical Vietnamese public label. */}
                            </div>
                            <ol className={styles.contactRouteMap} aria-label="Contact routing sequence">
                                {["Orient", "Resolve intent", "Route", "Confirm next state"].map((step, index) => (
                                    <li key={step} data-active={index === 1 ? "true" : undefined}>
                                        <span>{String(index + 1).padStart(2, "0")}</span>
                                        <strong>{step}</strong>
                                    </li>
                                ))}
                            </ol>
                        </PageContainer>
                    </section>

                    <section className={styles.intentSection} id="intent-router" aria-labelledby="intent-title">
                        <PageContainer className={styles.intentLayout}>
                            <div className={styles.intentMain}>
                                <div className={styles.sectionHeading}>
                                    <span className={styles.eyebrow}>CHOOSE YOUR PATH</span>
                                    <Heading level={2}><span id="intent-title">Sáu intent. Một next step đúng.</span></Heading> {/* vn-ok: Canonical Vietnamese public copy. */}
                                    <Text as="p" size="md" tone="muted">General là fallback, không phải default.</Text> {/* vn-ok: Canonical Vietnamese public copy. */}
                                </div>
                                <form id="adaptive-form" className={styles.intentForm} action="/contact#intent-router" method="get">
                                    <fieldset>
                                        <legend>Select relationship intent</legend>
                                        <div className={styles.intentGrid}>
                                            {CONTACT_INTENTS.map((intent, index) => (
                                                <label className={styles.intentOption} key={intent.id} data-selected={selected?.id === intent.id ? "true" : undefined}>
                                                    <input type="radio" name="intent" value={intent.id} defaultChecked={selected?.id === intent.id} />
                                                    <span className={styles.cardIndex}>{String(index + 1).padStart(2, "0")}</span>
                                                    <strong>{intent.label}</strong>
                                                    <small>{intent.userJob}</small>
                                                    <span className={styles.intentCheck} aria-hidden="true"><NivoIcon props={{ name: "complete", usage: "chip" }} /></span>
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>
                                    <Button type="submit" variant="primary" size="lg" endContent={<ArrowIcon />}>Resolve next path</Button>
                                </form>
                            </div>

                            <aside id="contact-next-step" className={styles.routeResult} aria-live="polite" aria-labelledby="route-result-title">
                                <span className={styles.eyebrow}>RESOLVED ROUTE</span>
                                {selected === undefined ? (
                                    <>
                                        <span className={styles.resultIcon}><NivoIcon props={{ name: "overview", usage: "heading" }} /></span>
                                        <Heading level={3}><span id="route-result-title">No intent selected</span></Heading>
                                        <Text as="p" size="sm">Select one option, then resolve the next path.</Text>
                                    </>
                                ) : (
                                    <>
                                        <Badge tone="success">Intent resolved</Badge>
                                        <Heading level={3}><span id="route-result-title">{selected.label}</span></Heading>
                                        <Text as="p" size="sm">{selected.expectation}</Text>
                                        <nav className={styles.resultLinks} aria-label={`${selected.label} direct paths`}>
                                            {selected.directPaths.map((path) => <TextAction href={path.href} appearance="route" endContent={<ArrowIcon />} key={path.href}>{path.label}</TextAction>)}
                                        </nav>
                                    </>
                                )}
                            </aside>
                        </PageContainer>
                    </section>

                    <section className={styles.contactTruthSection} aria-labelledby="contact-truth-title">
                        <PageContainer className={styles.contactTruthGrid}>
                            <div>
                                <span className={styles.eyebrow}>ADAPTIVE MINIMAL FORM</span>
                                <Heading level={2}><span id="contact-truth-title">Chỉ hỏi những gì giúp routing tốt hơn.</span></Heading> {/* vn-ok: Canonical Vietnamese public copy. */}
                                <Text as="p" size="md">Live intake cần owner, destination, privacy wording và recovery path được xác minh.</Text> {/* vn-ok: Canonical Vietnamese public copy. */}
                            </div>
                            <div className={styles.privacyCard}>
                                <span className={styles.privacyIcon}><NivoIcon props={{ name: "complete", usage: "heading" }} /></span>
                                <Badge tone="warning">Route unavailable · No personal-data collection</Badge>
                                <Text as="p" size="sm">Chưa có operational owner, submission destination hoặc privacy wording được fact-lock. Trang không thu thập tên, organization, email hay free text.</Text> {/* vn-ok: Canonical Vietnamese public copy. */}
                            </div>
                            <div className={styles.noSubmission}>
                                <span>NO REQUEST SUBMITTED</span>
                                <p>Việc chọn Intent chỉ thay đổi URL và hướng dẫn; không tạo relationship request. Không SLA, success message hoặc receipt khi không có effect đã được xác nhận.</p> {/* vn-ok: Canonical Vietnamese public copy. */}
                            </div>
                        </PageContainer>
                    </section>

                    <section id="direct-paths" className={styles.directSection} aria-labelledby="direct-title">
                        <PageContainer className={styles.directGrid}>
                            <div className={styles.sectionHeadingInverse}>
                                <span className={styles.eyebrow}>OTHER DIRECT PATHS</span>
                                <Heading level={2}><span id="direct-title">Bạn có thể tự đi tiếp mà không cần gửi form.</span></Heading> {/* vn-ok: Canonical Vietnamese public copy. */}
                                <Text as="p" size="md">Canonical owner thường giải quyết nhu cầu trước Contact.</Text> {/* vn-ok: Canonical Vietnamese public copy. */}
                            </div>
                            <nav className={styles.directLinks} aria-label="NIVO.VN direct paths">
                                {DIRECT_PATHS.map(([label, href], index) => (
                                    <TextAction href={href} appearance="route" endContent={<ArrowIcon />} key={href}>
                                        <span><small>{String(index + 1).padStart(2, "0")}</small>{label}</span>
                                    </TextAction>
                                ))}
                            </nav>
                        </PageContainer>
                    </section>
                </div>
            </SiteMain>
        </div>
    )
}

export default ContactRoute
