/*
 * Direction lab - nivo app: sign-in and dashboard.
 *
 * PHASE: plan-direction. This lab exists to make three dashboard theses comparable, not to approve
 * one. Only the scenarios marked below as rendered are rendered; every other required owner state is
 * listed as deferred to Preview.
 *
 * EVERY FIGURE IS A LABELLED FIXTURE. The field NAMES are real - each one is read from the running
 * nivo-backend schema at 127.0.0.1:3067 - but no value here came from a real account.
 *
 * THE TOKENS BELOW ARE A NEUTRAL PLACEHOLDER, and that is a decision the user still has to take.
 * nivo-fe has no token layer at all today, and porting StarCi Academy's 301-line palette wholesale
 * would make nivo wear another product's brand. The lab therefore uses a neutral HeroUI-shaped set
 * so hierarchy can be judged without pretending the brand question is settled.
 */

const CSS = `
.k{--bg:#ffffff;--surface:#ffffff;--muted-bg:#f4f4f5;--line:#e4e4e7;--ink:#18181b;--dim:#71717a;--acc:#2563eb;--accfg:#ffffff;--ok:#15803d;--ok-soft:#dcfce7;--warn:#b45309;--warn-soft:#fef3c7;--danger:#b91c1c;--danger-soft:#fee2e2;
 background:var(--bg);color:var(--ink);font:14px/1.55 ui-sans-serif,system-ui,-apple-system,sans-serif;border:1px solid var(--line);border-radius:14px;overflow:hidden}
.k *{box-sizing:border-box}
.k .nav{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 24px;border-bottom:1px solid var(--line)}
.k .brandline{display:flex;align-items:center;gap:24px}
.k .wordmark{font-weight:700;letter-spacing:-.02em}
.k .navlinks{display:flex;gap:16px;color:var(--dim);font-size:13px}
.k .navlinks .on{color:var(--ink);font-weight:600}
.k .avatar{width:28px;height:28px;border-radius:999px;background:var(--muted-bg);border:1px solid var(--line)}
.k .body{padding:24px;display:flex;flex-direction:column;gap:24px}
.k .split{display:flex;gap:24px;align-items:flex-start}
.k .rail{width:288px;flex:0 0 288px;display:flex;flex-direction:column;gap:24px}
.k .main{flex:1;min-width:0;display:flex;flex-direction:column;gap:24px}
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
.k .btn{border:1px solid transparent;border-radius:10px;padding:8px 14px;font:inherit;font-weight:600;background:var(--acc);color:var(--accfg);cursor:pointer}
.k .btn.sm{padding:5px 10px;font-size:13px;border-radius:8px}
.k .btn.ghost{background:transparent;color:var(--ink);border-color:var(--line)}
.k .btn.quiet{background:transparent;color:var(--acc);border-color:transparent;padding-left:0;padding-right:0}
.k .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.k .stat{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--line)}
.k .stat:last-child{border-bottom:0}
.k .empty{display:flex;flex-direction:column;gap:12px;align-items:flex-start;padding:24px;border:1px dashed var(--line);border-radius:14px;background:var(--muted-bg)}
.k .fixture{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--dim)}
.k .auth{min-height:520px;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--muted-bg)}
.k .authcard{width:100%;max-width:384px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:24px;display:flex;flex-direction:column;gap:16px}
.k .authhead{display:flex;flex-direction:column;gap:6px;text-align:center}
.k .authhead h1{margin:0;font-size:22px;font-weight:700;letter-spacing:-.01em}
.k .oauth{display:flex;flex-direction:column;gap:12px}
.k .oauthbtn{display:flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--line);border-radius:10px;padding:10px 14px;font-weight:600;background:var(--surface);cursor:pointer}
.k .or{display:flex;align-items:center;gap:12px;color:var(--dim);font-size:12px}
.k .or:before,.k .or:after{content:"";flex:1;height:1px;background:var(--line)}
.k .field{display:flex;flex-direction:column;gap:6px}
.k .field label{font-size:13px;font-weight:600}
.k .field input{border:1px solid var(--line);border-radius:10px;padding:10px 12px;font:inherit;background:var(--surface)}
.k .authfoot{display:flex;align-items:center;justify-content:space-between;font-size:13px}
.k .authfoot a{color:var(--acc);text-decoration:none}
`

/** The chrome every dashboard case shares, so the cases differ in the body and nothing else. */
const nav = (current) => `
<div class="nav">
  <div class="brandline">
    <span class="wordmark">nivo</span>
    <nav class="navlinks">
      ${["Tổng quan", "Dịch vụ", "Đơn hàng", "Hỗ trợ"].map((label) => `<span class="${label === current ? "on" : ""}">${label}</span>`).join("")}
    </nav>
  </div>
  <div class="avatar"></div>
</div>`

/** Sign-in, identical in all three cases: the direction question is the dashboard, not this screen. */
const SIGN_IN = `
<div class="k">
  <div class="auth">
    <div class="authcard">
      <div class="authhead">
        <h1>Đăng nhập</h1>
        <p class="sub">Quản lý các hệ thống bạn đang chạy trên nivo.</p>
      </div>
      <div class="oauth">
        <button class="oauthbtn" type="button">Tiếp tục với Google</button>
        <button class="oauthbtn" type="button">Tiếp tục với GitHub</button>
      </div>
      <div class="or">hoặc</div>
      <div class="field">
        <label>Email</label>
        <input type="email" placeholder="ban@congty.vn">
      </div>
      <div class="field">
        <label>Mật khẩu</label>
        <input type="password" placeholder="Mật khẩu của bạn">
      </div>
      <button class="btn" type="button">Đăng nhập</button>
      <div class="authfoot">
        <a href="#">Quên mật khẩu?</a>
        <a href="#">Tạo tài khoản</a>
      </div>
    </div>
  </div>
</div>`

