/*
 * Direction lab - three briefs for the academy's landing page and its student entry.
 *
 * LIGHTWEIGHT ON PURPOSE. Plan owns which direction, not how it finally looks; preview owns the
 * optimisation once one is chosen. Each brief shows only the states that make it DIFFERENT from the
 * others, plus the two states that break one of them - because a direction that collapses on a new
 * academy is a fact the reader should see rather than read about.
 *
 * Every value is a labelled fixture. Nothing here is business evidence.
 */

const CSS = `
.k{--bg:#fff;--surface:#f7f7f9;--line:#e6e6ec;--ink:#101014;--dim:#6b6b76;--acc:#3b6fd4;
  background:var(--bg);color:var(--ink);font:14px/1.55 ui-sans-serif,system-ui,sans-serif;border-radius:14px;overflow:hidden}
.k.warm{--bg:#fffaf5;--surface:#fff1e3;--line:#f0dcc6;--ink:#2a1c10;--dim:#8a7360;--acc:#c2410c}
.k *{box-sizing:border-box}
.k .s{padding:20px 22px;border-bottom:1px solid var(--line)}
.k .s:last-child{border-bottom:0}
.k .s.alt{background:var(--surface)}
.k h1{font-size:24px;font-weight:680;margin:0 0 6px}
.k h2{font-size:16px;font-weight:640;margin:0 0 8px}
.k p{margin:0;color:var(--dim)}
.k .tag{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);display:block;margin-bottom:6px}
.k .btn{border:0;border-radius:9px;padding:9px 14px;background:var(--acc);color:#fff;font:inherit;font-weight:620;cursor:pointer}
.k .btn.sec{background:transparent;color:var(--ink);border:1px solid var(--line);font-weight:550}
.k .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.k .g{display:grid;gap:10px;margin-top:10px}
.k .g3{grid-template-columns:repeat(3,1fr)}.k .g2{grid-template-columns:repeat(2,1fr)}
.k .c{border:1px solid var(--line);border-radius:11px;padding:12px;background:var(--bg)}
.k .fig{aspect-ratio:4/3;border:1px solid var(--line);border-radius:10px;background:var(--surface);display:grid;place-items:center;color:var(--dim);font-size:11px}
.k .av{width:34px;height:34px;border-radius:50%;border:1px solid var(--line);background:var(--surface);display:grid;place-items:center;font-size:11px;font-weight:600}
.k .fld{display:flex;flex-direction:column;gap:4px;margin-top:8px}
.k label{font-size:12px;font-weight:550}
.k .inp{border:1px solid var(--line);border-radius:9px;padding:8px 10px;color:var(--dim);font-size:13px}
.k .fx{font-size:10px;color:var(--dim);border:1px dashed var(--line);border-radius:6px;padding:1px 6px;display:inline-block;margin-top:8px}
.k .warn{border:1px solid #fdba74;background:#fff7ed;color:#9a3412;border-radius:9px;padding:10px;font-size:13px}
`

const hero = () => `<div class="s"><span class="tag">hero</span><h1>Học viện Minh Tuệ</h1>
<p>Quản trị doanh nghiệp bằng hệ thống, không bằng cảm tính.</p>
<div class="row"><button class="btn">Học thử miễn phí</button><button class="btn sec">Xem khoá học</button></div></div>`

const teacher = () => `<div class="s alt"><span class="tag">instructor</span>
<div style="display:grid;grid-template-columns:120px 1fr;gap:14px">
<div class="fig" style="aspect-ratio:3/4">ảnh</div>
<div><h2>Nguyễn Minh Tuệ</h2><p style="font-size:13px">Sáng lập · 18 năm điều hành</p>
<p style="font-size:13px;margin-top:6px">· Điều hành 3 công ty<br>· Cố vấn 40+ doanh nghiệp</p></div></div></div>`

const says = () => `<div class="s"><span class="tag">testimonials</span><h2>Học viên nói gì</h2>
<div class="g g2">${[["Trần Quốc Anh","Chủ chuỗi 4 cửa hàng"],["Lê Thu Hương","GĐ nội thất"]]
        .map(([n, r]) => `<div class="c"><div style="display:flex;gap:9px;align-items:center">
