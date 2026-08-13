/*
 * Preview lab - nivo app: sidebar chrome, bảng điều khiển, đăng nhập.
 *
 * ONE CASE. The plan already chose direction-d; this lab optimises that one direction and renders
 * every state its three owners can enter. It does not reopen A, B or C.
 *
 * THE SIDEBAR IS A CHUYỂN THỂ OF A NAMED REFERENCE, not a new invention:
 * starci-academy/src/components/blocks/navigation/CollapsibleSidebar (16rem open, 4rem collapsed,
 * collapse in place with no overlay, flag persisted in localStorage), SidebarNavItem (min-h-9,
 * gap-2, rounded-large, px-3 py-2; collapsed mx-auto w-fit justify-center gap-0 px-2) and
 * LearnSidebar (clusters in a fixed group order divided by a full-width rule, trailing badge in two
 * tones, hidden below lg where a drawer takes over). The reference's `topSlot` is what carries the
 * primary action here.
 *
 * EVERY FIGURE IS A LABELLED FIXTURE. The field names are real - read from the nivo-backend schema
 * and recorded in plan-record.json - but no value came from a real account.
 */

const CSS = `
.k{--bg:#ffffff;--surface:#ffffff;--muted-bg:#f4f4f5;--line:#e4e4e7;--ink:#18181b;--dim:#71717a;--acc:#2563eb;--accfg:#ffffff;--acc-soft:#eff6ff;--ok:#15803d;--ok-soft:#dcfce7;--warn:#b45309;--warn-soft:#fef3c7;--danger:#b91c1c;--danger-soft:#fee2e2;--skel:#e9e9ec;
 background:var(--bg);color:var(--ink);font:14px/1.55 ui-sans-serif,system-ui,-apple-system,sans-serif;border:1px solid var(--line);border-radius:14px;overflow:hidden;position:relative}
.k.dark{--bg:#09090b;--surface:#18181b;--muted-bg:#121215;--line:#27272a;--ink:#fafafa;--dim:#a1a1aa;--acc:#3b82f6;--acc-soft:#172554;--ok:#4ade80;--ok-soft:#14321f;--warn:#fbbf24;--warn-soft:#38260a;--danger:#f87171;--danger-soft:#3b1414;--skel:#27272a}
.k.m{max-width:390px}
.k *{box-sizing:border-box}
.k .shell{display:flex;align-items:stretch;min-height:560px}

/* chrome — measured from CollapsibleSidebar + SidebarNavItem */
.k .side{width:16rem;flex:0 0 16rem;border-right:1px solid var(--line);background:var(--muted-bg);display:flex;flex-direction:column;transition:width .18s ease}
.k .side.collapsed{width:4rem;flex:0 0 4rem}
.k .side.collapsed .sidelabel{display:none}
.k .side.collapsed .sidehead{flex-direction:column;gap:8px;align-items:center}
.k .side.collapsed .sidelink{margin:0 auto;width:fit-content;justify-content:center;gap:0;padding:8px}
.k .side.collapsed .sidebadge{position:absolute;transform:translate(13px,-11px);padding:0 5px;font-size:10px}
.k .side.collapsed .topslot .btn{width:36px;padding:8px 0;justify-content:center}
.k .side.collapsed .sidefoot{justify-content:center}
.k .sidehead{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:16px 12px 12px}
.k .wordmark{font-weight:700;letter-spacing:-.02em}
.k .sidetoggle{border:1px solid var(--line);background:var(--surface);color:var(--dim);border-radius:8px;width:24px;height:24px;line-height:1;cursor:pointer;font:inherit;font-size:12px;flex:0 0 24px}
.k .topslot{padding:0 12px 12px}
.k .sidenav{display:flex;flex-direction:column;padding:0 8px}
.k .sidegroup{display:flex;flex-direction:column;gap:2px;padding:8px 0;border-top:1px solid var(--line)}
.k .sidegroup:first-child{border-top:0;padding-top:0}
.k .sidelink{position:relative;display:flex;align-items:center;gap:8px;min-height:36px;padding:8px 12px;border-radius:12px;color:var(--dim);font-size:14px;cursor:pointer}
.k .sidelink i{font-style:normal;width:16px;text-align:center;flex:0 0 16px}
.k .sidelink .sidelabel{flex:1;min-width:0}
.k .sidelink.on{background:var(--surface);color:var(--ink);font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,.05)}
.k .sidecount{font-size:12px;color:var(--dim);font-variant-numeric:tabular-nums}
.k .sidefoot{margin-top:auto;display:flex;align-items:center;gap:12px;padding:16px 12px;border-top:1px solid var(--line)}
.k .avatar{width:28px;height:28px;border-radius:999px;background:var(--line);flex:0 0 28px}
.k .shellbody{flex:1;min-width:0;display:flex;flex-direction:column}
.k .topbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 24px;border-bottom:1px solid var(--line)}
.k .pagetitle{margin:0;font-size:18px;font-weight:650;letter-spacing:-.01em}
.k .menubtn{display:none;border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:10px;width:36px;height:36px;font:inherit;cursor:pointer}
.k.m .menubtn{display:inline-flex;align-items:center;justify-content:center}
.k.m .side{display:none}
.k.m .topbar{padding:12px 16px}
.k.m .body{padding:16px}
.k.m .grid2{grid-template-columns:1fr}
.k .scrim{position:absolute;inset:0;background:rgba(9,9,11,.45);display:flex}
.k .drawer{width:16rem;background:var(--muted-bg);border-right:1px solid var(--line);display:flex;flex-direction:column;box-shadow:0 10px 40px rgba(0,0,0,.25)}

/* body */
.k .body{padding:24px;display:flex;flex-direction:column;gap:24px}
.k .sec{display:flex;flex-direction:column;gap:12px}
.k .seclabel{display:flex;align-items:center;justify-content:space-between;gap:12px}
.k .seclabel h2{margin:0;font-size:15px;font-weight:650}
.k .card{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:16px}
.k .card.p0{padding:0}
.k .row{display:flex;align-items:center;gap:12px;padding:16px;border-bottom:1px solid var(--line)}
.k .row:last-child{border-bottom:0}
.k .row .grow{flex:1;min-width:0}
.k .title{font-weight:600}
.k .sub{color:var(--dim);font-size:13px}
.k .num{font-variant-numeric:tabular-nums;font-weight:650}
.k .big{font-size:26px;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.k .chip{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:600;background:var(--muted-bg);color:var(--dim)}
.k .chip.ok{background:var(--ok-soft);color:var(--ok)}
.k .chip.warn{background:var(--warn-soft);color:var(--warn)}
.k .chip.bad{background:var(--danger-soft);color:var(--danger)}
.k .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid transparent;border-radius:10px;padding:8px 14px;font:inherit;font-weight:600;background:var(--acc);color:var(--accfg);cursor:pointer}
.k .btn.sm{padding:5px 10px;font-size:13px;border-radius:8px}
.k .btn.ghost{background:transparent;color:var(--ink);border-color:var(--line)}
.k .btn.full{width:100%}
.k .btn[disabled]{opacity:.6;cursor:not-allowed}
.k .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.k .stat{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--line)}
.k .stat:last-child{border-bottom:0}
.k .empty{display:flex;flex-direction:column;gap:12px;align-items:flex-start;padding:24px;border:1px dashed var(--line);border-radius:14px;background:var(--muted-bg)}
.k .fixture{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--dim)}
.k .sk{display:block;background:var(--skel);border-radius:6px;height:12px}
.k .sk.t{height:14px;width:180px}
.k .sk.s{height:12px;width:280px;margin-top:6px}
.k .sk.n{height:14px;width:64px}
.k .spin{width:14px;height:14px;border-radius:999px;border:2px solid currentColor;border-right-color:transparent;display:inline-block;animation:sp .8s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}

/* auth */
.k .auth{min-height:560px;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--muted-bg)}
.k .authcard{width:100%;max-width:384px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:24px;display:flex;flex-direction:column;gap:16px}
.k .authhead{display:flex;flex-direction:column;gap:6px;text-align:center}
.k .authhead h1{margin:0;font-size:22px;font-weight:700;letter-spacing:-.01em}
.k .oauth{display:flex;flex-direction:column;gap:12px}
.k .or{display:flex;align-items:center;gap:12px;color:var(--dim);font-size:12px}
.k .or:before,.k .or:after{content:"";flex:1;height:1px;background:var(--line)}
.k .form{display:flex;flex-direction:column;gap:12px}
.k .form.closed{display:none}
.k .field{display:flex;flex-direction:column;gap:6px}
.k .field label{font-size:13px;font-weight:600}
.k .field .inp{border:1px solid var(--line);border-radius:10px;padding:10px 12px;background:var(--surface);color:var(--dim)}
.k .field .inp.filled{color:var(--ink)}
.k .field.bad .inp{border-color:var(--danger)}
.k .notice{border-radius:12px;padding:12px;font-size:13px;display:flex;gap:8px;align-items:flex-start}
.k .notice.bad{background:var(--danger-soft);color:var(--danger)}
.k .notice.info{background:var(--acc-soft);color:var(--acc)}
.k .notice.ok{background:var(--ok-soft);color:var(--ok)}
.k .authfoot{display:flex;align-items:center;justify-content:space-between;font-size:13px}
.k .authfoot a{color:var(--acc);text-decoration:none;cursor:pointer}
.k .otp{display:flex;gap:8px;justify-content:center}
.k .otp span{width:40px;height:48px;border:1px solid var(--line);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:650}
.k .otp span.cur{border-color:var(--acc);box-shadow:0 0 0 3px var(--acc-soft)}
.k .frames{display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap}
.k .frames > div{flex:0 1 auto}
`