/* ---------------------------------------------------------------------- case A: fleet first */

const A_POPULATED = `
<div class="k">
  ${nav("Tổng quan")}
  <div class="body">
    <div class="split">
      <div class="main">
        <div class="sec">
          <div class="seclabel"><h2>Hệ thống đang chạy</h2><button class="btn sm" type="button">Cấp phát mới</button></div>
          <div class="card p0">
            <div class="row">
              <div class="grow">
                <div class="title">hocvien-mai-anh <span class="chip ok">running</span></div>
                <div class="sub">Học viện AI · gói pro · 4 GB RAM · gia hạn 04/09/2026</div>
              </div>
              <div style="text-align:right">
                <div class="num">3.42 USD</div>
                <div class="sub">tín dụng đã dùng</div>
              </div>
              <button class="btn ghost sm" type="button">Mở</button>
            </div>
            <div class="row">
              <div class="grow">
                <div class="title">agent-cskh <span class="chip ok">running</span></div>
                <div class="sub">AI Agent · gói starter · 2 GB RAM · gia hạn 21/08/2026</div>
              </div>
              <div style="text-align:right">
                <div class="num">0.88 USD</div>
                <div class="sub">tín dụng đã dùng</div>
              </div>
              <button class="btn ghost sm" type="button">Mở</button>
            </div>
            <div class="row">
              <div class="grow">
                <div class="title">site-thuy-spa <span class="chip warn">provisioning</span></div>
                <div class="sub">Học viện AI · gói starter · đang dựng, bắt đầu 6 phút trước</div>
              </div>
              <div style="text-align:right"><div class="sub">chưa tính</div></div>
              <button class="btn ghost sm" type="button">Xem tiến trình</button>
            </div>
          </div>
        </div>
        <div class="sec">
          <div class="seclabel"><h2>Việc cần bạn</h2><span class="sub">2 việc</span></div>
          <div class="card p0">
            <div class="row">
              <div class="grow"><div class="title">Hoá đơn #INV-2451 đến hạn 15/08</div><div class="sub">Gia hạn hocvien-mai-anh · 1.290.000 ₫</div></div>
              <button class="btn sm" type="button">Thanh toán</button>
            </div>
            <div class="row">
              <div class="grow"><div class="title">Ticket #318 đang chờ bạn trả lời</div><div class="sub">Kết nối tên miền hocvien.maianh.vn</div></div>
              <button class="btn ghost sm" type="button">Trả lời</button>
            </div>
          </div>
        </div>
      </div>
      <div class="rail">
        <div class="sec">
          <div class="seclabel"><h2>Ví</h2></div>
          <div class="card">
            <div><div class="big">2.150.000 ₫</div><div class="sub">số dư khả dụng</div></div>
            <button class="btn" type="button">Nạp tiền</button>
          </div>
        </div>
        <div class="sec">
          <div class="seclabel"><h2>Tài khoản</h2></div>
          <div class="card">
            <div class="stat"><span class="sub">Đơn dịch vụ</span><span class="num">3</span></div>
            <div class="stat"><span class="sub">Tên miền</span><span class="num">2</span></div>
            <div class="stat"><span class="sub">Xác thực 2 lớp</span><span class="chip">chưa bật</span></div>
          </div>
        </div>
      </div>
    </div>
    <p class="fixture">Fixture · tên trường thật, giá trị dựng để đọc bố cục</p>
  </div>
</div>`

const A_FIRST_RUN = `
<div class="k">
  ${nav("Tổng quan")}
  <div class="body">
    <div class="split">
      <div class="main">
        <div class="sec">
          <div class="seclabel"><h2>Hệ thống đang chạy</h2></div>
          <div class="empty">
            <div class="title">Bạn chưa cấp phát hệ thống nào</div>
            <div class="sub">Chọn một sản phẩm trong danh mục để nivo dựng và bàn giao trong vài phút.</div>
            <button class="btn" type="button">Xem danh mục</button>
          </div>
        </div>
      </div>
      <div class="rail">
        <div class="sec">
          <div class="seclabel"><h2>Ví</h2></div>
          <div class="card">
            <div><div class="big">0 ₫</div><div class="sub">số dư khả dụng</div></div>
            <button class="btn ghost" type="button">Nạp tiền</button>
          </div>
        </div>
      </div>
    </div>
    <p class="fixture">Fixture · trạng thái tài khoản mới</p>
  </div>
</div>`

/* ------------------------------------------------------------------- case B: obligations first */

