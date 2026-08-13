/*
 * Direction lab - the provisioning page in apps/app, three directions.
 *
 * DIRECTIONAL, NOT AN APPLY BASELINE. This markup exists to make one product decision visible:
 * how a page holds TWO resource kinds whose state machines are not the same shape. It is not the
 * source Apply will port, and Preview must rebuild the winner from real StarCi owners.
 *
 * The states are not invented. They are the values nivo-backend actually stores:
 *   ExpertProvisionStatus  not_provisioned | provisioning | awaiting_dns | ready | failed
 *   AgentWorkspaceAction   suspend (from active) | resume (from suspended)
 *                          | retry_provision (from failed) | mark_failed (from provisioning|active)
 *
 * The sharpest fact in that evidence, and the reason these three directions differ at all:
 * `awaiting_dns` READS like a fault and is not one. Its own enum comment says "Not an error and not
 * retryable by us" - the customer has to add a DNS record. A page that files it under problems
 * invites a retry that cannot work; a page that files it under healthy hides the one thing blocking
 * a launch. Where that single state goes is the decision.
 *
 * Every value below is a labelled fixture. Nothing here is customer data.
 */

const CSS = `
.k{--bg:#fff;--surface:#f7f7f9;--line:#e6e6ec;--ink:#101014;--dim:#6b6b76;--acc:#0485f7;
  --ok:#067647;--okbg:#ecfdf3;--warn:#b54708;--warnbg:#fffaeb;--bad:#b42318;--badbg:#fef3f2;--busy:#175cd3;--busybg:#eff8ff;
  background:var(--bg);color:var(--ink);font:14px/1.55 ui-sans-serif,system-ui,sans-serif;border-radius:14px;overflow:hidden}
.k *{box-sizing:border-box}
.k .s{padding:18px 20px;border-bottom:1px solid var(--line)}
.k .s:last-child{border-bottom:0}
.k .s.alt{background:var(--surface)}
.k h1{font-size:22px;font-weight:680;margin:0 0 4px}
.k h2{font-size:15px;font-weight:640;margin:0 0 10px}
.k p{margin:0;color:var(--dim)}
.k .tag{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);display:block;margin-bottom:8px}
.k .btn{border:0;border-radius:9px;padding:8px 13px;background:var(--acc);color:#fff;font:inherit;font-size:13px;font-weight:620;cursor:pointer}
.k .btn.sec{background:transparent;color:var(--ink);border:1px solid var(--line);font-weight:550}
.k .btn.sm{padding:6px 10px;font-size:12px}
.k .head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.k .card{border:1px solid var(--line);border-radius:12px;background:var(--bg);overflow:hidden}
.k .row{display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid var(--line)}
.k .row:last-child{border-bottom:0}
.k .row .grow{flex:1;min-width:0}
.k .nm{font-weight:600;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.k .sub{font-size:12px;color:var(--dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.k .tile{width:32px;height:32px;border-radius:9px;background:var(--surface);border:1px solid var(--line);display:grid;place-items:center;font-size:12px;font-weight:640;color:var(--dim);flex:none}
.k .b{font-size:11px;font-weight:620;border-radius:999px;padding:3px 9px;white-space:nowrap;flex:none}
.k .b.ok{background:var(--okbg);color:var(--ok)}
.k .b.warn{background:var(--warnbg);color:var(--warn)}
.k .b.bad{background:var(--badbg);color:var(--bad)}
.k .b.busy{background:var(--busybg);color:var(--busy)}
.k .b.idle{background:var(--surface);color:var(--dim)}
.k .why{font-size:12px;color:var(--dim);margin-top:3px}
.k .why b{color:var(--ink);font-weight:600}
.k .queue{border:1px solid #fdba74;background:#fff7ed;border-radius:12px;overflow:hidden}
.k .queue .qh{padding:11px 14px;border-bottom:1px solid #fdba74;font-size:12.5px;font-weight:640;color:#9a3412}
.k .queue .row{border-bottom-color:#fde3c8}
.k .tabs{display:flex;gap:2px;border-bottom:1px solid var(--line);margin-bottom:12px}
.k .tab{padding:8px 12px;font-size:13px;color:var(--dim);border-bottom:2px solid transparent;cursor:pointer}
.k .tab.on{color:var(--ink);font-weight:620;border-bottom-color:var(--acc)}
.k .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}
.k .st{border:1px solid var(--line);border-radius:11px;padding:10px 12px}
.k .st .n{font-size:19px;font-weight:680}
.k .st .l{font-size:11.5px;color:var(--dim)}
.k .empty{border:1px dashed var(--line);border-radius:12px;padding:26px;text-align:center}
.k .empty h2{margin-bottom:4px}
.k .fx{font-size:10px;color:var(--dim);border:1px dashed var(--line);border-radius:6px;padding:1px 6px;display:inline-block;margin-top:10px}
.k .kind{font-size:10.5px;color:var(--dim);border:1px solid var(--line);border-radius:5px;padding:1px 5px;flex:none}
.k .bar{height:4px;border-radius:999px;background:var(--surface);overflow:hidden;margin-top:6px}
.k .bar i{display:block;height:100%;background:var(--busy);width:45%}
`