/* ------------------------------------------------------------------------------------- chrome */

const SIDE_GROUPS = [
    [["Tổng quan", "▦", null], ["Hệ thống", "▤", ["quiet", "3"]], ["Đang dựng", "◐", ["quiet", "1"]]],
    [["Đơn hàng", "▣", null], ["Ví", "◍", null], ["Hoá đơn", "▥", ["warn", "1"]]],
    [["Tên miền", "◈", null], ["Hỗ trợ", "◌", ["warn", "1"]]],
]

const badge = (b) => (b === null ? "" : b[0] === "warn"
    ? `<span class="chip bad sidebadge">${b[1]}</span>`
    : `<span class="sidecount">${b[1]}</span>`)

const navRows = (current) => SIDE_GROUPS.map((group) => `<div class="sidegroup">${group
    .map(([label, glyph, b]) => `<span class="sidelink ${label === current ? "on" : ""}" role="link" tabindex="0"><i>${glyph}</i><span class="sidelabel">${label}</span>${badge(b)}</span>`)
    .join("")}</div>`).join("")

/*
 * `topSlot` in the reference holds ResumeRail - the one action the reader came back for. Here it
 * holds the product's one creating action, because a provisioning console's equivalent of "resume"
 * is "provision the next thing".
 */
const sidebarInner = (current, collapsed) => `
  <div class="sidehead">
    <span class="wordmark">${collapsed ? "n" : "nivo"}</span>
    <button class="sidetoggle" type="button" aria-label="${collapsed ? "Mở rộng điều hướng" : "Thu gọn điều hướng"}" aria-expanded="${!collapsed}">${collapsed ? "»" : "«"}</button>
  </div>
  <div class="topslot"><button class="btn full" type="button" aria-label="Cấp phát mới"><span aria-hidden="true">+</span><span class="sidelabel">Cấp phát mới</span></button></div>
  <nav class="sidenav" aria-label="Điều hướng chính">${navRows(current)}</nav>
  <div class="sidefoot"><div class="avatar"></div><div class="grow sidelabel"><div class="title">Mai Anh</div><div class="sub">chủ tài khoản</div></div></div>`