<span class="av">${n.split(" ").slice(-2).map((w) => w[0]).join("")}</span>
<div><div style="font-size:13px;font-weight:560">${n}</div><div style="font-size:11px;color:var(--dim)">${r}</div></div></div>
<p style="font-size:13px;margin-top:8px">Giờ tôi chỉ xem báo cáo tuần.</p></div>`).join("")}</div></div>`

const nums = () => `<div class="s alt"><span class="tag">stats</span>
<div class="g g3" style="margin:0">${[["1.200+","học viên"],["40+","doanh nghiệp"],["18","năm"]]
        .map(([v, l]) => `<div><div style="font-size:21px;font-weight:680">${v}</div><div style="font-size:11px;color:var(--dim)">${l}</div></div>`).join("")}</div>
<span class="fx">số liệu là fixture — và là tuyên bố không ai kiểm (U-B)</span></div>`

const courses = (empty = false) => `<div class="s"><span class="tag">courses</span><h2>Khoá học</h2>
${empty
        ? `<div class="c" style="text-align:center;padding:22px"><b style="font-size:13px">Chưa có khoá học nào</b>
<p style="font-size:12px;margin-top:4px">Khoá đầu tiên sẽ xuất hiện ở đây.</p></div>`
        : `<div class="g g3">${[1, 2, 3].map((i) => `<div class="c"><div class="fig" style="margin-bottom:8px">ảnh</div>
<div style="font-size:13px;font-weight:560">Khoá ${i}</div><div style="font-size:11px;color:var(--dim)">12 bài · 4 giờ</div></div>`).join("")}</div>`}</div>`

const lead = () => `<div class="s alt"><span class="tag">lead</span><h2>Học thử miễn phí</h2>
<p style="font-size:13px">Điền thông tin, học viện sẽ liên hệ lại.</p>
<div class="g g2">${["Họ tên", "Số điện thoại"].map((l) => `<div class="fld"><label>${l}</label><div class="inp">${l}</div></div>`).join("")}</div>
<div class="row"><button class="btn">Gửi thông tin</button></div>
<span class="fx">khối DUY NHẤT được nhận dữ liệu người đọc (BR-B07)</span></div>`

const more = (n) => `<div class="s"><span class="tag">gấp lại</span>
<button class="btn sec" style="width:100%">Tìm hiểu thêm (${n} phần)</button>
<span class="fx">L-C giấu đúng thứ người mua cẩn thận cần</span></div>`

const auth = (mode, extra = "") => `<div class="k"><div class="s" style="border:0">
<div style="max-width:340px;margin:0 auto">
<h1 style="font-size:19px;text-align:center">${mode === "signUp" ? "Đăng ký học thử" : "Đăng nhập"}</h1>
<p style="text-align:center;font-size:12px">${mode === "signUp" ? "Miễn phí, không cần thẻ." : "Tiếp tục lộ trình của bạn."}</p>
${extra}
<div class="row" style="flex-direction:column;margin-top:12px">
<button class="btn sec" style="width:100%">Tiếp tục với Google</button>
<button class="btn sec" style="width:100%">Tiếp tục với GitHub</button></div>
<div style="text-align:center;font-size:11px;color:var(--dim);margin:10px 0">hoặc</div>
<div class="fld"><label>Email</label><div class="inp">ban@email.com</div></div>
<div class="fld"><label>Mật khẩu</label><div class="inp">••••••••</div></div>
<div class="row"><button class="btn" style="width:100%">${mode === "signUp" ? "Tạo tài khoản" : "Đăng nhập"}</button></div>
</div></div></div>`

const page = (cls, inner) => `<div class="k ${cls}">${inner}</div>`

/** Every brief owes these two: they are where the directions stop being equivalent. */
const SHARED = (p, order) => [
    {
        id: `${p}-newday`,
        label: "Học viện ngày đầu (chưa có gì)",
        html: page("", order.filter((s) => !["instructor", "testimonials", "stats"].includes(s.key))
            .map((s) => s.html).join("") || courses(true)),
    },
    { id: `${p}-warm`, label: "Bảng màu học viện khác", html: page("warm", order.slice(0, 3).map((s) => s.html).join("")) },
]