const B_POPULATED = `
<div class="k">
  ${nav("Tổng quan")}
  <div class="body">
    <div class="sec">
      <div class="seclabel"><h2>Cần xử lý trước</h2><span class="chip bad">1 quá hạn</span></div>
      <div class="card p0">
        <div class="row">
          <div class="grow"><div class="title">Hoá đơn #INV-2451 · quá hạn 2 ngày</div><div class="sub">Gia hạn hocvien-mai-anh · đến hạn 10/08/2026</div></div>
          <div class="num">1.290.000 ₫</div>
          <button class="btn sm" type="button">Thanh toán</button>
        </div>
        <div class="row">
          <div class="grow"><div class="title">agent-cskh gia hạn sau 9 ngày</div><div class="sub">Tự động gia hạn đang tắt · 21/08/2026</div></div>
          <div class="num">690.000 ₫</div>
          <button class="btn ghost sm" type="button">Bật tự động</button>
        </div>
        <div class="row">
          <div class="grow"><div class="title">Số dư ví không đủ cho kỳ tới</div><div class="sub">Cần thêm 830.000 ₫ trước 04/09/2026</div></div>
          <div class="num">2.150.000 ₫</div>
          <button class="btn ghost sm" type="button">Nạp tiền</button>
        </div>
      </div>
    </div>
    <div class="sec">
      <div class="seclabel"><h2>Hệ thống của bạn</h2><button class="btn quiet" type="button">Xem tất cả</button></div>
      <div class="grid2">
        <div class="card">
          <div><div class="title">hocvien-mai-anh <span class="chip ok">running</span></div><div class="sub">Học viện AI · pro · gia hạn 04/09</div></div>
          <div class="stat"><span class="sub">Tín dụng đã dùng</span><span class="num">3.42 USD</span></div>
        </div>
        <div class="card">
          <div><div class="title">agent-cskh <span class="chip ok">running</span></div><div class="sub">AI Agent · starter · gia hạn 21/08</div></div>
          <div class="stat"><span class="sub">Tín dụng đã dùng</span><span class="num">0.88 USD</span></div>
        </div>
      </div>
    </div>
    <p class="fixture">Fixture · tên trường thật, giá trị dựng để đọc bố cục</p>
  </div>
</div>`

const B_FIRST_RUN = `
<div class="k">
  ${nav("Tổng quan")}
  <div class="body">
    <div class="sec">
      <div class="seclabel"><h2>Cần xử lý trước</h2></div>
      <div class="empty">
        <div class="title">Không có gì đến hạn</div>
        <div class="sub">Khi có hoá đơn, kỳ gia hạn hoặc ví sắp cạn, việc đó sẽ xuất hiện ở đây trước tiên.</div>
      </div>
    </div>
    <div class="sec">
      <div class="seclabel"><h2>Hệ thống của bạn</h2></div>
      <div class="empty">
        <div class="title">Chưa có hệ thống nào</div>
        <button class="btn" type="button">Xem danh mục</button>
      </div>
    </div>
    <p class="fixture">Fixture · trạng thái tài khoản mới</p>
  </div>
</div>`

/* -------------------------------------------------------------------- case C: provisioning first */

const C_POPULATED = `
<div class="k">
  ${nav("Tổng quan")}
  <div class="body">
    <div class="sec">
      <div class="seclabel"><h2>Đang dựng</h2><span class="sub">cập nhật mỗi lần bạn mở trang</span></div>
      <div class="card">
        <div>
          <div class="title">site-thuy-spa <span class="chip warn">provisioning</span></div>
          <div class="sub">Học viện AI · bước 3/5 · cấu hình tên miền phụ</div>
        </div>
        <div class="stat"><span class="sub">Bắt đầu</span><span class="num">6 phút trước</span></div>
        <button class="btn ghost" type="button">Xem nhật ký</button>
      </div>
    </div>
    <div class="split">
      <div class="main">
        <div class="sec">
          <div class="seclabel"><h2>Dựng thêm</h2></div>
          <div class="grid2">
            <div class="card">
              <div><div class="title">Học viện AI</div><div class="sub">Trang học viện theo mẫu, kèm khoá học và thanh toán.</div></div>
              <button class="btn" type="button">Cấp phát</button>
            </div>
            <div class="card">
              <div><div class="title">AI Agent</div><div class="sub">Trợ lý trả lời khách trên kênh bạn đã nối.</div></div>
              <button class="btn" type="button">Cấp phát</button>
            </div>
          </div>
        </div>
        <div class="sec">
          <div class="seclabel"><h2>Đã bàn giao</h2><button class="btn quiet" type="button">Xem tất cả</button></div>
          <div class="card p0">
            <div class="row"><div class="grow"><div class="title">hocvien-mai-anh</div><div class="sub">Học viện AI · published 02/08/2026</div></div><span class="chip ok">running</span></div>
            <div class="row"><div class="grow"><div class="title">agent-cskh</div><div class="sub">AI Agent · published 27/07/2026</div></div><span class="chip ok">running</span></div>
          </div>
        </div>
      </div>
      <div class="rail">
        <div class="sec">
          <div class="seclabel"><h2>Ví</h2></div>
          <div class="card">
            <div><div class="big">2.150.000 ₫</div><div class="sub">số dư khả dụng</div></div>
            <button class="btn ghost" type="button">Nạp tiền</button>
          </div>
        </div>
        <div class="sec">
          <div class="seclabel"><h2>Nhắc</h2></div>
          <div class="card">
            <div class="stat"><span class="sub">Hoá đơn đến hạn</span><span class="chip bad">1</span></div>
            <div class="stat"><span class="sub">Ticket đang mở</span><span class="num">1</span></div>
          </div>
        </div>
      </div>
    </div>
    <p class="fixture">Fixture · tên trường thật, giá trị dựng để đọc bố cục</p>
  </div>
</div>`