const sidebar = (current, collapsed) => `<div class="side${collapsed ? " collapsed" : ""}">${sidebarInner(current, collapsed)}</div>`

const drawer = (current) => `
<div class="scrim" role="dialog" aria-modal="true" aria-label="Điều hướng chính">
  <div class="drawer">${sidebarInner(current, false)}</div>
</div>`

const shell = (opts) => {
    const { collapsed = false, mobile = false, dark = false, drawerOpen = false, title = "Tổng quan", action = "", body = "" } = opts
    return `
<div class="k${mobile ? " m" : ""}${dark ? " dark" : ""}">
  <div class="shell">
    ${mobile ? "" : sidebar("Tổng quan", collapsed)}
    <div class="shellbody">
      <div class="topbar">
        <div style="display:flex;align-items:center;gap:12px">
          <button class="menubtn" type="button" aria-label="Mở điều hướng">☰</button>
          <h1 class="pagetitle">${title}</h1>
        </div>
        ${action}
      </div>
      <div class="body">${body}</div>
    </div>
  </div>
  ${drawerOpen ? drawer("Tổng quan") : ""}
</div>`
}

/* ---------------------------------------------------------------------------------- dashboard */

const INSTANCES = `
<div class="card p0">
  <div class="row">
    <div class="grow"><div class="title">hocvien-mai-anh <span class="chip ok">running</span></div><div class="sub">Học viện AI · pro · 4 GB · gia hạn 04/09/2026</div></div>
    <div style="text-align:right"><div class="num">3.42 USD</div><div class="sub">tín dụng đã dùng</div></div>
    <button class="btn ghost sm" type="button">Mở</button>
  </div>
  <div class="row">
    <div class="grow"><div class="title">agent-cskh <span class="chip ok">running</span></div><div class="sub">AI Agent · starter · 2 GB · gia hạn 21/08/2026</div></div>
    <div style="text-align:right"><div class="num">0.88 USD</div><div class="sub">tín dụng đã dùng</div></div>
    <button class="btn ghost sm" type="button">Mở</button>
  </div>
  <div class="row">
    <div class="grow"><div class="title">site-thuy-spa <span class="chip warn">provisioning</span></div><div class="sub">Học viện AI · starter · đang dựng, bắt đầu 6 phút trước</div></div>
    <div style="text-align:right"><div class="sub">chưa tính</div></div>
    <button class="btn ghost sm" type="button">Xem tiến trình</button>
  </div>
</div>`

/*
 * Loading truth: the resting count is three rows, the section label and the column captions are
 * already known, so only the name, the qualifier and the figure become skeleton. Nothing shows a
 * resting value and a skeleton for the same slot.
 */
