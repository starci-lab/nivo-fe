import Image from "next/image";
import { Badge, Button, Heading, MediaFrame, Text, TextAction } from "@starci/grammar/common";
import { NivoBrand, NivoIcon } from "@nivo/ui";
import { LANDING_COPY, LANDING_DESCRIPTION } from "@/resources/copy";
import { LandingMotionArtworkDrift, LandingMotionHeroReveal, LandingMotionInstanceCard, LandingMotionLightSectionReveal, LandingMotionLoopStep, LandingMotionLoopTrack, LandingMotionResponsibilityGraph, LandingMotionRoleLayer } from "@/components/blocks/landing/LandingMotion";
import { CLASS_NAMES as C } from "./classNames";

/** Props accepted by the static public landing surface. */
export type LandingPageProps = Record<string, never>;

const INTENT_ICONS = ["apps", "overview", "agentos", "wallet"] as const;
const LOOP_ICONS = ["community", "agentos", "servers", "search", "code", "talents"] as const;
const ROLE_ART = ["/images/handoff-human-v1.png", "/images/handoff-ai-v1.png", "/images/handoff-system-v1.png"] as const;
const LOOP_POSITIONS = ["7%", "25%", "43%", "61%", "79%", "94%"] as const;

/** Renders the public NIVO Agentic OS product narrative and entry offer. */
export const LandingPage = (props: LandingPageProps) => {
  void props;
  const { hero, loop, roles, intents, instances, offer, footer, labels } = LANDING_COPY;

  return <>
    <a className={C.skipLink} href="#main">{labels.skip}</a>
    <header className={C.siteHeader}>
      <a href="#main" aria-label={labels.home}><NivoBrand props={{ label: "nivo", variant: "lockup", scale: "navbar" }} /><span className={C.brandMeta}>NIVO OS</span></a>
      <nav aria-label={labels.nav}>{labels.navItems.map(item => <TextAction key={item.href} href={item.href} appearance="plain">{item.label}</TextAction>)}</nav>
      <div className={C.headerAction}><Button href="#responsibility-first" size="sm" variant="primary" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{hero.primary}</Button></div>
    </header>

    <main id="main">
      <section className={C.hero_sectionShell} aria-labelledby="hero-title">
        <LandingMotionHeroReveal>
          <p className={C.eyebrow}>{hero.eyebrow}</p>
          <div id="hero-title"><Heading level={1}>{hero.title}</Heading></div>
          <Text size="md" tone="muted">{hero.lede}</Text>
          <div className={C.actions}>
            <Button href="#responsibility-first" size="lg" variant="primary" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{hero.primary}</Button>
            <Button href="#operating-loop" size="lg" variant="outline" endContent={<NivoIcon props={{ name: "disclosure", usage: "chip" }} />}>{hero.secondary}</Button>
          </div>
          <p className={C.heroFlow}>{loop.steps.map((step, index) => <span key={step}>{step}{index < loop.steps.length - 1 && <i aria-hidden="true">→</i>}</span>)}</p>
          <span className={C.srOnly}>{LANDING_DESCRIPTION}</span>
        </LandingMotionHeroReveal>

        <div className={C.heroVisual}>
          <MediaFrame className={C.heroArtwork} aspect="landscape" fit="cover" treatment="plain">
            <Image src="/images/nivo-unicorn-responsibility-transparent-v13.png" alt={hero.artAlt} width={1536} height={1024} priority sizes="(max-width: 900px) 100vw, 58vw" />
          </MediaFrame>
          <LandingMotionResponsibilityGraph>
            <svg aria-hidden="true" viewBox="0 0 640 440" preserveAspectRatio="none"><path d="M62 318C150 372 219 382 302 326S438 172 579 124" /><path d="M64 318C182 260 235 155 327 146s148 52 252-22" /></svg>
            {loop.steps.map((step, index) => <span key={step} className={C.graphNode} data-node={index + 1}><i aria-hidden="true" />{step}</span>)}
          </LandingMotionResponsibilityGraph>
        </div>
        <LandingMotionArtworkDrift>
          <div className={C.responsibilityMap} aria-label={hero.mapLabel}>
            <div className={C.mapTop}><Badge tone="success">{hero.mapStatus}</Badge><NivoIcon props={{ name: "complete", usage: "heading", ariaLabel: hero.mapStatus }} /></div>
            <div className={C.mapCenter}><span className={C.mapKicker}>{hero.mapKicker}</span><strong>{hero.mapTitle}</strong><Text size="sm" tone="muted">{hero.mapOwner}</Text></div>
            <div className={C.mapProof}><span><strong>{hero.proofTitle}</strong><small>{hero.proofBody}</small></span><Badge tone="success">{hero.proofBadge}</Badge></div>
          </div>
        </LandingMotionArtworkDrift>
      </section>

      <section id="operating-loop" className={C.loop}>
        <div className={C.sectionShell}>
          <LandingMotionLightSectionReveal><p className={C.eyebrow}>{loop.eyebrow}</p><Heading level={2}>{loop.title}</Heading><p>{loop.lede}</p></LandingMotionLightSectionReveal>
          <LandingMotionLoopTrack>
            <svg className={C.loopPath} aria-hidden="true" viewBox="0 0 1200 210" preserveAspectRatio="none"><defs><linearGradient id="loop-signal" x1="0" x2="1"><stop stopColor="#ff7469"/><stop offset="1" stopColor="#ff5148"/></linearGradient><filter id="loop-glow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><marker id="loop-arrow" markerWidth="13" markerHeight="13" refX="11" refY="6.5" orient="auto"><path d="M1 1.5 11 6.5 1 11.5" fill="none" stroke="#ff7469" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></marker></defs><path className={C.loopPathBed} d="M20 82V70Q20 56 34 56H1166"/><path className={C.loopPathSignal} d="M20 82V70Q20 56 34 56H1166" markerEnd="url(#loop-arrow)" filter="url(#loop-glow)"/></svg>
            <ol className={C.loopTrack}>{loop.steps.map((step, index) => <LandingMotionLoopStep key={step} index={index} position={LOOP_POSITIONS[index]}><div className={C.loopGlyph}><NivoIcon props={{ name: LOOP_ICONS[index], usage: "heading" }} /></div><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong><small>{loop.stepBodies[index]}</small></LandingMotionLoopStep>)}</ol>
          </LandingMotionLoopTrack>
        </div>
      </section>

      <section id="responsibility" className={C.sectionShell_roles}>
        <div className={C.roleIntro}><p className={C.eyebrow}>{labels.operatingModel}</p><Heading level={2}>{labels.operatingModelTitle}</Heading><p>{labels.operatingModelBody}</p><TextAction href="#intent-modules" appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{labels.exploreOperating}</TextAction></div>
        <svg className={C.roleRail} aria-hidden="true" viewBox="0 0 920 96" preserveAspectRatio="none"><defs><linearGradient id="responsibility-pipe" x1="0" x2="1"><stop stopColor="#e72b32"/><stop offset="1" stopColor="#ff7469"/></linearGradient><filter id="pipe-glow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><marker id="pipe-arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M1 1 10 6 1 11" fill="none" stroke="#ff5d54" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></marker></defs><path d="M18 76V50Q18 36 32 36H892" fill="none" stroke="url(#responsibility-pipe)" strokeWidth="9" strokeLinecap="round" markerEnd="url(#pipe-arrow)" filter="url(#pipe-glow)"/><path d="M28 32H884" fill="none" stroke="rgba(255,255,255,.52)" strokeWidth="2" strokeLinecap="round"/></svg>
        <div className={C.roleGrid}>{roles.map((role, index) => <LandingMotionRoleLayer key={role.title} index={index}><div className={C.roleIcon}><Image src={ROLE_ART[index]} alt="" width={1254} height={1254} sizes="260px" /></div><span>{role.label}</span><Heading level={3}>{role.title}</Heading><p>{role.body}</p><Badge tone={index === 0 ? "danger" : index === 1 ? "accent" : "neutral"}>{role.verb}</Badge></LandingMotionRoleLayer>)}</div>
      </section>

      <section id="intent-modules" className={C.intentSection}>
        <div className={C.sectionShell}>
          <div className={C.sectionHeading}><p className={C.eyebrow}>{labels.intentEyebrow}</p><Heading level={2}>{labels.intentTitle}</Heading></div>
          <div className={C.intentGrid}>{intents.map((item, index) => <article key={item.title} data-intent={index + 1}><div className={C.intentTitle}><NivoIcon props={{ name: INTENT_ICONS[index], usage: "heading" }} /><Heading level={3}>{item.title}</Heading></div><p>{item.body}</p><div className={C.intentArtwork}><Image src={item.art} alt={item.artAlt} width={1536} height={1152} sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw" /></div></article>)}</div>
        </div>
      </section>

      <section id="module-instances" className={C.instancesTheatre}>
        <div className={C.sectionShell_instances}>
          <div className={C.instancesHeading}><p className={C.eyebrow}>{instances.eyebrow}</p><Heading level={2}>{instances.title}</Heading><p>{instances.body}</p></div>
          <div className={C.instanceStack}>{instances.items.map((item, index) => <LandingMotionInstanceCard key={item.name} index={index}><div className={C.instanceTop}><strong>{item.name}</strong><Badge tone={item.tone}>{item.intent}</Badge></div><dl><div><dt>{instances.owner}</dt><dd>{item.owner}</dd></div><div><dt>{instances.status}</dt><dd>{item.status}</dd></div><div><dt>{instances.outcome}</dt><dd>{item.outcome}</dd></div></dl><div className={C.instanceEvidence}><NivoIcon props={{ name: "complete", usage: "chip" }} /><span>{item.evidence}</span></div></LandingMotionInstanceCard>)}</div>
        </div>
      </section>

      <section id="offer" className={C.offer}>
        <div id="responsibility-first" className={C.sectionShell_offerGrid}>
          <div className={C.offerArtwork}><Image src="/images/nivo-unicorn-responsibility-transparent-v13.png" alt="" width={1536} height={1024} sizes="320px" /></div>
          <div className={C.offerCopy}><Heading level={2}>{offer.title}</Heading><p>{offer.body}</p><ul>{offer.benefits.map(item => <li key={item}><NivoIcon props={{ name: "complete", usage: "chip" }} />{item}</li>)}</ul></div>
          <Button href={offer.href} size="lg" variant="outline" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{hero.primary}</Button>
        </div>
      </section>
    </main>

    <footer><div className={C.sectionShell_footerInner}>
      <div className={C.footerBrand}><NivoBrand props={{ label: "nivo", variant: "lockup", scale: "hero" }} /><span>NIVO OS</span><p>{labels.mantra}</p></div>
      <div className={C.footerDirectory}>{footer.groups.map(group => <section key={group.title}><strong>{group.title}</strong><nav aria-label={group.title}>{group.items.map(item => <TextAction key={`${group.title}-${item.label}`} href={item.href} appearance="plain">{item.label}</TextAction>)}</nav></section>)}</div>
      <section className={C.footerNewsletter}><strong>{footer.newsletterTitle}</strong><p>{footer.newsletterBody}</p><TextAction href={footer.newsletterHref} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{footer.newsletterAction}</TextAction></section>
      <small>{labels.copyright}</small>
    </div></footer>
  </>;
};

/** Public routes supported by the canonical site map. */
export type CanonicalRoute = "nivo-os" | "system-of-responsibility" | "applications" | "pricing" | "ideas" | "ecosystem" | "company" | "trust" | "contact";
 // vn-ok: approved visitor copy
type Card = { readonly title: string; readonly body: string }; // vn-ok: approved visitor copy
type RouteSection = { readonly label: string; readonly title: string; readonly body: string; readonly cards: readonly Card[] }; // vn-ok: approved visitor copy
type RouteModel = { readonly eyebrow: string; readonly title: string; readonly lede: string; readonly sections: readonly RouteSection[] }; // vn-ok: approved visitor copy
type CanonicalPageProps = { readonly route: CanonicalRoute; readonly selectedIntent?: string }; // vn-ok: approved visitor copy
type ContactIntentFormProps = { readonly selectedIntent?: string }; // vn-ok: approved visitor copy
const CONTACT_INTENTS = ["product-understanding", "commercial-evaluation", "implementation", "partnership", "press-and-research", "other"] as const; // vn-ok: approved visitor copy
const routePath = (path: string) => path; // vn-ok: approved visitor copy
const section = (label: string, title: string, body: string, cards: readonly Card[]): RouteSection => ({ label, title, body, cards }); // vn-ok: approved visitor copy
const card = (title: string, body: string): Card => ({ title, body }); // vn-ok: approved visitor copy
 // vn-ok: approved visitor copy
const ROUTES: Record<CanonicalRoute, RouteModel> = { // vn-ok: approved visitor copy
  "nivo-os": { // vn-ok: approved visitor copy
    eyebrow: "NIVO OS", title: "Một hệ điều hành trách nhiệm cho tổ chức AI-native.", // vn-ok: approved visitor copy
    lede: "NIVO OS đặt context, responsibility, evidence và verified outcome vào cùng một operating loop để Human dẫn dắt, AI vận hành, System học hỏi.", // vn-ok: approved visitor copy
    sections: [ // vn-ok: approved visitor copy
      section("01 — Định nghĩa", "Không chỉ là một AI tool", "NIVO OS là lớp điều phối công việc quan trọng: mục tiêu có chủ thể, ngữ cảnh có nguồn và kết quả có bằng chứng.", [card("Responsibility trước activity", "Mỗi việc bắt đầu bằng người chịu trách nhiệm cuối cùng, không phải bằng một danh sách tác vụ."), card("Evidence trước lời hứa", "Một kết quả chỉ trở thành tín hiệu tin cậy khi dấu vết và điều kiện kiểm tra được nhìn thấy.")]), // vn-ok: approved visitor copy
      section("02 — Operating loop", "Context → Responsibility → Outcome", "Vòng lặp nối hiểu đúng bối cảnh với giao việc, phối hợp và kiểm chứng kết quả.", [card("Human Leads", "Con người đặt mục tiêu, quyết định và giữ quyền phê duyệt."), card("AI Operates", "AI thực thi trong phạm vi đã được giao và để lại dấu vết.")]), // vn-ok: approved visitor copy
      section("03 — Phạm vi", "Bốn intent để bắt đầu", "Create, Operate, Revenue và Money là các hướng công việc để khám phá; chúng không phải lời hứa về entitlement.", [card("Create / Operate", "Tạo tài sản và vận hành quy trình trong cùng một context."), card("Revenue / Money", "Theo dõi tăng trưởng và nguồn lực với claim được gắn trạng thái.")]), // vn-ok: approved visitor copy
      section("04 — Trạng thái", "Hiện tại và hướng phát triển", "NIVO công khai điều đã được xác nhận và gắn nhãn rõ cho phần đang xây dựng, thử nghiệm hoặc định hướng tương lai.", [card("Current", "Nội dung hiện tại được trình bày như điều visitor có thể hiểu và kiểm tra."), card("Future · Target", "Hướng tương lai không đồng nghĩa khả năng hiện có hay quyền truy cập.")]), // vn-ok: approved visitor copy
      section("05 — Bắt đầu", "Chọn câu hỏi đúng trước khi chọn công cụ", "Đọc System of Responsibility hoặc Applications để xác định job; liên hệ khi cần một cuộc trao đổi có mục đích.", [card("Tìm hiểu", "Đi tới /system-of-responsibility để xem anatomy năm phần."), card("Trao đổi", "Contact chỉ mở sau khi visitor chọn một trong sáu intent.")]), // vn-ok: approved visitor copy
      section("06 — Ranh giới", "NIVO và app.nivo.vn là hai chủ sở hữu khác nhau", "Website công khai giải thích và định tuyến; môi trường vận hành xác thực giữ quyền truy cập và hiệu ứng sản phẩm.", [card("Canonical public owner", "nivo.vn sở hữu nội dung giải thích hiện tại."), card("Authenticated boundary", "app.nivo.vn không được giả lập bằng UI công khai.")]), // vn-ok: approved visitor copy
      section("07 — Tín nhiệm", "Mỗi vòng lặp làm context tốt hơn", "Verified outcome trở thành trust cho vòng tiếp theo chỉ khi nguồn, owner và trạng thái được giữ rõ.", [card("Reviewable", "Visitor có thể lần theo route và khái niệm về owner."), card("Qualified", "Claim thiếu xác nhận được thu hẹp hoặc loại khỏi projection.")]), // vn-ok: approved visitor copy
      section("08 — Next", "Đi từ hiểu đến liên hệ có chủ đích", "NIVO OS không tạo một funnel mới; nó đưa visitor đến canonical owner phù hợp với câu hỏi hiện tại.", [card("Explore Applications", "Xem các nhu cầu và vai trò mà NIVO có thể giải thích."), card("Contact", "Chọn intent product-understanding nếu cần làm rõ sản phẩm.")]) // vn-ok: approved visitor copy
    ] // vn-ok: approved visitor copy
  }, // vn-ok: approved visitor copy
  "system-of-responsibility": { // vn-ok: approved visitor copy
    eyebrow: "SYSTEM OF RESPONSIBILITY", title: "Năm phần để trách nhiệm có thể được vận hành.", // vn-ok: approved visitor copy
    lede: "System of Responsibility biến một mục tiêu mơ hồ thành một vòng lặp có context, owner, hành động, evidence và kết quả được kiểm chứng.", // vn-ok: approved visitor copy
    sections: [ // vn-ok: approved visitor copy
      section("01 — Responsibility", "Mục tiêu có một người dẫn dắt", "Nêu rõ điều phải hoàn thành và ai chịu trách nhiệm cuối cùng trước khi phân phối công việc.", [card("Owner", "Owner không bị ẩn sau một nhóm hay một agent không tên."), card("Decision", "Quyết định quan trọng giữ ở nơi có thẩm quyền phù hợp.")]), // vn-ok: approved visitor copy
      section("02 — Context", "Đặt đúng tri thức vào đúng việc", "Quyết định, dữ liệu và nguồn tham chiếu phải có mặt trước khi AI được yêu cầu hành động.", [card("Source", "Context có nguồn để người khác xem lại."), card("Boundary", "Thiếu context thì claim được giữ ở trạng thái chưa đủ xác nhận.")]), // vn-ok: approved visitor copy
      section("03 — Human + AI + System", "Ba vai trò, một handoff rõ ràng", "Human leads, AI operates, System learns; mỗi vai trò có phạm vi và điểm bàn giao cụ thể.", [card("Human leads", "Đặt mục tiêu và duyệt điều có tác động."), card("AI operates", "Lập kế hoạch và thực thi trong authority đã cấp.")]), // vn-ok: approved visitor copy
      section("04 — Evidence", "Hành động để lại dấu vết", "Evidence không phải trang trí; đó là điều kiện để hiểu kết quả và sửa vòng lặp tiếp theo.", [card("Trace", "Dấu vết nối hành động với context và owner."), card("Review", "Kết quả có thể được kiểm tra thay vì chỉ được kể lại.")]), // vn-ok: approved visitor copy
      section("05 — Verified outcome", "Kết quả trước, trust sau", "Không chuyển một outcome thành trust khi chưa xác định điều gì đã được kiểm chứng.", [card("Verified", "Nêu rõ tiêu chí và trạng thái xác nhận."), card("Learn", "Trust mới trở thành context cho lần vận hành kế tiếp.")]), // vn-ok: approved visitor copy
      section("06 — Truth states", "Current không bị lẫn với Future", "Cùng một trang có thể nói về hướng phát triển, miễn là trạng thái được viết ra và không tạo entitlement.", [card("Building", "Đang xây dựng không phải đã sẵn sàng."), card("Future · Target", "Định hướng tương lai cần được đọc như định hướng.")]), // vn-ok: approved visitor copy
      section("07 — Navigation", "Đi tới owner canonical", "Mỗi câu hỏi có một route sở hữu; các trang khác chỉ tóm tắt và liên kết.", [card("Understand", "NIVO OS owns the product explanation."), card("Relate", "Contact owns the human relationship request.")]), // vn-ok: approved visitor copy
      section("08 — Practice", "Bắt đầu từ một responsibility nhỏ", "Một vòng lặp nhỏ có thể tạo context và evidence tốt hơn một catalog lời hứa lớn.", [card("Name the job", "Xác định job trước khi chọn capability."), card("Review outcome", "Kiểm tra điều đạt được trước khi mở rộng.")]) // vn-ok: approved visitor copy
    ] // vn-ok: approved visitor copy
  }, // vn-ok: approved visitor copy
  applications: { // vn-ok: approved visitor copy
    eyebrow: "APPLICATIONS", title: "Bắt đầu từ job cần được vận hành.", // vn-ok: approved visitor copy
    lede: "Applications là trang khám phá nhu cầu và vai trò; nó định tuyến đến context phù hợp thay vì giả lập một catalog entitlement.", // vn-ok: approved visitor copy
    sections: [ // vn-ok: approved visitor copy
      section("01 — Discover", "Bạn đang muốn tạo, vận hành, tăng trưởng hay quản trị tiền?", "Chọn intent để thu hẹp câu hỏi và giữ route canonical.", [card("Create", "Nội dung, chiến dịch và tài sản có trách nhiệm."), card("Operate", "Quy trình, dự án và đội nhóm cần handoff rõ.")]), // vn-ok: approved visitor copy
      section("02 — Revenue", "Tăng trưởng cần evidence, không chỉ dashboard", "Revenue là một hướng khám phá; mọi kết quả cụ thể cần owner và nguồn xác nhận.", [card("Signal", "Phân biệt tín hiệu quan sát được với claim kết quả."), card("Qualification", "Không hiển thị số liệu khách hàng hay entitlement chưa được duyệt.")]), // vn-ok: approved visitor copy
      section("03 — Money", "Nguồn lực cũng là một responsibility", "Money giúp đặt chi phí, lợi nhuận và dòng tiền vào context có thể xem lại.", [card("Context", "Biết quyết định nào đang làm thay đổi nguồn lực."), card("Outcome", "Đánh giá outcome theo trạng thái đã được xác nhận.")]), // vn-ok: approved visitor copy
      section("04 — Role", "Ai đang cần một operating loop?", "Applications nói theo user job và role, không tạo persona giả hoặc logo khách hàng.", [card("Founder", "Giữ context và quyết định ở một nơi có thể theo dõi."), card("Team", "Phối hợp Human, AI và System quanh cùng responsibility.")]), // vn-ok: approved visitor copy
      section("05 — Qualification", "Hướng tương lai được gắn nhãn", "Future, Target, Experimental và Long-Term không được đọc như khả năng hiện tại.", [card("Visible state", "Trạng thái luôn nằm cạnh claim có liên quan."), card("No entitlement", "Không có CTA kích hoạt cho nội dung chỉ mang tính định hướng.")]), // vn-ok: approved visitor copy
      section("06 — Next owner", "Đọc sâu hơn hoặc bắt đầu một cuộc trao đổi", "Từ Applications, visitor đi đến route giải thích cụ thể hoặc chọn contact intent.", [card("Understand", "NIVO OS và System of Responsibility trả lời câu hỏi nền."), card("Relate", "Implementation hoặc partnership chỉ được chọn khi đúng mục đích.")]), // vn-ok: approved visitor copy
      section("07 — Safe boundary", "Public explanation không phải authenticated operation", "Website chỉ điều hướng đến app.nivo.vn khi đó là boundary đã được công bố.", [card("Public", "Nội dung mở, canonical và có truth state."), card("Product", "Hiệu ứng vận hành thuộc môi trường xác thực.")]) // vn-ok: approved visitor copy
    ] // vn-ok: approved visitor copy
  }, // vn-ok: approved visitor copy
  "pricing": { // vn-ok: approved visitor copy
    eyebrow: "PRICING", title: "Giá trị thương mại cần xác nhận.", // vn-ok: approved visitor copy
    lede: "NIVO chưa công bố entitlement hay mức giá thương mại đã xác nhận trên route này; visitor có thể hiểu phạm vi và chọn một cuộc trao đổi có chủ đích.", // vn-ok: approved visitor copy
    sections: [ // vn-ok: approved visitor copy
      section("01 — Truth gate", "Không biến hướng sản phẩm thành bảng giá", "Pricing giữ lại điều có thể nói thật hôm nay và không điền số liệu, tier hay SLA chưa có owner xác nhận.", [card("Giá trị thương mại cần xác nhận", "Giá và điều khoản cần được xác nhận trực tiếp trước khi trở thành commitment."), card("Không entitlement", "Không có free plan, trial hay quyền truy cập được suy diễn từ layout.")]), // vn-ok: approved visitor copy
      section("02 — Start", "Một điểm bắt đầu nhỏ hơn một lời hứa lớn", "NIVO có thể bắt đầu bằng việc hiểu responsibility và job đang cần vận hành.", [card("Current direction", "Bắt đầu từ context, owner và outcome cần được làm rõ."), card("Assisted path", "Chọn commercial-evaluation để trao đổi về phạm vi phù hợp.")]), // vn-ok: approved visitor copy
      section("03 — Pro", "Không công bố tier chưa được duyệt", "Mọi phân tầng thương mại trong tương lai phải có nguồn, trạng thái và owner hiển thị.", [card("Future · Target", "Phân tầng tương lai chỉ là định hướng được qualification."), card("Review", "Không dùng claim dự kiến để tạo quyết định mua hiện tại.")]), // vn-ok: approved visitor copy
      section("04 — Scope", "Giá trị nằm ở operating loop", "NIVO tập trung vào context, responsibility, evidence và verified outcome thay vì liệt kê tool feature.", [card("System of Responsibility", "Xem anatomy năm phần trước khi đánh giá fit."), card("Applications", "Xác định job và role đang cần được hỗ trợ.")]), // vn-ok: approved visitor copy
      section("05 — Evidence", "Một con số cần một nguồn", "Metrics, customer logos, testimonials và case studies không xuất hiện khi chưa có canonical evidence.", [card("No invented proof", "Trang không dùng số liệu minh họa như bằng chứng kinh doanh."), card("Qualified claims", "Claim chưa đủ cơ sở được rút gọn hoặc giữ trạng thái.")]), // vn-ok: approved visitor copy
      section("06 — Commercial conversation", "Trao đổi đúng intent", "Contact là relationship routing; nó không phải một form thu thập lead không mục đích.", [card("Commercial evaluation", "Dùng khi cần làm rõ giá trị và phạm vi thương mại."), card("Product understanding", "Dùng khi câu hỏi còn ở mức tìm hiểu.")]), // vn-ok: approved visitor copy
      section("07 — Boundary", "Activation không nằm trong bảng giá công khai", "Mọi activation hoặc entitlement phải đi qua boundary được sở hữu và xác nhận.", [card("Public route", "Nêu rõ hiện trạng và route tiếp theo."), card("Owner", "Không tạo CTA tự kích hoạt từ claim thương mại chưa xác nhận.")]), // vn-ok: approved visitor copy
      section("08 — Review", "Truth sẽ được cập nhật khi authority thay đổi", "Pricing có thể được mở rộng khi điều khoản và entitlement có bản canonical được duyệt.", [card("Current", "Chỉ nội dung hiện tại được trình bày như hiện tại."), card("Revision", "Thay đổi source phải kéo theo re-review projection.")]), // vn-ok: approved visitor copy
      section("09 — Decision", "Bạn cần biết gì trước khi nói về giá?", "Một cuộc trao đổi tốt bắt đầu bằng job, context, owner và kết quả mong đợi.", [card("Job", "Nêu công việc cần vận hành."), card("Outcome", "Nêu cách biết kết quả đã được kiểm chứng.")]), // vn-ok: approved visitor copy
      section("10 — Next", "Đọc trước, liên hệ sau", "Visitor có thể tự đọc canonical pages mà không bị ép chuyển sang Contact.", [card("Learn", "Đi đến NIVO OS để hiểu operating model."), card("Relate", "Chọn contact khi thật sự cần phối hợp với con người.")]), // vn-ok: approved visitor copy
      section("11 — Honesty", "Giá trị không được thay bằng filler", "Mỗi phần ở đây phục vụ một câu hỏi thương mại cụ thể và giữ nguyên giới hạn điều NIVO có thể cam kết.", [card("Qualified", "Nói ít hơn nhưng kiểm tra được."), card("Responsible", "Không chuyển uncertainty thành marketing certainty.")]) // vn-ok: approved visitor copy
    ] // vn-ok: approved visitor copy
  }, // vn-ok: approved visitor copy
  "ideas": { // vn-ok: approved visitor copy
    eyebrow: "IDEAS", title: "Ý tưởng để học, không thay thế canonical truth.", // vn-ok: approved visitor copy
    lede: "Ideas giúp visitor khám phá thesis và context; mỗi object phải có lifecycle, author, evidence và quan hệ canonical rõ.", // vn-ok: approved visitor copy
    sections: [ // vn-ok: approved visitor copy
      section("01 — Thesis", "Một ý tưởng bắt đầu bằng câu hỏi", "Ý tưởng trình bày một thesis trực tiếp để visitor hiểu trước khi đi sâu.", [card("Direct answer", "Không bắt visitor đi qua một catalog để biết thesis."), card("Context", "Thesis được đặt trong bối cảnh có thể kiểm tra.")]), // vn-ok: approved visitor copy
      section("02 — Evidence", "Evidence của ý tưởng có giới hạn", "Idea diễn giải canonical truth và không tự tạo endorsement hay entitlement.", [card("Source", "Nêu nguồn khi claim cần được kiểm tra."), card("No replacement", "Idea không thay thế route sở hữu khái niệm.")]), // vn-ok: approved visitor copy
      section("03 — Lifecycle", "Current, superseded, unavailable", "Lifecycle được nói rõ để visitor không nhầm nội dung cũ với hướng hiện tại.", [card("Current", "Object hiện tại được phân biệt với bản cũ."), card("Unavailable", "Slug không được duyệt hiển thị recovery rõ ràng.")]), // vn-ok: approved visitor copy
      section("04 — Relations", "Liên kết có chủ đích", "Mỗi relation dẫn visitor về route canonical phù hợp với câu hỏi tiếp theo.", [card("Canonical owner", "Không tạo page mới cho taxonomy hay navigation group."), card("Next path", "Link label nói rõ visitor sẽ đi đâu.")]), // vn-ok: approved visitor copy
      section("05 — Discovery", "Lọc để học, không đổi canonical identity", "Query state hỗ trợ discovery và vẫn subordinate to /ideas.", [card("Filter", "Giữ visitor trên route sở hữu."), card("Indexability", "Không tạo canonical page từ một query không được duyệt.")]), // vn-ok: approved visitor copy
      section("06 — Recovery", "Slug không biết thì không bịa", "Unknown hoặc unreviewed slug render unavailable state và đường về canonical navigation.", [card("Explicit", "Nói rõ object không hiện có."), card("Safe return", "Đưa visitor về Ideas hoặc route canonical liên quan.")]) // vn-ok: approved visitor copy
    ] // vn-ok: approved visitor copy
  }, // vn-ok: approved visitor copy
  "ecosystem": { // vn-ok: approved visitor copy
    eyebrow: "ECOSYSTEM", title: "Một hệ sinh thái được gọi tên bằng vai trò và trạng thái.", // vn-ok: approved visitor copy
    lede: "Ecosystem mô tả những quan hệ NIVO có thể định tuyến mà không phóng đại partner, capability hay current endorsement.", // vn-ok: approved visitor copy
    sections: [ // vn-ok: approved visitor copy
      section("01 — Future · Qualified", "Định hướng hệ sinh thái", "Các quan hệ tương lai được gắn nhãn Future · Qualified và không được hiểu là đã available.", [card("Future", "Nói về hướng có thể phát triển."), card("Qualified", "Giới hạn claim ở điều đã được duyệt.")]), // vn-ok: approved visitor copy
      section("02 — Roles", "Vai trò trước logo", "Mô tả ecosystem bằng role, context và responsibility thay vì danh sách thương hiệu chưa có bằng chứng.", [card("Human", "Người giữ mục tiêu và quan hệ."), card("System", "Lớp giúp context và evidence có thể được truy xuất.")]), // vn-ok: approved visitor copy
      section("03 — Boundaries", "NIVO không đại diện cho mọi đối tác", "Mỗi quan hệ có owner và boundary; thiếu xác nhận thì không render như current fact.", [card("Canonical owner", "Nguồn chính quyết định nội dung được hiển thị."), card("No implied endorsement", "Không dùng bố cục để suy diễn bảo chứng.")]), // vn-ok: approved visitor copy
      section("04 — Participation", "Tham gia bằng một intent cụ thể", "Partnership là một relationship intent, không phải CTA activation hay danh sách đăng ký.", [card("Partnership", "Dùng khi có đề xuất hợp tác cụ thể."), card("Research", "Dùng press-and-research khi mục đích là tìm hiểu.")]), // vn-ok: approved visitor copy
      section("05 — Learning", "Hệ sinh thái học qua evidence", "Một quan hệ có ý nghĩa khi context, handoff và outcome được nhìn thấy.", [card("Context", "Nêu lý do quan hệ tồn tại."), card("Outcome", "Không nêu kết quả chưa được xác nhận.")]), // vn-ok: approved visitor copy
      section("06 — Next", "Đi tới route sở hữu câu hỏi", "Ecosystem tóm tắt và định tuyến; NIVO OS, Trust và Contact sở hữu các câu trả lời sâu hơn.", [card("Trust", "Xem cách claim và boundary được giữ."), card("Contact", "Chọn intent trước khi yêu cầu một cuộc trao đổi.")]) // vn-ok: approved visitor copy
    ] // vn-ok: approved visitor copy
  }, // vn-ok: approved visitor copy
  "company": { // vn-ok: approved visitor copy
    eyebrow: "COMPANY", title: "NIVO là tổ chức đứng sau hệ điều hành trách nhiệm.", // vn-ok: approved visitor copy
    lede: "Company nói về identity, hướng hiện tại và cách NIVO giữ ranh giới giữa tổ chức, sản phẩm và các claim cần xác nhận.", // vn-ok: approved visitor copy
    sections: [ // vn-ok: approved visitor copy
      section("01 — Identity", "NIVO và NIVO OS không phải một khái niệm", "NIVO là organization; NIVO OS là product direction được giải thích trên canonical public site.", [card("Company", "Sở hữu identity, relationship và nguồn công khai."), card("Product", "Sở hữu câu hỏi về operating model.")]), // vn-ok: approved visitor copy
      section("02 — Direction", "Xây cho tổ chức AI-native", "NIVO tập trung vào trách nhiệm có context, evidence và outcome kiểm chứng được.", [card("Human Leads", "Giữ mục tiêu và quyết định."), card("AI Operates", "Tăng năng lực thực thi trong boundary.")]), // vn-ok: approved visitor copy
      section("03 — Current evidence", "Chỉ công khai điều có nguồn", "Company không thêm customer logo, testimonial, metric hay certification khi chưa có canonical evidence.", [card("Truth state", "Mỗi claim nhạy cảm cần trạng thái và owner."), card("Review", "Nội dung stale hoặc unsupported bị loại khỏi projection.")]), // vn-ok: approved visitor copy
      section("04 — Operating principles", "Trách nhiệm là cách NIVO làm việc", "Context, owner, evidence và verified outcome là nguyên tắc xuyên suốt.", [card("Ownership", "Không có concept không có owner."), card("Learning", "Outcome được dùng để cải thiện vòng sau.")]), // vn-ok: approved visitor copy
      section("05 — People", "Quan hệ bắt đầu từ mục đích", "Visitor không bị yêu cầu điền thông tin trước khi biết mình đang tìm gì.", [card("Product", "Tìm hiểu sản phẩm qua canonical routes."), card("Partnership", "Chọn partnership khi có đề xuất cụ thể.")]), // vn-ok: approved visitor copy
      section("06 — Trust", "Niềm tin không đến từ lời kể", "Trust cần được xây từ điều có thể xem lại, không từ ngôn ngữ tuyệt đối.", [card("Evidence", "Dấu vết giúp claim được kiểm tra."), card("Qualification", "Không chắc chắn được nói ra như giới hạn.")]), // vn-ok: approved visitor copy
      section("07 — Ecosystem", "Quan hệ có boundary", "Ecosystem được mô tả theo role và trạng thái, không ngụ ý endorsement.", [card("Future · Qualified", "Định hướng tương lai được đánh dấu."), card("Owner", "Mỗi relation có route sở hữu.")]), // vn-ok: approved visitor copy
      section("08 — Public boundary", "Website công khai không phải console", "Company page giữ visitor ở nivo.vn và chỉ định tuyến tới authenticated boundary khi cần.", [card("Public", "Giải thích và điều hướng."), card("Authenticated", "app.nivo.vn sở hữu operation.")]), // vn-ok: approved visitor copy
      section("09 — Next", "Chọn nơi câu hỏi được trả lời tốt nhất", "Company dẫn tới NIVO OS, Trust, Ecosystem hoặc Contact theo user job.", [card("Learn", "Đọc canonical explanation."), card("Relate", "Chọn một trong sáu intent.")]) // vn-ok: approved visitor copy
    ] // vn-ok: approved visitor copy
  }, // vn-ok: approved visitor copy
  "trust": { // vn-ok: approved visitor copy
    eyebrow: "TRUST", title: "Trust được tạo từ điều có thể kiểm chứng.", // vn-ok: approved visitor copy
    lede: "Trust là cách NIVO nói rõ source, owner, trạng thái và giới hạn của claim trên public site.", // vn-ok: approved visitor copy
    sections: [ // vn-ok: approved visitor copy
      section("01 — Source", "Claim có nguồn", "Mỗi nội dung truth-sensitive cần một owner và nguồn hiện tại trước khi render.", [card("Canonical", "Một khái niệm có một owner chính."), card("Traceable", "Visitor có thể lần theo context liên quan.")]), // vn-ok: approved visitor copy
      section("02 — State", "Current không giống Future", "Current, Verified, Building, Experimental, Directional, Research, Future, Target và Long-Term phải được phân biệt.", [card("Visible state", "Trạng thái nằm cạnh claim."), card("No ambiguity", "Không dùng layout để làm mờ giới hạn.")]), // vn-ok: approved visitor copy
      section("03 — Evidence", "Bằng chứng nói điều gì?", "Evidence cho biết điều đã xảy ra hoặc được kiểm tra; nó không tự mở rộng thành claim mới.", [card("Observed", "Phân biệt quan sát với diễn giải."), card("Verified", "Nêu điều kiện xác nhận.")]), // vn-ok: approved visitor copy
      section("04 — Review", "Stale content rời khỏi projection", "Nội dung hết hạn, unsupported hoặc thiếu permission không được giữ lại chỉ để đủ section.", [card("Remove", "Thiếu authority thì ẩn block phụ thuộc."), card("Re-review", "Thay đổi nguồn kéo theo xem lại consumer.")]), // vn-ok: approved visitor copy
      section("05 — Boundary", "Trust không phải security hay entitlement", "Public trust language không cấp quyền, không thay thế authentication và không giả lập control.", [card("Public", "Giải thích điều có thể biết."), card("Product", "Operation thuộc authenticated boundary.")]), // vn-ok: approved visitor copy
      section("06 — Relationship", "Minh bạch trước khi yêu cầu liên hệ", "Contact nói rõ mục đích và chỉ thu thập tối thiểu sau khi chọn intent.", [card("Six intents", "Bộ intent cố định giúp routing có nghĩa."), card("Minimal", "Không ép email khi chưa xác định job.")]), // vn-ok: approved visitor copy
      section("07 — Next", "Trust dẫn về canonical owner", "Từ Trust, visitor tiếp tục đến route trả lời câu hỏi cụ thể hoặc dừng mà không chịu áp lực chuyển đổi.", [card("Understand", "Đọc System of Responsibility."), card("Relate", "Chọn intent phù hợp nếu cần người hỗ trợ.")]) // vn-ok: approved visitor copy
    ] // vn-ok: approved visitor copy
  }, // vn-ok: approved visitor copy
  "contact": { // vn-ok: approved visitor copy
    eyebrow: "CONTACT", title: "Bắt đầu một mối quan hệ có mục đích.", // vn-ok: approved visitor copy
    lede: "Chọn đúng intent trước khi chia sẻ thông tin. Contact định tuyến đến owner phù hợp và không thay thế các câu trả lời đã có trên site.", // vn-ok: approved visitor copy
    sections: [ // vn-ok: approved visitor copy
      section("01 — Choose", "Sáu intent canonical", "Product understanding, commercial evaluation, implementation, partnership, press and research, hoặc other.", [card("Product understanding", "Cần hiểu NIVO OS, responsibility hoặc applications."), card("Commercial evaluation", "Cần xác nhận giá trị, phạm vi hoặc điều khoản.")]), // vn-ok: approved visitor copy
      section("02 — Route", "Câu hỏi hiện có đi trước relationship request", "Nếu canonical page đã trả lời job, visitor được định tuyến trực tiếp thay vì bị yêu cầu liên hệ.", [card("Learn first", "NIVO OS, Pricing và Trust giữ các câu trả lời tương ứng."), card("Human route", "Contact dành cho phần cần phối hợp.")]), // vn-ok: approved visitor copy
      section("03 — Minimal data", "Chỉ hỏi điều cần cho bước tiếp theo", "Intent được xác nhận trước khi thu thập dữ liệu không cần thiết.", [card("Intent", "Query value phải nằm trong sáu giá trị được duyệt."), card("Email", "Email là tùy chọn trong bước chọn intent.")]), // vn-ok: approved visitor copy
      section("04 — Safety", "Giá trị lạ không tạo route mới", "Unknown hoặc malformed intent trở về trạng thái chọn intent an toàn.", [card("No side effect", "Query không tự tạo relationship request."), card("Recovery", "Visitor vẫn giữ được canonical navigation.")]), // vn-ok: approved visitor copy
      section("05 — Next", "Một cuộc trao đổi, một mục đích", "Sau khi chọn intent, visitor biết mình đang mở loại conversation nào và có thể quay lại đọc tiếp.", [card("Clear handoff", "Owner nhận được context đúng với mục đích."), card("Respectful exit", "Không ép gửi khi visitor chưa sẵn sàng.")]) // vn-ok: approved visitor copy
    ] // vn-ok: approved visitor copy
  } // vn-ok: approved visitor copy
}; // vn-ok: approved visitor copy
 // vn-ok: approved visitor copy
/** Renders the documented, route-owned public content projection. */ // vn-ok: approved visitor copy
export const CanonicalPage = (props: CanonicalPageProps) => { // vn-ok: approved visitor copy
  const model = ROUTES[props.route]; // vn-ok: approved visitor copy
  return <main className={C.canonicalPage} aria-labelledby="canonical-title"><div className={C.canonicalShell}><TextAction href={routePath("/")} appearance="route">← NIVO</TextAction><p className={C.eyebrow}>{model.eyebrow}</p><Heading level={1}>{model.title}</Heading><p id="canonical-title" className={C.canonicalLede}>{model.lede}</p><div className={C.canonicalSections}>{model.sections.map((item) => <section className={C.canonicalSection} key={item.title}><p className={C.canonicalSectionLabel}>{item.label}</p><Heading level={2}>{item.title}</Heading><p>{item.body}</p><div className={C.canonicalGrid}>{item.cards.map((itemCard) => <article className={C.canonicalCard} key={itemCard.title}><Heading level={3}>{itemCard.title}</Heading><p>{itemCard.body}</p></article>)}</div></section>)}</div>{props.route === "contact" ? <ContactIntentForm selectedIntent={props.selectedIntent} /> : <div className={C.canonicalActions}><TextAction href={routePath("/contact?intent=product-understanding")} appearance="route">Choose a next step</TextAction><TextAction href={routePath("/ideas")} appearance="route">Explore Ideas</TextAction></div>}</div></main>; // vn-ok: approved visitor copy
}; // vn-ok: approved visitor copy
 // vn-ok: approved visitor copy
const ContactIntentForm = (props: ContactIntentFormProps) => <form className={C.contactForm} action="/contact" method="get"><label htmlFor="intent">Contact intent</label><select id="intent" name="intent" defaultValue={CONTACT_INTENTS.includes(props.selectedIntent as typeof CONTACT_INTENTS[number]) ? props.selectedIntent : ""}><option value="" disabled>Choose an intent</option>{CONTACT_INTENTS.map((intent) => <option key={intent} value={intent}>{intent.replaceAll("-", " ")}</option>)}</select><label htmlFor="email">Email (optional)</label><input id="email" name="email" type="email" placeholder="you@example.com" /><button className={C.canonicalButton} type="submit">Continue safely</button></form>; // vn-ok: approved visitor copy
 // vn-ok: approved visitor copy