const C_FIRST_RUN = `
<div class="k">
  ${nav("Tổng quan")}
  <div class="body">
    <div class="sec">
      <div class="seclabel"><h2>Bắt đầu ở đây</h2></div>
      <div class="grid2">
        <div class="card">
          <div><div class="title">Học viện AI</div><div class="sub">Trang học viện theo mẫu, kèm khoá học và thanh toán.</div></div>
          <button class="btn" type="button">Cấp phát</button>
        </div>
        <div class="card">
          <div><div class="title">AI Agent</div><div class="sub">Trợ lý trả lời khách trên kênh bạn đã nối.</div></div>
          <button class="btn" type="button">Cấp phát</button>
        </div>
      </div>
    </div>
    <p class="fixture">Fixture · trạng thái tài khoản mới</p>
  </div>
</div>`

/* ------------------------------------------------------------ case D: sidebar chrome, one column */

/*
 * The sidebar is CHROME, not a page rail. That is the whole difference from case A: StarCi's left
 * column is drawn by the page and dies with it, while this one survives navigation and therefore
 * belongs to the layout. Because the sidebar already owns the left edge, the body stays one column -
 * a sidebar plus a 288px rail is three columns, and at 1280px the middle one stops being readable.
 */

/*
 * Measured from the named reference: starci-academy/src/components/blocks/navigation/
 * CollapsibleSidebar (EXPANDED_WIDTH 16rem, COLLAPSED_WIDTH 4rem, collapse in place with no
 * overlay, flag persisted in localStorage) and SidebarNavItem (min-h-9, gap-2, rounded-large,
 * px-3 py-2; collapsed becomes mx-auto w-fit justify-center gap-0 px-2). The clusters and their
 * dividers copy LearnSidebar's GROUP_ORDER pattern; the trailing badge copies its two tones - a
 * warning chip for a count that needs action, quiet accent text for a rank or a plain figure.
 */

const SIDE_GROUPS = [
    [["Tổng quan", "▦", null], ["Hệ thống", "▤", ["quiet", "3"]], ["Đang dựng", "◐", ["quiet", "1"]]],
    [["Đơn hàng", "▣", null], ["Ví", "◍", null], ["Hoá đơn", "▥", ["warn", "1"]]],
    [["Tên miền", "◈", null], ["Hỗ trợ", "◌", ["warn", "1"]]],
]

const badge = (b) => (b === null ? "" : b[0] === "warn"
    ? `<span class="chip bad sidebadge">${b[1]}</span>`
    : `<span class="sidecount">${b[1]}</span>`)

const sidebar = (current, collapsed) => `
<div class="side${collapsed ? " collapsed" : ""}">
  <div class="sidehead">
    <span class="wordmark">${collapsed ? "n" : "nivo"}</span>
    <button class="sidetoggle" type="button" aria-label="${collapsed ? "Mở rộng điều hướng" : "Thu gọn điều hướng"}">${collapsed ? "»" : "«"}</button>
  </div>
  <nav class="sidenav">
    ${SIDE_GROUPS.map((group) => `<div class="sidegroup">${group
        .map(([label, glyph, b]) => `<span class="sidelink ${label === current ? "on" : ""}"><i>${glyph}</i><span class="sidelabel">${label}</span>${badge(b)}</span>`)
        .join("")}</div>`).join("")}
  </nav>
  <div class="sidefoot"><div class="avatar"></div><div class="grow sidelabel"><div class="title">Mai Anh</div><div class="sub">chủ tài khoản</div></div></div>
</div>`

const dashboardD = (collapsed) => `
<div class="k">
  <div class="shell">
    ${sidebar("Tổng quan", collapsed)}
    <div class="shellbody">
      <div class="topbar"><h1 class="pagetitle">Tổng quan</h1><button class="btn sm" type="button">Cấp phát mới</button></div>
      <div class="body">
        <div class="sec">
          <div class="seclabel"><h2>Hệ thống đang chạy</h2><span class="sub">3 hệ thống</span></div>
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
          </div>
        </div>
        <div class="grid2">
          <div class="sec">
            <div class="seclabel"><h2>Việc cần bạn</h2><span class="chip bad">1 quá hạn</span></div>
            <div class="card p0">
              <div class="row"><div class="grow"><div class="title">Hoá đơn #INV-2451</div><div class="sub">đến hạn 15/08 · 1.290.000 ₫</div></div><button class="btn sm" type="button">Thanh toán</button></div>
              <div class="row"><div class="grow"><div class="title">Ticket #318</div><div class="sub">đang chờ bạn trả lời</div></div><button class="btn ghost sm" type="button">Trả lời</button></div>
            </div>
          </div>
          <div class="sec">
            <div class="seclabel"><h2>Ví</h2></div>
            <div class="card">
              <div><div class="big">2.150.000 ₫</div><div class="sub">số dư khả dụng</div></div>
              <button class="btn ghost" type="button">Nạp tiền</button>
            </div>
          </div>
        </div>
        <p class="fixture">Fixture · tên trường thật, giá trị dựng để đọc bố cục</p>
      </div>
    </div>
  </div>
</div>`

const D_POPULATED = dashboardD(false)
const D_COLLAPSED = dashboardD(true)