/* ---- fixtures, one per real backend state --------------------------------------------------- */

const SITES = {
  ready:    { nm: "hocvien-minhtue.nivo.vn", sub: "Site chuyên gia · gói Pro", b: "ok",   bl: "Đang chạy" },
  dns:      { nm: "minhtue.com",             sub: "Tên miền riêng · chờ bản ghi DNS", b: "warn", bl: "Chờ DNS" },
  busy:     { nm: "thaotran.nivo.vn",        sub: "Đang cài chart · bước 2/4", b: "busy", bl: "Đang cấp phát" },
  failed:   { nm: "danglinh.nivo.vn",        sub: "Bootstrap Keycloak thất bại", b: "bad", bl: "Thất bại" },
  none:     { nm: "quangvu.nivo.vn",         sub: "Chưa từng cấp phát", b: "idle", bl: "Chưa cấp phát" },
}
const PODS = {
  active:   { nm: "Workspace của Minh Tuệ", sub: "3 agent · 12 automation", b: "ok",   bl: "Hoạt động" },
  susp:     { nm: "Workspace thử nghiệm",   sub: "Tạm dừng 4 ngày trước",   b: "idle", bl: "Tạm dừng" },
  busy:     { nm: "Workspace của Thảo",     sub: "Đang dựng pod",           b: "busy", bl: "Đang cấp phát" },
  failed:   { nm: "Workspace của Đăng",     sub: "Pod không khởi động",     b: "bad",  bl: "Thất bại" },
}

const row = (r, kind, action, why) => `<div class="row">
  <span class="tile">${kind === "site" ? "S" : "W"}</span>
  <span class="grow"><span class="nm">${r.nm}</span><span class="sub">${r.sub}</span>${why ? `<div class="why">${why}</div>` : ""}</span>
  <span class="b ${r.b}">${r.bl}</span>
  ${action ? `<button class="btn sec sm">${action}</button>` : ""}
</div>`

const rowK = (r, kind, action) => `<div class="row">
  <span class="tile">${kind === "site" ? "S" : "W"}</span>
  <span class="grow"><span class="nm">${r.nm}</span><span class="sub">${r.sub}</span></span>
  <span class="kind">${kind === "site" ? "Site" : "Workspace"}</span>
  <span class="b ${r.b}">${r.bl}</span>
  ${action ? `<button class="btn sec sm">${action}</button>` : ""}
</div>`

const shell = (inner) => `<div class="k">${inner}</div>`
const header = (sub, cta) => `<div class="s"><div class="head"><div><h1>Cấp phát</h1><p>${sub}</p></div>
  <button class="btn">${cta}</button></div></div>`

/* ---- A · hàng đợi xử lý dẫn trước ------------------------------------------------------------ */

const A = (variant) => {
  if (variant === "empty") return shell(header("Chưa có tài nguyên nào.", "Cấp phát site đầu tiên") +
    `<div class="s"><div class="empty"><h2>Chưa có gì để trông</h2><p>Cấp phát site chuyên gia hoặc workspace agent để bắt đầu.</p>
     <div style="margin-top:12px"><button class="btn">Cấp phát site</button> <button class="btn sec">Tạo workspace</button></div></div>
     <span class="fx">fixture · rỗng hoàn toàn</span></div>`)
  if (variant === "calm") return shell(header("Mọi thứ đang chạy. Không có việc nào cần bạn.", "Cấp phát mới") +
    `<div class="s"><span class="tag">không có hàng đợi</span>
     <div class="card">${row(SITES.ready, "site", "Mở")}${row(PODS.active, "pod", "Mở")}</div>
     <span class="fx">fixture · trạng thái yên</span></div>`)
  return shell(header("2 việc đang chờ bạn, 3 tài nguyên đang chạy.", "Cấp phát mới") +
    `<div class="s"><div class="queue"><div class="qh">Cần bạn xử lý</div>
      ${row(SITES.dns, "site", "Xem bản ghi DNS", "Nivo không tự làm được bước này — <b>bạn</b> phải thêm bản ghi tại nhà cung cấp tên miền.")}
      ${row(SITES.failed, "site", "Thử lại", "Bootstrap Keycloak thất bại ở bước 3. Câu lỗi lấy từ <b>provisionError</b>.")}
     </div></div>
     <div class="s alt"><span class="tag">đang chạy</span>
      <div class="card">${row(SITES.ready, "site", "Mở")}${row(PODS.active, "pod", "Tạm dừng")}${row(SITES.busy, "site", "")}</div>
      <span class="fx">fixture · hàng đợi 2 việc</span></div>`)
}