const INSTANCES_LOADING = `
<div class="card p0" aria-busy="true">
  ${[0, 1, 2].map(() => `
  <div class="row">
    <div class="grow"><span class="sk t"></span><span class="sk s"></span></div>
    <div style="text-align:right"><span class="sk n"></span><div class="sub">tín dụng đã dùng</div></div>
    <button class="btn ghost sm" type="button" disabled>Mở</button>
  </div>`).join("")}
</div>`

const WORK = `
<div class="card p0">
  <div class="row"><div class="grow"><div class="title">Hoá đơn #INV-2451</div><div class="sub">đến hạn 15/08 · 1.290.000 ₫</div></div><button class="btn sm" type="button">Thanh toán</button></div>
  <div class="row"><div class="grow"><div class="title">Ticket #318</div><div class="sub">đang chờ bạn trả lời</div></div><button class="btn ghost sm" type="button">Trả lời</button></div>
</div>`

const WORK_FAILED = `
<div class="card">
  <div class="notice bad">Không tải được danh sách việc cần bạn.</div>
  <div><button class="btn ghost sm" type="button">Thử lại</button></div>
</div>`

const WALLET = `
<div class="card">
  <div><div class="big">2.150.000 ₫</div><div class="sub">số dư khả dụng</div></div>
  <button class="btn ghost" type="button">Nạp tiền</button>
</div>`

const WALLET_LOADING = `
<div class="card" aria-busy="true">
  <div><span class="sk" style="height:26px;width:150px"></span><div class="sub" style="margin-top:6px">số dư khả dụng</div></div>
  <button class="btn ghost" type="button" disabled>Nạp tiền</button>
</div>`

const dashboard = (opts) => {
    const { instances = INSTANCES, work = WORK, wallet = WALLET, count = "3 hệ thống" } = opts
    return `
<div class="sec">
  <div class="seclabel"><h2>Hệ thống đang chạy</h2><span class="sub">${count}</span></div>
  ${instances}
</div>
<div class="grid2">
  <div class="sec"><div class="seclabel"><h2>Việc cần bạn</h2></div>${work}</div>
  <div class="sec"><div class="seclabel"><h2>Ví</h2></div>${wallet}</div>
</div>
<p class="fixture">Fixture · tên trường thật, giá trị dựng để đọc bố cục</p>`
}

const DASH_EMPTY = `
<div class="sec">
  <div class="seclabel"><h2>Hệ thống đang chạy</h2></div>
  <div class="empty">
    <div class="title">Bạn chưa cấp phát hệ thống nào</div>
    <div class="sub">Chọn một sản phẩm trong danh mục để nivo dựng và bàn giao trong vài phút.</div>
    <button class="btn" type="button">Xem danh mục</button>
  </div>
</div>
<div class="grid2">
  <div class="sec"><div class="seclabel"><h2>Việc cần bạn</h2></div><div class="empty"><div class="sub">Không có gì đến hạn.</div></div></div>
  <div class="sec"><div class="seclabel"><h2>Ví</h2></div><div class="card"><div><div class="big">0 ₫</div><div class="sub">số dư khả dụng</div></div><button class="btn ghost" type="button">Nạp tiền</button></div></div>
</div>
<p class="fixture">Fixture · trạng thái tài khoản mới</p>`

const NEW_ACTION = `<button class="btn sm" type="button">Cấp phát mới</button>`

/* ------------------------------------------------------------------------------------- sign-in */

const OAUTH = `
<div class="oauth">
  <button class="btn ghost full" type="button">Tiếp tục với Google</button>
  <button class="btn ghost full" type="button">Tiếp tục với GitHub</button>
</div>
<div class="or">hoặc</div>`

/*
 * The credential form stays in the DOM while closed - a password manager reads the document at
 * load, so a form mounted only after a press is a form it never saw. That is the approved case-a3
 * decision and it is preserved here, not re-decided.
 */
const form = (opts = {}) => {
    const { open = true, email = "", pending = false, bad = false } = opts
    return `
<div class="form${open ? "" : " closed"}">
  <div class="field${bad ? " bad" : ""}">
    <label for="e">Email</label>
    <div class="inp${email ? " filled" : ""}" id="e">${email || "ban@congty.vn"}</div>
  </div>
  <div class="field${bad ? " bad" : ""}">
    <label for="p">Mật khẩu</label>
    <div class="inp${email ? " filled" : ""}" id="p">${email ? "••••••••••" : "Mật khẩu của bạn"}</div>
  </div>
  <button class="btn full" type="button" ${pending ? "disabled aria-disabled=\"true\"" : ""}>${pending ? "<span class=\"spin\"></span>Đang đăng nhập" : "Đăng nhập"}</button>
</div>`
}

const authCard = (inner, mobile) => `
<div class="k${mobile ? " m" : ""}">
  <div class="auth"><div class="authcard">${inner}</div></div>
</div>`

const AUTH_HEAD = `
<div class="authhead">
  <h1>Đăng nhập</h1>
  <p class="sub">Quản lý các hệ thống bạn đang chạy trên nivo.</p>
</div>`