const D_FIRST_RUN = `
<div class="k">
  <div class="shell">
    ${sidebar("Tổng quan", false)}
    <div class="shellbody">
      <div class="topbar"><h1 class="pagetitle">Tổng quan</h1></div>
      <div class="body">
        <div class="sec">
          <div class="seclabel"><h2>Hệ thống đang chạy</h2></div>
          <div class="empty">
            <div class="title">Bạn chưa cấp phát hệ thống nào</div>
            <div class="sub">Chọn một sản phẩm trong danh mục để nivo dựng và bàn giao trong vài phút.</div>
            <button class="btn" type="button">Xem danh mục</button>
          </div>
        </div>
        <p class="fixture">Fixture · trạng thái tài khoản mới</p>
      </div>
    </div>
  </div>
</div>`

const SIDEBAR_CSS = `
.k .shell{display:flex;align-items:stretch;min-height:560px}
.k .side{width:16rem;flex:0 0 16rem;border-right:1px solid var(--line);background:var(--muted-bg);display:flex;flex-direction:column}
.k .side.collapsed{width:4rem;flex:0 0 4rem}
.k .side.collapsed .sidelabel{display:none}
.k .side.collapsed .sidehead{justify-content:center;flex-direction:column;gap:8px}
.k .side.collapsed .sidelink{margin:0 auto;width:fit-content;justify-content:center;gap:0;padding:8px}
.k .side.collapsed .sidebadge{position:absolute;transform:translate(14px,-10px);padding:0 5px;font-size:10px}
.k .side.collapsed .sidefoot{justify-content:center}
.k .sidehead{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:16px 12px 12px}
.k .sidetoggle{border:1px solid var(--line);background:var(--surface);color:var(--dim);border-radius:8px;width:24px;height:24px;line-height:1;cursor:pointer;font:inherit;font-size:12px}
.k .sidenav{display:flex;flex-direction:column;padding:0 8px}
.k .sidegroup{display:flex;flex-direction:column;gap:2px;padding:8px 0;border-top:1px solid var(--line)}
.k .sidegroup:first-child{border-top:0;padding-top:0}
.k .sidelink{position:relative;display:flex;align-items:center;gap:8px;min-height:36px;padding:8px 12px;border-radius:12px;color:var(--dim);font-size:14px}
.k .sidelink i{font-style:normal;width:16px;text-align:center;flex:0 0 16px}
.k .sidelink .sidelabel{flex:1;min-width:0}
.k .sidelink.on{background:var(--surface);color:var(--ink);font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,.05)}
.k .sidecount{font-size:12px;color:var(--dim);font-variant-numeric:tabular-nums}
.k .sidefoot{margin-top:auto;display:flex;align-items:center;gap:12px;padding:16px 12px;border-top:1px solid var(--line)}
.k .shellbody{flex:1;min-width:0;display:flex;flex-direction:column}
.k .topbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 24px;border-bottom:1px solid var(--line)}
.k .pagetitle{margin:0;font-size:18px;font-weight:650;letter-spacing:-.01em}
`

/* ------------------------------------------------------------------------------------ manifest */

const SHARED_UNKNOWNS = [
    "nivo has no brand palette in nivo-fe. The lab uses a neutral placeholder; porting starci-academy-fe/src/app/globals.css wholesale would dress nivo in StarCi Academy's brand.",
    "myInstances returns status as a free String; the running/provisioning/failed vocabulary shown here is not yet a proven enum.",
    "No subscription exists in the schema (subscriptionType is empty), so any live provisioning progress is polling, not push.",
    "Vietnamese is assumed as the app's only locale, matching the sign-in copy already committed; no catalogue exists in apps/app.",
]

const SHARED_ASSUMPTIONS = [
    "The reader of this dashboard is the account owner who ordered the systems, not an end learner or an end customer.",
    "One user may hold several instances across both products; the schema models instances as a collection.",
    "Sign-in keeps the approved case-a3 order: shortcuts, divider, then credential form.",
]

const SIGNIN_STATE = {
    id: "signin-entry",
    label: "Đăng nhập · entry (chung cho cả 4 hướng)",
    covers: ["page-sign-in:full-content", "block-sign-in-panel:entry"],
    html: SIGN_IN,
}

const SIGNIN_COVERAGE = [
    { ownerId: "page-sign-in", state: "route entry", coverage: "rendered", scenarioId: "signin-entry", evidence: "Route (auth)/dang-nhap already exists and renders SignInPanel." },
    { ownerId: "block-sign-in-panel", state: "entry", coverage: "rendered", scenarioId: "signin-entry", evidence: "SignInState union in component.tsx line 44." },
    { ownerId: "block-sign-in-panel", state: "twoFactorUnsupported", coverage: "not-applicable", scenarioId: null, evidence: "Deferred to Preview: verifyTwoFactor exists in the schema, so the honest state is a second-factor challenge, not an unsupported notice." },
    { ownerId: "block-sign-in-panel", state: "resetLinkSent / handingOff / exchanging / exchangeFailed", coverage: "not-applicable", scenarioId: null, evidence: "Deferred to Preview; all four already exist in the committed union and need rendering under the restored token layer." },
]