/* ---- B · hai kệ, theo loại tài nguyên -------------------------------------------------------- */

const B = (variant) => {
  if (variant === "empty") return shell(header("Chưa có tài nguyên nào.", "Cấp phát mới") +
    `<div class="s"><h2>Site chuyên gia</h2><div class="empty"><p>Chưa có site nào.</p><div style="margin-top:10px"><button class="btn sec">Cấp phát site</button></div></div></div>
     <div class="s alt"><h2>Workspace agent</h2><div class="empty"><p>Chưa có workspace nào.</p><div style="margin-top:10px"><button class="btn sec">Tạo workspace</button></div></div>
     <span class="fx">fixture · hai kệ cùng rỗng</span></div>`)
  if (variant === "dnsonly") return shell(header("1 site chờ DNS.", "Cấp phát mới") +
    `<div class="s"><h2>Site chuyên gia</h2><div class="card">${row(SITES.dns, "site", "Xem bản ghi DNS")}${row(SITES.ready, "site", "Mở")}</div></div>
     <div class="s alt"><h2>Workspace agent</h2><div class="card">${row(PODS.active, "pod", "Tạm dừng")}</div>
     <span class="fx">fixture · chờ DNS nằm trong kệ, không nổi lên đầu trang</span></div>`)
  return shell(header("2 site, 2 workspace.", "Cấp phát mới") +
    `<div class="s"><h2>Site chuyên gia</h2>
      <div class="card">${row(SITES.ready, "site", "Mở")}${row(SITES.dns, "site", "Xem bản ghi DNS")}${row(SITES.failed, "site", "Thử lại")}${row(SITES.none, "site", "Cấp phát")}</div></div>
     <div class="s alt"><h2>Workspace agent</h2>
      <div class="card">${row(PODS.active, "pod", "Tạm dừng")}${row(PODS.susp, "pod", "Tiếp tục")}${row(PODS.failed, "pod", "Thử lại")}</div>
      <span class="fx">fixture · đủ trạng thái hai bên</span></div>`)
}

/* ---- C · một hạm đội, lọc theo loại ---------------------------------------------------------- */

const C = (variant) => {
  const tabs = (on) => `<div class="tabs">${["Tất cả", "Site", "Workspace"].map((t, i) =>
    `<span class="tab${i === on ? " on" : ""}">${t}</span>`).join("")}</div>`
  if (variant === "empty") return shell(header("Chưa có tài nguyên nào.", "Cấp phát mới") +
    `<div class="s">${tabs(0)}<div class="empty"><h2>Hạm đội trống</h2><p>Một danh sách rỗng không nói được nên cấp phát loại nào trước.</p>
     <div style="margin-top:12px"><button class="btn">Cấp phát site</button> <button class="btn sec">Tạo workspace</button></div></div>
     <span class="fx">fixture · rỗng · bộ lọc vô nghĩa khi chưa có gì</span></div>`)
  if (variant === "filtered") return shell(header("Lọc còn Site.", "Cấp phát mới") +
    `<div class="s">${tabs(1)}
     <div class="card">${rowK(SITES.ready, "site", "Mở")}${rowK(SITES.dns, "site", "Xem DNS")}${rowK(SITES.failed, "site", "Thử lại")}</div>
     <span class="fx">fixture · đã lọc</span></div>`)
  return shell(header("7 tài nguyên.", "Cấp phát mới") +
    `<div class="s"><div class="stats">
      <div class="st"><div class="n">3</div><div class="l">Đang chạy</div></div>
      <div class="st"><div class="n">2</div><div class="l">Đang cấp phát</div></div>
      <div class="st"><div class="n">1</div><div class="l">Chờ DNS</div></div>
      <div class="st"><div class="n">2</div><div class="l">Thất bại</div></div></div>
     ${tabs(0)}
     <div class="card">${rowK(SITES.ready, "site", "Mở")}${rowK(PODS.active, "pod", "Tạm dừng")}${rowK(SITES.dns, "site", "Xem DNS")}${rowK(PODS.busy, "pod", "")}${rowK(SITES.failed, "site", "Thử lại")}${rowK(PODS.susp, "pod", "Tiếp tục")}${rowK(SITES.none, "site", "Cấp phát")}</div>
     <span class="fx">fixture · hạm đội trộn hai loại</span></div>`)
}