const AUTH_FOOT = `
<div class="authfoot"><a>Quên mật khẩu?</a><a>Tạo tài khoản</a></div>`

const SIGNIN_ENTRY = `${AUTH_HEAD}${OAUTH}${form({ open: true })}${AUTH_FOOT}`
const SIGNIN_PENDING = `${AUTH_HEAD}${OAUTH}${form({ open: true, email: "mai.anh@congty.vn", pending: true })}${AUTH_FOOT}`

/*
 * The refusal names neither the address nor which half was wrong: the backend refuses to disclose
 * whether an address has an account, and a friendlier sentence would hand back what the API
 * withholds.
 */
const SIGNIN_REFUSED = `${AUTH_HEAD}
<div class="notice bad" role="alert">Email hoặc mật khẩu không đúng.</div>
${OAUTH}${form({ open: true, email: "mai.anh@congty.vn", bad: true })}${AUTH_FOOT}`

/*
 * THE RESOLVED CONFLICT. The committed panel says this build cannot complete a second factor, but
 * AuthPayload returns twoFactorToken and verifyTwoFactor(twoFactorToken, code) exists. The screen
 * therefore COMPLETES the challenge. This is the one product decision Preview is asking the user to
 * approve; it is not a visual refinement.
 */
const SIGNIN_2FA = `
<div class="authhead">
  <h1>Xác thực hai lớp</h1>
  <p class="sub">Nhập mã 6 số từ ứng dụng xác thực của bạn.</p>
</div>
<div class="otp"><span>4</span><span>1</span><span>9</span><span class="cur">|</span><span></span><span></span></div>
<button class="btn full" type="button" disabled>Xác nhận</button>
<div class="authfoot"><a>Quay lại đăng nhập</a><span class="sub">Còn 4:52</span></div>`

const SIGNIN_RESET_SENT = `
<div class="authhead">
  <h1>Kiểm tra hộp thư</h1>
  <p class="sub">Nếu địa chỉ đó có tài khoản, chúng tôi vừa gửi một liên kết đặt lại mật khẩu.</p>
</div>
<div class="notice ok">Liên kết chỉ dùng được một lần và hết hạn sau 30 phút.</div>
<button class="btn ghost full" type="button">Quay lại đăng nhập</button>`

const SIGNIN_WAITING = `
<div class="authhead">
  <h1>Đang chuyển sang Google</h1>
  <p class="sub">Trình duyệt đang rời khỏi nivo để bạn xác nhận.</p>
</div>
<div class="notice info"><span class="spin"></span> Vui lòng không đóng cửa sổ.</div>`

const SIGNIN_EXCHANGE_FAILED = `
<div class="authhead">
  <h1>Không hoàn tất được đăng nhập</h1>
  <p class="sub">Nhà cung cấp đã trả lời, nhưng nivo không đổi được mã đó thành phiên làm việc.</p>
</div>
<div class="notice bad" role="alert">Mã xác thực không còn hiệu lực.</div>
<button class="btn full" type="button">Thử lại</button>
<div class="authfoot"><a>Dùng email và mật khẩu</a><a>Tạo tài khoản</a></div>`

/* ----------------------------------------------------------------------------------- scenarios */