const SHARED_PROPOSALS = [
    {
        decision: "new",
        tier: "foundation",
        name: "apps/app/src/app/globals.css token layer",
        detail: "Add @import \"@heroui/styles/css\" and the semantic token block. packages/ui writes text-muted (18), bg-default (12), text-foreground (6) and bg-surface (5); none of them resolve today, which is why every screen renders unstyled.",
        callers: "every screen in apps/app",
    },
    {
        decision: "new",
        tier: "layout",
        name: "AppChrome",
        detail: "Route-stable chrome holding wordmark, section navigation and the account trigger. Required by the dashboard, forbidden on the sign-in route, which uses centred-authentication-page.",
        callers: "apps/app/src/app/layout.tsx as a sibling of the routed body",
    },
    {
        decision: "reject",
        tier: "contract",
        name: "dashboard-main / dashboard-rail-then-main",
        detail: "Reusing them would be false: their why says the production overview has EIGHT learner sections in a fixed reading order. nivo's dashboard is a provisioning surface and needs its own named topology.",
        callers: "packages/ui/src/contracts/index.ts",
    },
    {
        decision: "reuse",
        tier: "contract",
        name: "centred-authentication-page + authentication-panel-card",
        detail: "Both already exist in packages/ui and their why matches this sign-in exactly.",
        callers: "apps/app/src/app/(auth)/dang-nhap",
    },
]