/* ---- shared records -------------------------------------------------------------------------- */

const OWNER_STATES = [
  { ownerId: "page-provisioning", state: "empty", coverage: "rendered", scenarioId: "empty", evidence: "my-expert-sites + my-agent-workspace both return []" },
  { ownerId: "page-provisioning", state: "populated", coverage: "rendered", scenarioId: "default", evidence: "both queries return rows" },
  { ownerId: "page-provisioning", state: "loading", coverage: "deferred-to-preview", scenarioId: null, evidence: "skeleton shape is not a product decision" },
  { ownerId: "page-provisioning", state: "error", coverage: "deferred-to-preview", scenarioId: null, evidence: "query failure, distinct from a resource in state failed" },
  { ownerId: "resource-row", state: "not_provisioned", coverage: "rendered", scenarioId: "default", evidence: "ExpertProvisionStatus.NotProvisioned" },
  { ownerId: "resource-row", state: "provisioning", coverage: "rendered", scenarioId: "default", evidence: "ExpertProvisionStatus.Provisioning" },
  { ownerId: "resource-row", state: "awaiting_dns", coverage: "rendered", scenarioId: "default", evidence: "ExpertProvisionStatus.AwaitingDns — customer action, not retryable" },
  { ownerId: "resource-row", state: "ready", coverage: "rendered", scenarioId: "default", evidence: "ExpertProvisionStatus.Ready" },
  { ownerId: "resource-row", state: "failed", coverage: "rendered", scenarioId: "default", evidence: "ExpertProvisionStatus.Failed + provisionError sentence" },
  { ownerId: "resource-row", state: "active", coverage: "rendered", scenarioId: "default", evidence: "AgentWorkspaceAction.Suspend is valid from active" },
  { ownerId: "resource-row", state: "suspended", coverage: "rendered", scenarioId: "default", evidence: "AgentWorkspaceAction.Resume is valid from suspended" },
]

const CONTRACTS = [
  { key: "title-with-end-action", why: "a heading that owns one trailing action — the page header and each shelf header" },
  { key: "glyph-title-fact-row", why: "glyph, then identity, then a trailing fact — the shape every resource row already is" },
  { key: "label-value-row", why: "a label paired with its value, used for the status fact" },
  { key: "stacked-sections", why: "sections stacked with owned rhythm between them" },
  { key: "empty-notice-card", why: "an empty state that is a surface, not a bare sentence" },
  { key: "dual-tabs-toolbar", why: "two tab groups in one toolbar — only C needs it" },
  { key: "stacked-stat-rows", why: "a run of stat rows — only C's counter strip" },
]

const ASSUMPTIONS = [
  "The signed-in persona is the expert (nivo's customer), who owns both their sites and their workspaces.",
  "Both queries are viewer-scoped: my-expert-sites and my-agent-workspace return only this user's rows.",
  "A row's primary action is determined by its state, not by the user's role.",
]

const UNKNOWNS = [
  "Whether one user can hold more than one agent workspace. The query is named my-agent-workspace (singular) but returns [AgentWorkspaceEntity]. The name and the contract disagree; the contract was believed.",
  "What the DNS instruction screen actually shows. my-expert-site-deployment exists but its fields were not read in this run.",
  "Whether mark_failed should be reachable from this page at all. Its enum comment calls it an interim, owner-triggered producer of failed because no provisioning watcher exists yet.",
  "Where 'dashboard expert' belongs. page-dashboard for apps/app is already owned by case-d1 and apps/expert has no pages; not planned here.",
]