window.STARCI_REVIEW = {
    title: "nivo học viện · ba hướng cho landing + cửa vào học viên",
    scope: "layout · page (batch 3 owner)",
    mode: "mixed — landing có baseline parity; auth học viên chưa từng có",
    evidence: [
        { source: "chỉ đạo của thầy", claim: "Template được mount thành FILE lúc provision. Không tra tenant lúc chạy, nên landing không có trạng thái đang tải hay lỗi." },
        { source: "chỉ đạo của thầy", claim: "Ảnh là link dán vào; nivo không giữ tệp nào." },
        { source: "layout-config.ts", claim: "Catalog cố định, và vị trí trong mảng LÀ thứ tự render." },
        { source: "expert-branding.md BR-B02", claim: "Màu là ô có tên → biến CSS. Component viết cứng màu chỉ lộ lỗi ở học viện thứ hai." },
        { source: "e2e expert-site-goes-live", claim: "Site công khai thu lead, chỉ chủ site thấy." },
        { source: "e2e password-reset", claim: "KHÔNG tiết lộ email có tài khoản hay không — đây là thứ giết nửa auth của L-C." },
        { source: "e2e sign-up-and-sign-in", claim: "Tài khoản bật 2FA nhận challenge, không phải session." },
        { source: "packages/ui", claim: "Input · Field · Button · Divider · Heading · Text · TextLink đã đủ. Không cần leaf hay composite mới." },
        { source: "ceovietnam.edu.vn + taitue.academy", claim: "Cả hai dồn rất nặng vào bậc 'tin người'." },
    ],
    cases: [
        {
            id: "L-A",
            title: "L-A · Thang bậc theo thứ tự catalog",
            thesis: "Người lạ trèo từng bậc theo đúng thứ tự backend đã đặt tên, và tắt bậc nào trang vẫn đứng vững.",
            distinction: "Không cần một tuyên bố chưa chứng minh nào. Đổi lại, đây là trang dài nhất.",
            states: [
                { id: "la-full", label: "Landing · đủ bậc", html: page("", hero() + courses() + teacher() + nums() + says() + lead()) },
                { id: "la-newday", label: "Landing · học viện ngày đầu", html: page("", hero() + courses(true) + lead()) },
                { id: "la-warm", label: "Landing · bảng màu khác", html: page("warm", hero() + courses() + lead()) },
                { id: "la-auth", label: "Cửa vào · đăng ký dẫn", html: auth("signUp") },
            ],
            blockTree: "Layout · AcademyChrome\n├── Page · AcademyLanding (14 khối theo thứ tự catalog)\n└── Page · AcademyAuth\n    └── Block · StudentEntryPanel",
            contracts: [{ key: "ordered-toggleable-section-stack", why: "Các khối là hàng xóm ngang cấp, nên tắt một khối bỏ đi một hàng chứ không để lại lỗ." }],
            proposals: [
                { name: "AcademyChrome", tier: "layout · owner mới", why: "Người đọc duy nhất của template, người ghi duy nhất của bảng màu." },
                { name: "StudentEntryPanel", tier: "block · owner mới", why: "Cửa vào của học viên dẫn bằng đăng ký — câu sản phẩm khác với SignInPanel của control plane." },
            ],
            assumptions: ["Thứ tự catalog vốn đã hợp lý vì backend và ba trang tham chiếu đều theo nó."],
            unknowns: ["U-F: học viên đã đăng nhập rồi thì đi đâu? Chưa có route đích."],
            css: CSS,
        },
        {
            id: "L-B",
            title: "L-B · Bằng chứng trước giá",
            thesis: "Không ai mua khoá của người lạ, nên ai dạy và ai đã học xong đứng trước cả khoá học lẫn giá.",
            distinction: "Đổi thứ tự đọc: ba khối 'tin người' nhảy lên ngay sau hero.",
            states: [
                { id: "lb-full", label: "Landing · đủ bậc", html: page("", hero() + teacher() + says() + nums() + courses() + lead()) },
                { id: "lb-newday", label: "Landing · học viện ngày đầu ⚠", html: page("", hero() + `<div class="s"><div class="warn">Ba khối dẫn đầu của L-B đều rỗng ở ngày đầu: chưa ảnh giảng viên, chưa cảm nhận, chưa số liệu. Trang tụt xuống còn hero và một dòng.</div></div>` + courses(true) + lead()) },
                { id: "lb-warm", label: "Landing · bảng màu khác", html: page("warm", hero() + teacher() + says()) },
                { id: "lb-auth", label: "Cửa vào · có giảng viên cạnh form", html: auth("signUp", `<div class="c" style="margin-top:12px;display:flex;gap:9px;align-items:center"><span class="av">MT</span><div style="font-size:12px">Học viện của<br><b>Nguyễn Minh Tuệ</b></div></div>`) },
            ],
            blockTree: "Layout · AcademyChrome\n├── Page · AcademyLanding (tin người lên đầu)\n└── Page · AcademyAuth\n    ├── Block · InstructorAside ← DỰNG THÊM\n    └── Block · StudentEntryPanel",
            contracts: [{ key: "proof-over-offer", why: "Thứ đứng trước là thứ trang muốn người đọc tin trước; đặt bằng chứng lên đầu chỉ trung thực khi bằng chứng có thật." }],
            proposals: [
                { name: "AcademyChrome", tier: "layout · owner mới", why: "Như L-A." },
                { name: "StudentEntryPanel", tier: "block · owner mới", why: "Như L-A." },
                { name: "InstructorAside", tier: "block · owner mới", why: "RỦI RO: rỗng với học viện chưa dán ảnh giảng viên, tức mọi học viện ngày đầu." },
            ],
            assumptions: ["Học viện đã có ảnh giảng viên, cảm nhận và số liệu."],
            unknowns: ["Giả định trên sai với MỌI học viện mới — xem state lb-newday.", "U-B cắn mạnh nhất ở đây: toàn bộ tuyên bố không kiểm được dồn lên đầu trang."],
            css: CSS,
        },
        {
            id: "L-C",
            title: "L-C · Mỗi lúc một câu hỏi",
            thesis: "Trang hỏi quyết định sớm nhất có thể: phễu ngắn hero → outcomes → khoá học → liên hệ, mọi bậc khác gấp sau một nút.",
            distinction: "Đổi TIẾT LỘ, không chỉ thứ tự. Và auth hỏi email trước, mật khẩu sau.",
            states: [
                { id: "lc-full", label: "Landing · phễu ngắn", html: page("", hero() + courses() + lead() + more(6)) },
                { id: "lc-newday", label: "Landing · học viện ngày đầu", html: page("", hero() + courses(true) + lead()) },
                { id: "lc-warm", label: "Landing · bảng màu khác", html: page("warm", hero() + courses() + lead()) },
                {
                    id: "lc-auth",
                    label: "Cửa vào · hỏi email trước ⚠",
                    html: `<div class="k"><div class="s" style="border:0"><div style="max-width:340px;margin:0 auto">
<h1 style="font-size:19px;text-align:center">Tiếp tục</h1>
<div class="fld"><label>Email</label><div class="inp">ban@email.com</div></div>
<div class="row"><button class="btn" style="width:100%">Tiếp tục</button></div>
<div class="warn" style="margin-top:14px">Bước này đòi backend trả lời "email này có tài khoản chưa" — đúng điều e2e <code>password-reset</code> chứng minh sản phẩm CỐ Ý từ chối tiết lộ. Nửa auth của L-C không ship được như mô tả.</div>
</div></div></div>`,
                },
            ],
            blockTree: "Layout · AcademyChrome\n├── Page · AcademyLanding\n│   ├── Block · bốn khối phễu\n│   └── Block · DisclosureRail ← DỰNG THÊM\n└── Page · AcademyAuth\n    └── Block · StagedEntryPanel ← CHẶN bởi BE-4",
            contracts: [{ key: "funnel-over-disclosure", why: "Phần gấp lại tồn tại vì phần lớn người đọc không cần nó; nó mở tại chỗ chứ không sang trang khác." }],
            proposals: [
                { name: "AcademyChrome", tier: "layout · owner mới", why: "Như L-A." },
                { name: "DisclosureRail", tier: "block · owner mới", why: "Gấp lại đúng thứ người mua cẩn thận cần — chính nút gấp trở thành cả quyết định thiết kế." },
                { name: "StagedEntryPanel", tier: "block · owner mới", why: "CHẶN: cần BE-4, mà BE-4 mâu thuẫn với một quyết định riêng tư đã có test." },
            ],
            assumptions: ["Người mua quyết nhanh và không cần bằng chứng trước khi để lại liên hệ."],
            unknowns: ["BE-4 là `backend-design` và mâu thuẫn với e2e hiện có. Đây là lý do hướng này gãy một nửa."],
            css: CSS,
        },
    ],
}