window.STARCI_REVIEW = {
    title: "nivo app — đăng nhập và bảng điều khiển",
    deliveryMode: "batch",
    mode: "mixed",
    workItems: [
        { id: "layout-app-chrome", scope: "layout", target: "apps/app/src/app/layout.tsx + AppChrome" },
        { id: "page-dashboard", scope: "page", target: "apps/app/src/app/page.tsx" },
        { id: "page-sign-in", scope: "page", target: "apps/app/src/app/(auth)/dang-nhap/page.tsx" },
    ],
    evidence: [
        { source: "nivo-backend GraphQL schema at 127.0.0.1:3067", claim: "59 queries, 102 mutations, 0 subscriptions. myInstances, myWallet, myInvoices, myCatalogOrders, myExpertSites, myAgentWorkspace, myDomains, myTickets and myOpsTickets all exist." },
        { source: "SignInInput / AuthPayload", claim: "signIn(email,password) returns accessToken, requiresTwoFactor and twoFactorToken; verifyTwoFactor(twoFactorToken,code) exists." },
        { source: "MyInstance type", claim: "id, name, product, plan, ram, status, renewsAt, creditBurnUsd, expertSiteId, agentWorkspaceId." },
        { source: "InvoiceEntity / WalletEntity", claim: "amountVnd, dueAt, paidAt, status, purpose, gatewayCheckoutUrl; wallet holds balanceVnd." },
        { source: "packages/ui/src/contracts/index.ts", claim: "centred-authentication-page and authentication-panel-card exist; dashboard-main is bound by its why to eight learner sections." },
        { source: "apps/app/src/app/globals.css", claim: "9 lines: @import tailwindcss plus one @source. No HeroUI stylesheet, no token layer." },
    ],
    cases: [
        {
            id: "direction-a",
            title: "Đội hệ thống dẫn trang",
            thesis: "Người đọc mở bảng điều khiển để biết những gì họ đang chạy còn sống hay không; danh sách hệ thống dẫn, nghĩa vụ đứng thứ hai.",
            distinction: "CTA chính là mở một hệ thống. Ví và tài khoản lùi về rail 288px. Đây là hướng gần với câu 'Bảng điều khiển cấp phát và vận hành' nhất.",
            states: [
                { id: "dash-populated", label: "Bảng điều khiển · có dữ liệu", covers: ["page-dashboard:full-content", "layout-app-chrome:desktop-authenticated", "block-instance-list:populated", "block-wallet-summary:populated"], html: A_POPULATED },
                { id: "dash-first-run", label: "Bảng điều khiển · tài khoản mới", covers: ["page-dashboard:full-content", "block-instance-list:empty"], html: A_FIRST_RUN },
                SIGNIN_STATE,
            ],
            stateCoverage: [
                { ownerId: "page-dashboard", state: "full content", coverage: "rendered", scenarioId: "dash-populated", evidence: "myInstances + myInvoices + myWallet all exist." },
                { ownerId: "block-instance-list", state: "empty", coverage: "rendered", scenarioId: "dash-first-run", evidence: "A new account owns no instance." },
                { ownerId: "block-instance-list", state: "loading", coverage: "not-applicable", scenarioId: null, evidence: "Deferred to Preview; resting row count must be preserved." },
                { ownerId: "layout-app-chrome", state: "mobile", coverage: "not-applicable", scenarioId: null, evidence: "Deferred to Preview." },
                ...SIGNIN_COVERAGE,
            ],
            blockTree: "AppChrome (layout)\n└── DashboardPage\n    ├── InstanceList        ← myInstances\n    ├── WorkNeedingYou      ← myInvoices + myTickets\n    ├── WalletSummary       ← myWallet\n    └── AccountFacts        ← myCatalogOrders + myDomains + me",
            contracts: [
                { key: "nav-over-body-page (reuse)", why: "Navigation stays a sibling of the routed body, so a route change repaints the body without tearing the nav down." },
                { key: "operations-rail-then-main (new)", why: "The fleet owns the flexible column while wallet and account facts stay a fixed 288px rail; nivo cannot borrow dashboard-rail-then-main, whose why binds it to eight learner sections." },
                { key: "label-row-over-card (reuse)", why: "The label is held outside the surface it names, so a section whose content is itself a set of rows never draws a card inside a card." },
            ],
            proposals: SHARED_PROPOSALS,
            backendEnablers: [],
            assumptions: [...SHARED_ASSUMPTIONS, "A reader with many instances still scans them as one list rather than by product."],
            unknowns: [...SHARED_UNKNOWNS, "creditBurnUsd is USD while wallet and invoices are VND; whether the screen may show two currencies side by side is a product decision."],
            css: CSS,
        },
        {
            id: "direction-b",
            title: "Nghĩa vụ dẫn trang",
            thesis: "Cái duy nhất khiến hệ thống chết là quên trả tiền; trang mở bằng những việc có hạn, hệ thống đọc sau như bằng chứng mọi thứ vẫn chạy.",
            distinction: "CTA chính là thanh toán hoặc nạp ví. Không có rail: một cột, việc gấp trên cùng, hệ thống thành lưới hai cột bên dưới.",
            states: [
                { id: "dash-populated", label: "Bảng điều khiển · có việc quá hạn", covers: ["page-dashboard:full-content", "block-due-work:populated", "block-instance-grid:populated"], html: B_POPULATED },
                { id: "dash-first-run", label: "Bảng điều khiển · không có gì đến hạn", covers: ["page-dashboard:full-content", "block-due-work:empty", "block-instance-grid:empty"], html: B_FIRST_RUN },
                SIGNIN_STATE,
            ],
            stateCoverage: [
                { ownerId: "block-due-work", state: "populated", coverage: "rendered", scenarioId: "dash-populated", evidence: "InvoiceEntity has dueAt, status and gatewayCheckoutUrl; CatalogOrderEntity has autoRenew and renewsAt." },
                { ownerId: "block-due-work", state: "empty", coverage: "rendered", scenarioId: "dash-first-run", evidence: "An account with nothing due is the ordinary healthy case, not an error." },
                { ownerId: "block-due-work", state: "loading", coverage: "not-applicable", scenarioId: null, evidence: "Deferred to Preview." },
                ...SIGNIN_COVERAGE,
            ],
            blockTree: "AppChrome (layout)\n└── DashboardPage\n    ├── DueWork             ← myInvoices + myCatalogOrders + myWallet\n    ├── InstanceGrid        ← myInstances\n    └── SupportInbox        ← myTickets",
            contracts: [
                { key: "nav-over-body-page (reuse)", why: "Same chrome relationship as every other authenticated screen." },
                { key: "stacked-sections (reuse)", why: "Sections read as separate objects only while the space between them is larger than the space inside any of them." },
                { key: "due-work-list (new)", why: "A due obligation is one row of deadline, amount and the single action that clears it; the amount stays comparable down the joined list." },
            ],
            proposals: SHARED_PROPOSALS,
            backendEnablers: [
                {
                    classification: "additive-enabler",
                    operationKind: "query",
                    id: "myDueWork",
                    uiNeed: "The lead section merges invoices, renewing orders and a low wallet into one ordered list; doing that in the browser means three requests and a client-side ranking the backend can prove.",
                    currentEvidence: "myInvoices, myCatalogOrders and myWallet already exist and are already authorized per user.",
                    escalation: "If ranking needs a new business rule about what counts as urgent, it stops being additive and becomes backend design.",
                },
            ],
            assumptions: [...SHARED_ASSUMPTIONS, "Overdue and upcoming obligations belong in one reading order rather than two sections."],
            unknowns: [...SHARED_UNKNOWNS, "No field says an instance was suspended for non-payment, so the cost of ignoring an invoice cannot be stated truthfully yet."],
            css: CSS,
        },
        {
            id: "direction-c",
            title: "Cấp phát dẫn trang",
            thesis: "nivo bán việc dựng hệ thống, nên trang mở bằng cái đang dựng và cái có thể dựng tiếp; phần đã chạy lùi xuống thành bằng chứng.",
            distinction: "CTA chính là cấp phát sản phẩm mới. Tài khoản mới thấy đúng một màn hình: danh mục hai sản phẩm — không có trạng thái rỗng nào phải giải thích.",
            states: [
                { id: "dash-populated", label: "Bảng điều khiển · đang dựng", covers: ["page-dashboard:full-content", "block-provisioning-progress:populated", "block-product-shelf:populated", "block-delivered-list:populated"], html: C_POPULATED },
                { id: "dash-first-run", label: "Bảng điều khiển · tài khoản mới", covers: ["page-dashboard:full-content", "block-product-shelf:populated"], html: C_FIRST_RUN },
                SIGNIN_STATE,
            ],
            stateCoverage: [
                { ownerId: "block-provisioning-progress", state: "populated", coverage: "rendered", scenarioId: "dash-populated", evidence: "ExpertSiteEntity.provisionStatus and provisionError exist; InstanceEntity carries status." },
                { ownerId: "block-product-shelf", state: "populated", coverage: "rendered", scenarioId: "dash-first-run", evidence: "catalogItems(category) exists and the product model is two products." },
                { ownerId: "block-provisioning-progress", state: "failed", coverage: "not-applicable", scenarioId: null, evidence: "Deferred to Preview; provisionError is the field that carries it." },
                ...SIGNIN_COVERAGE,
            ],
            blockTree: "AppChrome (layout)\n└── DashboardPage\n    ├── ProvisioningProgress ← myExpertSites + myInstances\n    ├── ProductShelf         ← catalogItems\n    ├── DeliveredList        ← myInstances\n    └── WalletSummary        ← myWallet",
            contracts: [
                { key: "nav-over-body-page (reuse)", why: "Same chrome relationship as every other authenticated screen." },
                { key: "progress-then-shelf (new)", why: "What is being built now must sit above what could be built next, because a reader who just ordered comes back to check exactly one thing." },
                { key: "label-row-over-card (reuse)", why: "The label is held outside the surface it names." },
            ],
            proposals: SHARED_PROPOSALS,
            backendEnablers: [],
            assumptions: [...SHARED_ASSUMPTIONS, "Provisioning is short enough that a reader waits on the page for it."],
            unknowns: [...SHARED_UNKNOWNS, "There is no subscription and no progress percentage; the 'bước 3/5' shown here is a fixture and would need a real field or must be dropped."],
            css: CSS,
        },
        {
            id: "direction-d",
            title: "Sidebar thu gọn được, theo LearnSidebar của StarCi",
            thesis: "Cùng luận điểm với hướng A - đội hệ thống dẫn trang - nhưng điều hướng chuyển từ thanh trên xuống cột trái thu gọn được, đúng thứ StarCi đang dùng trong `/courses/[courseId]/learn`.",
            distinction: "Đây là bản chuyển thể của CollapsibleSidebar + LearnSidebar: 16rem khi mở, 4rem khi thu, thu gọn tại chỗ chứ không phủ lên, cờ thu gọn nhớ trong localStorage, các mục chia cụm ngăn bằng đường kẻ, badge cuối hàng dùng đúng hai tông - chip cảnh báo cho số cần xử lý, chữ mờ cho số thường. Lưu ý phân biệt: rail 288px ở dashboard của StarCi là thứ KHÁC, do trang vẽ. Vì sidebar đã chiếm mép trái nên thân giữ một cột: sidebar cộng rail là ba cột, ở 1280px cột giữa hết đọc được.",
            states: [
                { id: "dash-populated", label: "Bảng điều khiển · sidebar mở", covers: ["page-dashboard:full-content", "layout-app-chrome:desktop-authenticated", "block-instance-list:populated", "block-wallet-summary:populated"], html: D_POPULATED },
                { id: "dash-collapsed", label: "Bảng điều khiển · sidebar thu gọn (4rem)", covers: ["layout-app-chrome:collapsed"], html: D_COLLAPSED },
                { id: "dash-first-run", label: "Bảng điều khiển · tài khoản mới", covers: ["page-dashboard:full-content", "block-instance-list:empty"], html: D_FIRST_RUN },
                SIGNIN_STATE,
            ],
            stateCoverage: [
                { ownerId: "layout-app-chrome", state: "desktop authenticated", coverage: "rendered", scenarioId: "dash-populated", evidence: "me returns UserEntity with username and avatarUrl; six sections map to existing my* queries." },
                { ownerId: "page-dashboard", state: "full content", coverage: "rendered", scenarioId: "dash-populated", evidence: "myInstances + myInvoices + myTickets + myWallet all exist." },
                { ownerId: "block-instance-list", state: "empty", coverage: "rendered", scenarioId: "dash-first-run", evidence: "A new account owns no instance." },
                { ownerId: "layout-app-chrome", state: "collapsed", coverage: "rendered", scenarioId: "dash-collapsed", evidence: "CollapsibleSidebar collapses in place from 16rem to 4rem and persists the flag; the reference keeps no overlay." },
                { ownerId: "layout-app-chrome", state: "mobile", coverage: "not-applicable", scenarioId: null, evidence: "Deferred to Preview. The reference hides the sidebar below lg and uses a drawer plus LearnMobileTabBar; nivo has neither yet, so this stays the direction's largest unrendered risk." },
                { ownerId: "layout-app-chrome", state: "active section", coverage: "rendered", scenarioId: "dash-populated", evidence: "The chrome may know which section is current; that is navigation and navigation is the layout's own domain (LAYOUT-2)." },
                ...SIGNIN_COVERAGE,
            ],
            blockTree: "AppSidebarChrome (layout)\n├── SidebarNav          ← route + me\n└── DashboardPage\n    ├── InstanceList        ← myInstances\n    ├── WorkNeedingYou      ← myInvoices + myTickets\n    └── WalletSummary       ← myWallet",
            contracts: [
                { key: "sidebar-then-body-app (new)", why: "The chrome sits BESIDE the routed body rather than above it, and survives the body being replaced; nav-over-body-page cannot express that because its children are a navigation stacked over a page." },
                { key: "titled-body (new)", why: "A console body announces which section it is before its first section label, because the sidebar names the destination but not the state of it." },
                { key: "label-row-over-card (reuse)", why: "The label is held outside the surface it names." },
            ],
            proposals: [
                ...SHARED_PROPOSALS,
                {
                    decision: "reject",
                    tier: "contract",
                    name: "nav-over-body-page (for this direction only)",
                    detail: "Its children are navigation over a page leaf, a column. A sidebar chrome needs a row topology, so this direction proposes sidebar-then-body-app instead. The sign-in route still uses centred-authentication-page either way.",
                    callers: "packages/ui/src/contracts/index.ts",
                },
            ],
            backendEnablers: [],
            assumptions: [...SHARED_ASSUMPTIONS, "Six destinations is enough that a permanent list beats a top bar; below four a sidebar is mostly empty space."],
            unknowns: [...SHARED_UNKNOWNS, "The narrow-screen behaviour of the sidebar is undecided and unrendered - drawer, glyph rail or bottom bar are all still open.", "Whether the six sections listed here are the product's real navigation; they are inferred from the my* queries, not from an approved information architecture."],
            css: CSS + SIDEBAR_CSS,
        },
    ],
}