window.STARCI_REVIEW = {
  title: "Trang cấp phát — site chuyên gia và workspace agent (apps/app)",
  phase: "plan",
  deliveryMode: "single",
  mode: "creative",
  caseId: "case-prov",
  workItems: [{ id: "page-provisioning", scope: "page", target: "nivo-fe/apps/app — trang cấp phát" }],
  evidence: [
    { source: "nivo-backend ExpertProvisionStatus", claim: "not_provisioned | provisioning | awaiting_dns | ready | failed; provisionError carries the failure sentence." },
    { source: "nivo-backend ExpertProvisionStatus.AwaitingDns", claim: "\"Not an error and not retryable by us\" — the customer must add the DNS record." },
    { source: "nivo-backend AgentWorkspaceAction", claim: "suspend from active, resume from suspended, retry_provision from failed, mark_failed from provisioning|active." },
    { source: "nivo-backend queries", claim: "my-expert-sites and my-agent-workspace both return arrays scoped to the viewer." },
    { source: "nivo-fe packages/ui", claim: "SurfaceListCard, SurfaceCard, StatRow, EmptyNotice, DualTabsToolbar and Badge exist; there are NO blocks yet, so every domain-aware owner here is new." },
  ],
  cases: [
    {
      id: "dir-a-triage",
      title: "A · Hàng đợi xử lý dẫn trước",
      posture: "bold",
      css: CSS,
      thesis: "Trang mở bằng những việc CẦN NGƯỜI, phần đang chạy nằm dưới. Chờ DNS và Thất bại đứng cùng một hàng đợi nhưng mang hai câu khác nhau: một cái nói việc của bạn, một cái nói lỗi của chúng tôi.",
      distinction: "Thứ tự đọc do trạng thái quyết định, không do loại tài nguyên. Khi không có việc gì, hàng đợi biến mất hoàn toàn thay vì hiện rỗng.",
      primaryCta: "Xử lý việc đang chặn (theo hàng)",
      readingOrder: "hàng đợi → đang chạy → cấp phát mới",
      states: [
        { id: "default", label: "Có 2 việc chờ", html: A() },
        { id: "calm", label: "Không còn việc nào", html: A("calm") },
        { id: "empty", label: "Chưa có tài nguyên", html: A("empty") },
      ],
      stateCoverage: OWNER_STATES,
      blockTree: "PageProvisioning\n├── ProvisioningActionQueue      (block MỚI)\n│   └── ResourceActionRow          (block MỚI)\n└── ProvisioningInventoryList     (block MỚI)\n    └── ResourceRow                (block MỚI)",
      contracts: CONTRACTS.filter((c) => c.key !== "dual-tabs-toolbar" && c.key !== "stacked-stat-rows"),
      proposals: [
        { kind: "new-owner", id: "ProvisioningActionQueue", why: "Không owner nào hiện có mang nghĩa 'việc đang chặn'. SurfaceListCard là vỏ, không phải ngữ nghĩa hàng đợi." },
        { kind: "new-owner", id: "ResourceActionRow", why: "Hàng mang thêm một câu giải thích vì sao nó nằm trong hàng đợi; glyph-title-fact-row không có khe cho câu đó." },
        { kind: "api-extension", id: "Badge tone", why: "Cần tone cảnh báo tách khỏi tone lỗi, vì awaiting_dns KHÔNG phải lỗi. Kiểm tra Badge đã có prop tone trước khi thêm." },
      ],
      backendEnablers: [],
      assumptions: ASSUMPTIONS,
      unknowns: UNKNOWNS,
      benefit: "Người dùng thấy ngay thứ duy nhất đang chặn việc lên sóng, và không bị mời bấm 'thử lại' cho một thứ chúng ta không thử lại được.",
      tradeoff: "Một tài nguyên nhảy vị trí khi đổi trạng thái. Với người có nhiều site, danh sách không đứng yên.",
      rejectionRisk: "Nếu phần lớn thời gian không có việc gì, nửa trên của trang biến mất và trang trông như thiếu.",
    },
    {
      id: "dir-b-shelves",
      title: "B · Hai kệ theo loại tài nguyên",
      posture: "conservative",
      css: CSS,
      thesis: "Site chuyên gia và Workspace agent là hai thứ khác nhau, có vòng đời khác nhau, nên nằm ở hai kệ có tiêu đề riêng. Trạng thái là một dữ kiện trên hàng, không phải tiêu đề của trang.",
      distinction: "Vị trí một tài nguyên KHÔNG đổi khi trạng thái đổi. Đây là hướng ít rủi ro nhất và gần nhất với vốn từ đang có.",
      primaryCta: "Cấp phát mới",
      readingOrder: "site → workspace → hành động theo hàng",
      states: [
        { id: "default", label: "Đủ trạng thái hai kệ", html: B() },
        { id: "dnsonly", label: "Chỉ 1 site chờ DNS", html: B("dnsonly") },
        { id: "empty", label: "Hai kệ cùng rỗng", html: B("empty") },
      ],
      stateCoverage: OWNER_STATES,
      blockTree: "PageProvisioning\n├── ExpertSiteShelf               (block MỚI)\n│   └── ResourceRow                (block MỚI)\n└── AgentWorkspaceShelf           (block MỚI)\n    └── ResourceRow                (block MỚI)",
      contracts: CONTRACTS.filter((c) => c.key !== "dual-tabs-toolbar" && c.key !== "stacked-stat-rows"),
      proposals: [
        { kind: "reuse", id: "SurfaceListCard", why: "Mỗi kệ là một danh sách trên một mặt nền — đúng thứ SurfaceListCard đã làm." },
        { kind: "reuse", id: "EmptyNotice", why: "Kệ rỗng dùng lại composite sẵn có thay vì viết câu trần." },
        { kind: "new-owner", id: "ResourceRow", why: "Hàng biết trạng thái nghiệp vụ và hành động hợp lệ theo trạng thái đó; packages/ui chưa có block nào." },
      ],
      backendEnablers: [],
      assumptions: ASSUMPTIONS,
      unknowns: UNKNOWNS,
      benefit: "Đọc được ngay khi chỉ có một site, và không bao giờ xáo trộn. Ít owner mới nhất trong ba hướng.",
      tradeoff: "Chờ DNS nằm lẫn trong kệ. Người có nhiều site phải tự dò ra thứ đang chặn.",
      rejectionRisk: "Với người chỉ có đúng một site và một workspace, hai kệ có tiêu đề là hai khung cho hai dòng — nặng nề so với nội dung.",
    },
    {
      id: "dir-c-fleet",
      title: "C · Một hạm đội, lọc theo loại",
      posture: "balanced",
      css: CSS,
      thesis: "Hai loại tài nguyên được chuẩn hoá về một hàng chung (tên, loại, trạng thái, hành động) trong một danh sách duy nhất, kèm dải đếm theo trạng thái ở trên.",
      distinction: "Đánh cược rằng người dùng nghĩ theo 'hạm đội của tôi' chứ không theo loại tài nguyên. Mật độ cao nhất, hợp với người có nhiều tài nguyên.",
      primaryCta: "Cấp phát mới",
      readingOrder: "dải đếm → bộ lọc → danh sách",
      states: [
        { id: "default", label: "7 tài nguyên trộn", html: C() },
        { id: "filtered", label: "Đã lọc còn Site", html: C("filtered") },
        { id: "empty", label: "Hạm đội trống", html: C("empty") },
      ],
      stateCoverage: OWNER_STATES,
      blockTree: "PageProvisioning\n├── FleetStatusStrip              (block MỚI)\n├── FleetKindFilter               (dùng lại DualTabsToolbar?)\n└── FleetList                     (block MỚI)\n    └── FleetRow                   (block MỚI)",
      contracts: CONTRACTS,
      proposals: [
        { kind: "reuse", id: "StatRow / stacked-stat-rows", why: "Dải đếm là một run stat row đã có vốn từ." },
        { kind: "reuse", id: "underlined-tab-strip → ExtendedTabs", why: "DualTabsToolbar bị loại: nó bắt buộc CẢ leading lẫn trailing (toolbar hai trục đóng), còn C chỉ có một trục. Contract underlined-tab-strip mở đúng một khe tabs cho leaf extended-tabs." },
        { kind: "new-owner", id: "FleetRow", why: "Hàng phải mang thêm khe 'loại tài nguyên' mà glyph-title-fact-row không có." },
      ],
      backendEnablers: [
        { id: "counts-by-status", why: "Dải đếm cần tổng theo trạng thái. Hôm nay phải tải hết hai danh sách rồi đếm ở client — chấp nhận được khi ít, sai khi phân trang.", bounded: true },
      ],
      assumptions: ASSUMPTIONS,
      unknowns: UNKNOWNS,
      benefit: "Một chỗ duy nhất để nhìn mọi thứ, quét nhanh nhất khi số lượng lớn.",
      tradeoff: "Chuẩn hoá làm mất sự khác biệt thật: suspend/resume chỉ có ở workspace, chờ DNS chỉ có ở site. Một hàng chung dễ hứa những hành động không tồn tại.",
      rejectionRisk: "Dải đếm cần một enabler backend; nếu không làm, con số sẽ nói dối ngay khi có phân trang.",
    },
  ],
}