const STATES = [
    {
        id: "chrome-open",
        label: "1 · Chrome mở + bảng điều khiển đủ dữ liệu",
        covers: ["layout-app-chrome:desktop-authenticated", "layout-app-chrome:active-section", "page-dashboard:full-content", "block-instance-list:populated", "block-work-needing-you:populated", "block-wallet-summary:populated"],
        html: shell({ action: NEW_ACTION, body: dashboard({}) }),
    },
    {
        id: "chrome-collapsed",
        label: "2 · Chrome thu gọn 4rem",
        covers: ["layout-app-chrome:collapsed", "layout-app-chrome:overflow-collapse"],
        html: shell({ collapsed: true, action: NEW_ACTION, body: dashboard({}) }),
    },
    {
        id: "chrome-mobile",
        label: "3 · Hẹp · sidebar ẩn",
        covers: ["layout-app-chrome:mobile", "page-dashboard:full-content-narrow"],
        html: shell({ mobile: true, body: dashboard({}) }),
    },
    {
        id: "chrome-mobile-drawer",
        label: "4 · Hẹp · drawer mở",
        covers: ["layout-app-chrome:mobile-drawer-open", "layout-app-chrome:keyboard-focus"],
        html: shell({ mobile: true, drawerOpen: true, body: dashboard({}) }),
    },
    {
        id: "chrome-dark",
        label: "5 · Nền tối",
        covers: ["layout-app-chrome:dark", "page-dashboard:dark"],
        html: shell({ dark: true, action: NEW_ACTION, body: dashboard({}) }),
    },
    {
        id: "dash-loading",
        label: "6 · Bảng điều khiển đang tải",
        covers: ["page-dashboard:orchestration-loading", "block-instance-list:loading", "block-wallet-summary:loading"],
        html: shell({ action: NEW_ACTION, body: dashboard({ instances: INSTANCES_LOADING, wallet: WALLET_LOADING, count: "đang tải" }) }),
    },
    {
        id: "dash-partial",
        label: "7 · Đến lệch nhịp · một block hỏng",
        covers: ["page-dashboard:partial-availability", "block-instance-list:populated", "block-work-needing-you:recoverable-error", "block-wallet-summary:loading"],
        html: shell({ action: NEW_ACTION, body: dashboard({ work: WORK_FAILED, wallet: WALLET_LOADING }) }),
    },
    {
        id: "dash-empty",
        label: "8 · Tài khoản mới",
        covers: ["page-dashboard:full-content", "block-instance-list:empty", "block-work-needing-you:empty", "block-wallet-summary:populated"],
        html: shell({ body: DASH_EMPTY }),
    },
    {
        id: "signin-entry",
        label: "9 · Đăng nhập · entry (rộng + hẹp)",
        covers: ["page-sign-in:route-entry", "block-sign-in-panel:entry", "page-sign-in:narrow"],
        html: `<div class="frames">${authCard(SIGNIN_ENTRY, false)}${authCard(SIGNIN_ENTRY, true)}</div>`,
    },
    {
        id: "signin-pending",
        label: "10 · Đăng nhập · đang gửi",
        covers: ["block-sign-in-panel:pending-action", "block-sign-in-panel:disabled-action"],
        html: authCard(SIGNIN_PENDING, false),
    },
    {
        id: "signin-refused",
        label: "11 · Đăng nhập · bị từ chối",
        covers: ["block-sign-in-panel:recoverable-error"],
        html: authCard(SIGNIN_REFUSED, false),
    },
    {
        id: "signin-2fa",
        label: "12 · Yếu tố thứ hai (quyết định cần duyệt)",
        covers: ["block-sign-in-panel:second-factor"],
        html: authCard(SIGNIN_2FA, false),
    },
    {
        id: "signin-reset-sent",
        label: "13 · Đã gửi liên kết đặt lại",
        covers: ["block-sign-in-panel:resetLinkSent"],
        html: authCard(SIGNIN_RESET_SENT, false),
    },
    {
        id: "signin-waiting",
        label: "14 · Đang chuyển sang nhà cung cấp / đang đổi mã",
        covers: ["block-sign-in-panel:handingOff", "block-sign-in-panel:exchanging"],
        html: authCard(SIGNIN_WAITING, false),
    },
    {
        id: "signin-exchange-failed",
        label: "15 · Đổi mã thất bại",
        covers: ["block-sign-in-panel:exchangeFailed", "block-sign-in-panel:terminal-error"],
        html: authCard(SIGNIN_EXCHANGE_FAILED, false),
    },
]

window.STARCI_REVIEW = {
    title: "nivo app — sidebar chrome, bảng điều khiển, đăng nhập (case-d1)",
    deliveryMode: "batch",
    mode: "mixed",
    workItems: [
        { id: "layout-app-chrome", scope: "layout", target: "apps/app/src/app/layout.tsx + AppSidebarChrome" },
        { id: "page-dashboard", scope: "page", target: "apps/app/src/app/page.tsx" },
        { id: "page-sign-in", scope: "page", target: "apps/app/src/app/(auth)/dang-nhap/page.tsx" },
    ],
    evidence: [
        { source: "plan-record.json evidence ledger", claim: "59 queries, 102 mutations, 0 subscriptions on nivo-backend; myInstances, myInvoices, myTickets and myWallet carry every field rendered here." },
        { source: "starci-academy CollapsibleSidebar", claim: "EXPANDED_WIDTH 16rem, COLLAPSED_WIDTH 4rem, collapse in place with no overlay, collapsed flag persisted in localStorage." },
        { source: "starci-academy SidebarNavItem", claim: "min-h-9, gap-2, rounded-large, px-3 py-2; collapsed becomes mx-auto w-fit justify-center gap-0 px-2." },
        { source: "starci-academy LearnSidebar", claim: "Clusters in a fixed group order divided by a full-width rule; trailing badge in two tones; hidden below lg where a drawer takes over." },
        { source: "AuthPayload + verifyTwoFactor", claim: "The backend can complete a second factor, so the committed 'this build cannot' sentence is false." },
    ],
    cases: [
        {
            id: "case-d1",
            title: "Sidebar thu gọn được, đội hệ thống dẫn trang",
            thesis: "Người đọc mở nivo để biết thứ mình đang chạy còn sống không. Danh sách hệ thống dẫn trang; nghĩa vụ và ví đứng cạnh nhau ở hàng thứ hai; điều hướng nằm trong sidebar trái thu gọn được, sống qua mọi route.",
            distinction: "Chuyển thể CollapsibleSidebar của trang học StarCi: 16rem ↔ 4rem, thu tại chỗ, cờ thu nhớ lại, cụm ngăn bằng đường kẻ, badge hai tông. topSlot của bản gốc giữ ResumeRail; ở đây nó giữ 'Cấp phát mới', vì thứ tương đương với 'học tiếp' trong một console cấp phát là 'dựng cái tiếp theo'. Thân một cột vì sidebar đã chiếm mép trái.",
            states: STATES,
            stateCoverage: [
                { ownerId: "layout-app-chrome", state: "desktop / authenticated", coverage: "rendered", scenarioId: "chrome-open", evidence: "me returns UserEntity with username and avatarUrl." },
                { ownerId: "layout-app-chrome", state: "active navigation", coverage: "rendered", scenarioId: "chrome-open", evidence: "Current section is the layout's own domain (LAYOUT-2)." },
                { ownerId: "layout-app-chrome", state: "overflow / collapse", coverage: "rendered", scenarioId: "chrome-collapsed", evidence: "CollapsibleSidebar collapses in place 16rem -> 4rem and persists the flag." },
                { ownerId: "layout-app-chrome", state: "mobile", coverage: "rendered", scenarioId: "chrome-mobile", evidence: "The reference hides the sidebar below lg." },
                { ownerId: "layout-app-chrome", state: "mobile drawer open / focus return", coverage: "rendered", scenarioId: "chrome-mobile-drawer", evidence: "role=dialog aria-modal over a scrim; the reference uses a drawer at this width." },
                { ownerId: "layout-app-chrome", state: "light / dark", coverage: "rendered", scenarioId: "chrome-dark", evidence: "next-themes and ThemeSwitch already ship in apps/app and packages/ui." },
                { ownerId: "layout-app-chrome", state: "persistent loading", coverage: "not-applicable", scenarioId: null, evidence: "The chrome owns no fetched data beyond identity; the account row renders from me and has no separate resting state." },
                { ownerId: "page-dashboard", state: "route entry / guest redirect", coverage: "not-applicable", scenarioId: null, evidence: "Guests never see this page: the route redirects before any block mounts, so there is nothing to render." },
                { ownerId: "page-dashboard", state: "full content", coverage: "rendered", scenarioId: "chrome-open", evidence: "All three blocks have live queries." },
                { ownerId: "page-dashboard", state: "orchestration loading", coverage: "rendered", scenarioId: "dash-loading", evidence: "Resting count of three rows preserved; static labels stay visible." },
                { ownerId: "page-dashboard", state: "partial availability", coverage: "rendered", scenarioId: "dash-partial", evidence: "Blocks land independently (PAGE-3); one landed, one failed, one still loading." },
                { ownerId: "page-dashboard", state: "page-level failure", coverage: "not-applicable", scenarioId: null, evidence: "The page owns no request of its own; failure belongs to each block." },
                { ownerId: "block-instance-list", state: "populated", coverage: "rendered", scenarioId: "chrome-open", evidence: "MyInstance: name, product, plan, ram, status, renewsAt, creditBurnUsd." },
                { ownerId: "block-instance-list", state: "loading", coverage: "rendered", scenarioId: "dash-loading", evidence: "Only name, qualifier and figure become skeleton." },
                { ownerId: "block-instance-list", state: "empty", coverage: "rendered", scenarioId: "dash-empty", evidence: "A new account owns no instance." },
                { ownerId: "block-work-needing-you", state: "populated", coverage: "rendered", scenarioId: "chrome-open", evidence: "InvoiceEntity dueAt/amountVnd and myTickets." },
                { ownerId: "block-work-needing-you", state: "recoverable error", coverage: "rendered", scenarioId: "dash-partial", evidence: "Two independent queries; either can fail while the rest of the page stands." },
                { ownerId: "block-work-needing-you", state: "empty", coverage: "rendered", scenarioId: "dash-empty", evidence: "Nothing due is the ordinary healthy case, not an error." },
                { ownerId: "block-wallet-summary", state: "populated / loading", coverage: "rendered", scenarioId: "chrome-open + dash-loading", evidence: "WalletEntity.balanceVnd." },
                { ownerId: "block-wallet-summary", state: "empty", coverage: "not-applicable", scenarioId: null, evidence: "A wallet always exists once an account exists; zero is a value, not an empty state - shown in dash-empty." },
                { ownerId: "page-sign-in", state: "route entry", coverage: "rendered", scenarioId: "signin-entry", evidence: "Route (auth)/dang-nhap exists." },
                { ownerId: "page-sign-in", state: "narrow", coverage: "rendered", scenarioId: "signin-entry", evidence: "Second frame at 390px in the same scenario." },
                { ownerId: "page-sign-in", state: "authenticated redirect", coverage: "not-applicable", scenarioId: null, evidence: "A signed-in reader is redirected before the panel mounts." },
                { ownerId: "block-sign-in-panel", state: "entry", coverage: "rendered", scenarioId: "signin-entry", evidence: "Committed SignInState union." },
                { ownerId: "block-sign-in-panel", state: "pending / disabled action", coverage: "rendered", scenarioId: "signin-pending", evidence: "Submit shows a spinner, is disabled and keeps its accessible name." },
                { ownerId: "block-sign-in-panel", state: "recoverable error", coverage: "rendered", scenarioId: "signin-refused", evidence: "SignInResponse.error; the sentence discloses neither the address nor which half was wrong." },
                { ownerId: "block-sign-in-panel", state: "second factor", coverage: "rendered", scenarioId: "signin-2fa", evidence: "AuthPayload.twoFactorToken + verifyTwoFactor(twoFactorToken, code). REPLACES the committed twoFactorUnsupported notice - this is the product decision under approval." },
                { ownerId: "block-sign-in-panel", state: "resetLinkSent", coverage: "rendered", scenarioId: "signin-reset-sent", evidence: "requestPasswordReset; the copy stays non-disclosing." },
                { ownerId: "block-sign-in-panel", state: "handingOff / exchanging", coverage: "rendered", scenarioId: "signin-waiting", evidence: "Both draw one waiting tree; only the sentence differs, so one scenario covers both (BLOCK-2)." },
                { ownerId: "block-sign-in-panel", state: "exchangeFailed", coverage: "rendered", scenarioId: "signin-exchange-failed", evidence: "exchangeOauthCode can refuse a stale code." },
                { ownerId: "block-sign-in-panel", state: "dark", coverage: "covered-by", scenarioId: "chrome-dark", evidence: "The auth card uses the same surface, line and ink tokens the dark scenario proves." },
            ],
            blockTree: "app/layout.tsx (framework boundary)\n└── Tree contract=\"sidebar-then-body-app\"\n    ├── AppSidebarChrome (layout)   ← route + me\n    │   ├── topSlot: provision action\n    │   └── SidebarNav clusters\n    └── routed body\n        ├── DashboardPage\n        │   ├── InstanceList        ← myInstances\n        │   ├── WorkNeedingYou      ← myInvoices + myTickets\n        │   └── WalletSummary       ← myWallet\n        └── SignInPage\n            └── SignInPanel         ← signIn / verifyTwoFactor / exchangeOauthCode",
            contracts: [
                { key: "sidebar-then-body-app (new)", why: "The chrome sits beside the routed body rather than above it and survives the body being replaced; nav-over-body-page cannot express that, because its children are a navigation stacked over a page leaf." },
                { key: "titled-body (new)", why: "A console body announces which section it is before its first section label, because the sidebar names the destination but not the state of it." },
                { key: "sidebar-nav-cluster (new)", why: "Destinations that belong to one part of the product are peers of one cluster; a full-width rule separates clusters so a collapsed 4rem rail still reads as groups rather than one undivided column of glyphs." },
                { key: "centred-authentication-page (reuse)", why: "Authentication is the route's only task, so its one bounded form sits at the visual centre." },
                { key: "authentication-panel-card (reuse)", why: "The authentication form is one meaningful control group bounded by one card." },
                { key: "label-row-over-card (reuse)", why: "The label is held outside the surface it names." },
            ],
            proposals: [
                { decision: "new", tier: "foundation", name: "globals.css token layer", detail: "@import \"@heroui/styles/css\" plus the semantic tokens packages/ui already writes: text-muted (18), bg-default (12), text-foreground (6), bg-surface (5). Palette values remain the open decision.", callers: "every screen in apps/app", tests: "a rendered screen computes a non-transparent surface and the product ink" },
                { decision: "extend", tier: "framework boundary", name: "apps/app/src/app/layout.tsx", detail: "Mount the HeroUI provider and next-themes provider; close children into the contract's page leaf beside the chrome.", callers: "every route", tests: "theme toggle changes the computed background; chrome does not remount across navigation" },
                { decision: "new", tier: "layout", name: "AppSidebarChrome", detail: "Collapsible sidebar chrome with persisted collapse flag, drawer below lg, and a topSlot holding the provision action. Owns no page data.", callers: "apps/app/src/app/layout.tsx", tests: "collapsed flag survives reload; drawer traps focus and returns it" },
                { decision: "reject", tier: "contract", name: "dashboard-main / dashboard-rail-then-main", detail: "Their why binds them to the academy's eight learner sections in a fixed reading order.", callers: "packages/ui/src/contracts/index.ts" },
            ],
            backendEnablers: [],
            assumptions: [
                "The reader is the account owner who ordered the systems.",
                "Eight destinations in three clusters is the product's navigation; it is inferred from the my* queries, not from an approved information architecture.",
                "Vietnamese is the app's only locale, matching the committed sign-in copy.",
            ],
            unknowns: [
                "Palette values for nivo are undecided; this lab uses a neutral placeholder.",
                "MyInstance.status is a free String, so running / provisioning are fixtures, not a proven enum.",
                "No subscription exists, so a provisioning row can only be polled.",
                "creditBurnUsd is USD while wallet and invoices are VND.",
                "apps/app still has no GraphQL client and no i18n catalogue.",
            ],
            css: CSS,
        },
    ],
}
