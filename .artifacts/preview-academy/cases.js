/*
 * Preview lab - L-A optimised, for the academy's landing page and its student entry.
 *
 * ONE CASE, NOT THREE. Plan already chose the direction; this lab exists to make every state of that
 * one direction inspectable, not to reopen the choice.
 *
 * SCENARIOS ARE INTEGRATED ON PURPOSE. Thirty-five owner states across a layout and two pages would
 * be a Cartesian mess rendered one at a time. Each scenario below names every owner state it covers,
 * so responsibility stays separable even though the render is combined.
 *
 * Every value is a labelled fixture. Nothing here is business evidence.
 */

const CSS = `
.k{--bg:#fff;--surface:#f7f7f9;--surface2:#eef0f4;--line:#e6e6ec;--ink:#101014;--dim:#6b6b76;--acc:#3b6fd4;--accfg:#fff;
  background:var(--bg);color:var(--ink);font:14px/1.55 ui-sans-serif,system-ui,sans-serif;border-radius:12px;overflow:hidden;border:1px solid var(--line)}
.k.warm{--bg:#fffaf5;--surface:#fff1e3;--surface2:#fbe6d0;--line:#f0dcc6;--ink:#2a1c10;--dim:#8a7360;--acc:#c2410c}
.k.m{max-width:390px}
.k *{box-sizing:border-box}
.k .s{padding:18px 20px;border-bottom:1px solid var(--line)}
.k .s:last-child{border-bottom:0}
.k .s.alt{background:var(--surface)}
.k h1{font-size:23px;font-weight:680;margin:0 0 6px;letter-spacing:-.01em}
.k h2{font-size:16px;font-weight:640;margin:0 0 8px}
.k p{margin:0;color:var(--dim)}
.k .tag{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);display:block;margin-bottom:6px}
.k .btn{border:0;border-radius:9px;padding:9px 14px;background:var(--acc);color:var(--accfg);font:inherit;font-weight:620;cursor:pointer}
.k .btn.sec{background:transparent;color:var(--ink);border:1px solid var(--line);font-weight:550}
.k .btn[disabled]{opacity:.5;cursor:not-allowed}
.k .btn.focus{outline:2px solid var(--acc);outline-offset:2px}
.k .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.k .g{display:grid;gap:10px;margin-top:10px}
.k .g3{grid-template-columns:repeat(3,1fr)}.k .g2{grid-template-columns:repeat(2,1fr)}
.k.m .g3,.k.m .g2{grid-template-columns:1fr}
.k .c{border:1px solid var(--line);border-radius:11px;padding:12px;background:var(--bg)}
.k .fig{aspect-ratio:4/3;border:1px solid var(--line);border-radius:10px;background:var(--surface2);display:grid;place-items:center;color:var(--dim);font-size:11px;overflow:hidden}
.k .av{width:32px;height:32px;border-radius:50%;border:1px solid var(--line);background:var(--surface2);display:grid;place-items:center;font-size:11px;font-weight:600}
.k .fld{display:flex;flex-direction:column;gap:4px;margin-top:8px}
.k label{font-size:12px;font-weight:550}
.k .inp{border:1px solid var(--line);border-radius:9px;padding:8px 10px;color:var(--dim);font-size:13px;background:var(--bg)}
.k .inp.focus{outline:2px solid var(--acc);outline-offset:1px}
.k .inp.bad{border-color:#dc7b7b}
.k .inp[data-dis]{background:var(--surface2)}
.k .msg{border:1px solid var(--line);background:var(--surface);border-radius:9px;padding:9px 11px;font-size:13px;margin-top:10px}
.k .fx{font-size:10px;color:var(--dim);border:1px dashed var(--line);border-radius:6px;padding:1px 6px;display:inline-block;margin-top:8px}
.k .spin{width:13px;height:13px;border:2px solid var(--line);border-top-color:var(--accfg);border-radius:50%;display:inline-block;vertical-align:-2px;margin-right:6px}
.k .num{font-size:20px;font-weight:680}
.k ol{margin:10px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:9px}
.k ol li{display:flex;gap:10px;font-size:13px}
.k .step{width:24px;height:24px;border-radius:50%;background:var(--acc);color:var(--accfg);display:grid;place-items:center;font-size:12px;font-weight:660;flex:none}
`

/* ---- section fragments; every scenario is assembled from these ---- */

const hero = () => `<div class="s"><span class="tag">hero</span><h1>Học viện Minh Tuệ</h1>
<p>Quản trị doanh nghiệp bằng hệ thống, không bằng cảm tính.</p>
<div class="row"><button class="btn">Học thử miễn phí</button><button class="btn sec">Xem khoá học</button></div></div>`

const problems = () => `<div class="s"><span class="tag">problems</span><h2>Những cái sai thường gặp</h2>
<div class="g g2">${["Chủ làm hết, nghỉ một tuần là công ty đứng.", "Không biết tháng này lãi hay lỗ.", "Người giỏi vào rồi ba tháng đi.", "Mọi quyết định đều phải hỏi chủ."]
        .map((t) => `<div class="c" style="font-size:13px">${t}</div>`).join("")}</div></div>`

const outcomes = () => `<div class="s alt"><span class="tag">outcomes</span><h2>Sau khoá học bạn làm được gì</h2>
<div class="g g3">${["Dựng được bộ máy", "Kiểm soát dòng tiền", "Tuyển và giữ người"]
        .map((t) => `<div class="c" style="font-size:13px;font-weight:560">${t}</div>`).join("")}</div></div>`

const roadmap = () => `<div class="s alt"><span class="tag">roadmap</span><h2>Lộ trình</h2>
<ol>${["Đo lại tiền, người, việc.", "Tách vai của chủ.", "Dựng bộ máy giao việc.", "Gắn số vào từng vai."]
        .map((t, i) => `<li><span class="step">${i + 1}</span><span>${t}</span></li>`).join("")}</ol></div>`

const instructor = (img = "ok") => `<div class="s alt"><span class="tag">instructor</span>
<div style="display:grid;grid-template-columns:130px 1fr;gap:16px">
<div class="fig" style="aspect-ratio:3/4">${img === "ok" ? '<span style="font-size:10px">ảnh đã dán</span>' : img === "none" ? "chưa dán link" : "link hỏng"}</div>
<div><h2 style="margin-bottom:2px">Nguyễn Minh Tuệ</h2>
<p style="font-size:13px">Sáng lập · 18 năm điều hành</p>
<p style="font-size:13px;margin-top:8px;color:var(--ink)">· Điều hành 3 công ty, 240 nhân sự<br>· Cố vấn tái cấu trúc 40+ doanh nghiệp</p>
<blockquote style="border-left:2px solid var(--line);padding-left:10px;margin:10px 0 0;font-size:13px;color:var(--dim)">Doanh nghiệp chết vì chủ không rời ra được.</blockquote></div></div></div>`

const stats = () => `<div class="s"><span class="tag">stats</span>
<div class="g g3" style="margin:0">${[["1.200+", "học viên"], ["40+", "doanh nghiệp"], ["18", "năm"]]
        .map(([v, l]) => `<div><div class="num">${v}</div><div style="font-size:11px;color:var(--dim)">${l}</div></div>`).join("")}</div>
<span class="fx">fixture — và là tuyên bố không ai kiểm (U-B, chưa có luật)</span></div>`

const testimonials = () => `<div class="s alt"><span class="tag">testimonials</span><h2>Học viên nói gì</h2>
<div class="g g2">${[["Trần Quốc Anh", "Chủ chuỗi 4 cửa hàng", "Giờ tôi chỉ xem báo cáo tuần."], ["Lê Thu Hương", "GĐ nội thất", "Khoá này ép tôi buông có phương pháp."]]
        .map(([n, r, q]) => `<div class="c"><div style="display:flex;gap:9px;align-items:center">
<span class="av">${n.split(" ").slice(-2).map((w) => w[0]).join("")}</span>
<div><div style="font-size:13px;font-weight:560">${n}</div><div style="font-size:11px;color:var(--dim)">${r}</div></div>
<span style="margin-left:auto;font-size:11px;color:var(--dim)">★★★★★</span></div>
<p style="font-size:13px;margin-top:8px">${q}</p></div>`).join("")}</div></div>`

const gallery = (broken = false) => `<div class="s"><span class="tag">gallery</span><h2>Hình ảnh hoạt động</h2>
<div class="g g3">${[["Lớp khoá 14", "ok"], ["Hội thi 2025", broken ? "bad" : "ok"], ["Buổi hỏi đáp", broken ? "none" : "ok"]]
        .map(([cap, st]) => `<figure style="margin:0"><div class="fig">${st === "ok" ? '<span style="font-size:10px">ảnh đã dán</span>' : st === "bad" ? "link hỏng" : "chưa dán link"}</div>
<figcaption style="font-size:11px;color:var(--dim);margin-top:5px">${cap}</figcaption></figure>`).join("")}</div>
${broken ? '<span class="fx">link ngoài chết — khung giữ nguyên chỗ, bố cục không xô lệch</span>' : ""}</div>`

const courses = (empty = false) => `<div class="s"><span class="tag">courses</span><h2>Khoá học</h2>
${empty
        ? `<div class="c" style="text-align:center;padding:22px"><b style="font-size:13px">Chưa có khoá học nào</b>
<p style="font-size:12px;margin-top:4px">Khoá đầu tiên sẽ xuất hiện ở đây.</p></div>`
        : `<div class="g g3">${["Dựng bộ máy vận hành", "Dòng tiền cho chủ", "Tuyển và giữ người"]
            .map((t) => `<div class="c"><div class="fig" style="margin-bottom:8px"><span style="font-size:10px">ảnh</span></div>
<div style="font-size:13px;font-weight:560;line-height:1.3">${t}</div><div style="font-size:11px;color:var(--dim);margin-top:3px">12 bài · 4 giờ</div></div>`).join("")}</div>`}</div>`

const community = () => `<div class="s alt"><span class="tag">community</span><h2>Cộng đồng</h2>
<p>Hỏi đáp hằng tuần, và một nhóm cùng đi đường dài.</p></div>`

const offer = () => `<div class="s"><span class="tag">offer</span><h2>Quyền lợi thành viên</h2>
<div class="g g2">${[["Gói tháng", "490k"], ["Gói năm", "4.9tr"]].map(([n, p], i) => `<div class="c">
<div style="font-size:13px;font-weight:560">${n}</div><div class="num" style="margin:4px 0 8px">${p}</div>
<button class="btn ${i ? "sec" : ""}" style="width:100%">Đăng ký</button></div>`).join("")}</div></div>`

const faq = () => `<div class="s alt"><span class="tag">faq</span><h2>Câu hỏi thường gặp</h2>
${[["Tôi bận, học lúc nào?", "Bài quay sẵn. Hỏi đáp trực tiếp mỗi tuần một lần, có ghi hình."], ["Không hợp thì sao?", "Hoàn tiền trong 14 ngày đầu."]]
        .map(([q, a]) => `<div style="border-bottom:1px solid var(--line);padding:10px 0"><div style="font-size:13px;font-weight:560">${q}</div>
<p style="font-size:13px;margin-top:3px">${a}</p></div>`).join("")}</div>`

const magnet = () => `<div class="s alt"><span class="tag">magnet</span><h2>Bộ khung vận hành — bản rút gọn</h2>
<p>Tài liệu 18 trang, đúng bộ khung đang chạy.</p>
<div class="row"><button class="btn">Nhận tài liệu</button></div></div>`

/** `lead` - the only section allowed to take a reader's data. */
const lead = ({ mode = "idle" } = {}) => `<div class="s alt"><span class="tag">lead</span><h2>Học thử miễn phí</h2>
<p style="font-size:13px">Điền thông tin, học viện sẽ liên hệ lại.</p>
${mode === "error" ? '<div class="msg" style="border-color:#dc7b7b">Chưa gửi được. Kiểm tra kết nối rồi thử lại.</div>' : ""}
<div class="g g2">${[["Họ tên", "Nguyễn Văn A"], ["Số điện thoại", "09xx xxx xxx"]].map(([l, v], i) => `<div class="fld">
<label>${l}</label><div class="inp ${mode === "focus" && i === 0 ? "focus" : ""} ${mode === "error" ? "bad" : ""}" ${mode === "pending" ? "data-dis" : ""}>${v}</div></div>`).join("")}</div>
<div class="row"><button class="btn ${mode === "focus" ? "focus" : ""}" ${mode === "pending" ? "disabled" : ""}>
${mode === "pending" ? '<span class="spin"></span>Đang gửi…' : "Gửi thông tin"}</button></div>
<span class="fx">khối DUY NHẤT được nhận dữ liệu người đọc (BR-B07)</span></div>`

/* ---- the six custom shapes ---- */
const custom = (v) => {
    const head = '<h2>Học phí trả góp</h2>'
    const body = '<p>Đóng 3 đợt, không lãi. Đợt đầu 40% khi nhập học.</p>'
    const btn = '<div class="row"><button class="btn">Hỏi về học phí</button></div>'
    const fig = '<div class="fig"><span style="font-size:10px">ảnh đã dán</span></div>'
    const tag = `<span class="tag">custom:hoc-phi · ${v}</span>`
    if (v === "quote") {
        return `<div class="s">${tag}<blockquote style="border-left:4px solid var(--acc);padding-left:14px;margin:0;font-size:18px;font-weight:560;line-height:1.35">Học nghề là học cách sống được bằng nghề.</blockquote>
<p style="font-size:13px;margin-top:8px">— Phạm Thị Hoa</p></div>`
    }
    if (v === "columns") {
        return `<div class="s">${tag}${head}<div class="g g3">${["Đợt 1 · 40%", "Đợt 2 · 30%", "Đợt 3 · 30%"]
            .map((t) => `<div class="c" style="font-size:13px;font-weight:560">${t}</div>`).join("")}</div>${btn}</div>`
    }
    if (v === "cta") {
        return `<div class="s alt">${tag}<div style="text-align:center">${head}${body}<div class="row" style="justify-content:center">${btn.replace(/<div class="row">|<\/div>$/g, "")}</div></div></div>`
    }
    if (v === "image-left" || v === "image-right") {
        const text = `<div>${head}${body}${btn}</div>`
        return `<div class="s">${tag}<div class="g g2" style="align-items:center;margin-top:0">${v === "image-left" ? fig + text : text + fig}</div></div>`
    }
    return `<div class="s">${tag}${head}${fig}${body}${btn}</div>`
}

const page = (cls, inner) => `<div class="k ${cls}">${inner}</div>`

/* ---- auth ---- */
const authShell = (cls, inner) => `<div class="k ${cls}"><div class="s" style="border:0;padding:26px 20px">
<div style="max-width:340px;margin:0 auto">${inner}</div></div></div>`

const authHead = (t, s) => `<div style="text-align:center;margin-bottom:14px">
<h1 style="font-size:20px">Học viện Minh Tuệ</h1><p style="font-size:12px">Khoá học quản trị cho chủ doanh nghiệp.</p>
<h2 style="margin:14px 0 2px">${t}</h2><p style="font-size:12px">${s}</p></div>`

const providers = (dis = false, focus = false) => `<div style="display:flex;flex-direction:column;gap:8px">
<button class="btn sec ${focus ? "focus" : ""}" ${dis ? "disabled" : ""}>Tiếp tục với Google</button>
<button class="btn sec" ${dis ? "disabled" : ""}>Tiếp tục với GitHub</button></div>
<div style="text-align:center;font-size:11px;color:var(--dim);margin:11px 0">hoặc</div>`

const credentials = ({ mode = "idle", signUp = true } = {}) => `
${mode === "refused" ? '<div class="msg" style="border-color:#dc7b7b" role="alert">Email hoặc mật khẩu không đúng.</div>' : ""}
<div class="fld"><label>Email</label><div class="inp ${mode === "refused" ? "bad" : ""} ${mode === "focus" ? "focus" : ""}" ${mode === "pending" ? "data-dis" : ""}>ban@email.com</div></div>
<div class="fld"><label>Mật khẩu</label><div class="inp ${mode === "refused" ? "bad" : ""}" ${mode === "pending" ? "data-dis" : ""}>••••••••</div></div>
<div class="row"><button class="btn" style="width:100%" ${mode === "pending" ? "disabled" : ""}>
${mode === "pending" ? '<span class="spin"></span>Đang kiểm tra…' : signUp ? "Tạo tài khoản" : "Đăng nhập"}</button></div>
<div style="display:flex;justify-content:space-between;margin-top:11px;font-size:12px;color:var(--dim)">
<span>${signUp ? "Đã có tài khoản?" : "Quên mật khẩu?"}</span><span>${signUp ? "Đăng nhập" : "Tạo tài khoản"}</span></div>`

const notice = (text, note) => authShell("", `${authHead("Học viện Minh Tuệ", "")}
<div class="msg" role="status">${text}</div>
<div class="row"><button class="btn sec" style="width:100%">Quay lại</button></div>
<span class="fx">${note}</span>`)

/* ---- scenarios; each names the owner states it covers ---- */

const FULL = hero() + problems() + outcomes() + roadmap() + instructor() + stats()
    + testimonials() + gallery() + courses() + community() + offer() + faq() + magnet() + lead()

window.STARCI_REVIEW = {
    title: "PREVIEW · L-A đã chọn — landing học viện + cửa vào học viên",
    scope: "batch · layout-academy-chrome + page-academy-landing + page-academy-auth",
    mode: "mixed — L-A đã được chọn ở plan; lab này không mở lại lựa chọn",
    evidence: [
        { source: "plan-record.json", claim: "status=direction-selected, selected=L-A, có bằng chứng chọn. 35 trạng thái bắt buộc trên 3 owner, 0 ẩn số chặn." },
        { source: "chỉ đạo của thầy", claim: "Template mount thành FILE lúc provision → landing KHÔNG có trạng thái đang tải hay lỗi. Đánh N/A kèm lý do, không bỏ lặng." },
        { source: "chỉ đạo của thầy", claim: "Học viên đã đăng nhập → chuyển về dashboard. Route đó là việc sau, nên lab vẽ Ý ĐỊNH chuyển hướng chứ không vẽ đích chưa tồn tại." },
        { source: "expert-branding.md BR-B02", claim: "Màu là ô có tên → biến CSS. Vì thế mọi kịch bản đều có bản bảng màu thứ hai." },
        { source: "layout-config.ts", claim: "Vị trí trong mảng LÀ thứ tự render; khối tắt không để lại lỗ." },
        { source: "e2e password-reset", claim: "Không tiết lộ email có tài khoản hay không — ràng buộc câu chữ ở hai trạng thái." },
        { source: "e2e sign-up-and-sign-in", claim: "Tài khoản 2FA nhận challenge, không phải session, nên nó có trạng thái riêng." },
        { source: "packages/ui", claim: "Không cần leaf hay composite mới. Hai owner mới: AcademyChrome (layout), StudentEntryPanel (block)." },
    ],
    cases: [
        {
            id: "case-la",
            title: "L-A · Thang bậc theo thứ tự catalog",
            thesis: "Người lạ trèo từng bậc theo đúng thứ tự backend đã đặt tên, và tắt bậc nào trang vẫn đứng vững — nên cú bấm tiếp theo luôn có sẵn dù học viện đã dựng được bao nhiêu.",
            distinction: "Hướng duy nhất không cần một tuyên bố chưa chứng minh nào. Đánh đổi: trang dài nhất.",
            states: [
                { id: "s01", label: "Landing · đủ bậc · desktop", html: page("", FULL) },
                { id: "s02", label: "Landing · đủ bậc · mobile", html: page("m", FULL) },
                { id: "s03", label: "Landing · bảng màu học viện khác", html: page("warm", hero() + instructor() + courses() + lead()) },
                { id: "s04", label: "Landing · học viện ngày đầu (mặc định chưa provision)", html: page("", hero() + outcomes() + courses(true) + faq() + lead()) },
                { id: "s05", label: "Landing · tắt bớt khối", html: page("", hero() + courses() + lead()) },
                { id: "s06", label: "Landing · đổi thứ tự (lead lên thứ hai)", html: page("", hero() + lead() + courses() + instructor()) },
                { id: "s07", label: "Landing · ảnh thiếu và ảnh hỏng", html: page("", instructor("bad") + gallery(true)) },
                { id: "s08", label: "Landing · có CSS riêng của học viện", html: page("", `<style>[data-fx] .s .tag{color:var(--acc)}[data-fx] h1{letter-spacing:-.03em}</style><div data-fx>${hero() + courses()}</div>`) },
                { id: "s09", label: "Khối tự tạo · stack", html: page("", custom("stack")) },
                { id: "s10", label: "Khối tự tạo · image-left", html: page("", custom("image-left")) },
                { id: "s11", label: "Khối tự tạo · image-right", html: page("", custom("image-right")) },
                { id: "s12", label: "Khối tự tạo · quote", html: page("", custom("quote")) },
                { id: "s13", label: "Khối tự tạo · columns", html: page("", custom("columns")) },
                { id: "s14", label: "Khối tự tạo · cta", html: page("", custom("cta")) },
                { id: "s15", label: "Lead · đang gửi (khoá nút)", html: page("", lead({ mode: "pending" })) },
                { id: "s16", label: "Lead · gửi hỏng", html: page("", lead({ mode: "error" })) },
                { id: "s17", label: "Lead · bàn phím / tiêu điểm", html: page("", lead({ mode: "focus" })) },
                { id: "s18", label: "Cửa vào · đăng ký · desktop", html: authShell("", authHead("Đăng ký học thử", "Miễn phí, không cần thẻ.") + providers() + credentials()) },
                { id: "s19", label: "Cửa vào · đăng ký · mobile", html: authShell("m", authHead("Đăng ký học thử", "Miễn phí, không cần thẻ.") + providers() + credentials()) },
                { id: "s20", label: "Cửa vào · bảng màu học viện khác", html: authShell("warm", authHead("Đăng ký học thử", "Miễn phí, không cần thẻ.") + providers() + credentials()) },
                { id: "s21", label: "Cửa vào · đăng nhập", html: authShell("", authHead("Đăng nhập", "Tiếp tục lộ trình của bạn.") + providers() + credentials({ signUp: false })) },
                { id: "s22", label: "Cửa vào · đang gửi (provider bị khoá)", html: authShell("", authHead("Đăng ký học thử", "Miễn phí, không cần thẻ.") + providers(true) + credentials({ mode: "pending" })) },
                { id: "s23", label: "Cửa vào · bị từ chối", html: authShell("", authHead("Đăng nhập", "Tiếp tục lộ trình của bạn.") + providers() + credentials({ mode: "refused", signUp: false })) },
                { id: "s24", label: "Cửa vào · bàn phím / tiêu điểm", html: authShell("", authHead("Đăng ký học thử", "Miễn phí, không cần thẻ.") + providers(false, true) + credentials({ mode: "focus" })) },
                { id: "s25", label: "Cửa vào · đã gửi liên kết đặt lại", html: notice("Nếu có tài khoản dùng email này, chúng tôi đã gửi liên kết đặt lại mật khẩu.", "câu chữ là RÀNG BUỘC: không tiết lộ email có tài khoản hay không") },
                { id: "s26", label: "Cửa vào · gặp 2FA (chưa hỗ trợ)", html: notice("Tài khoản này bật xác minh hai lớp. Học viện chưa hỗ trợ bước đó trên bản này — hãy tạm tắt, hoặc dùng tài khoản khác.", "tài khoản này KHÔNG thất bại và KHÔNG thành công — nên nó có câu riêng") },
                { id: "s27", label: "Cửa vào · rời trang sang Google", html: notice("Đang chuyển tới Google… Bạn sẽ quay lại ngay sau khi đăng nhập xong.", "OAuth là RỜI TRANG, không phải spinner trên nút") },
                { id: "s28", label: "Cửa vào · callback thất bại", html: notice("Không hoàn tất được đăng nhập. Liên kết có thể đã hết hạn.", "e2e: mã hỏng bị từ chối và KHÔNG ghi gì — câu chữ không được ám chỉ có tài khoản dở dang") },
                { id: "s29", label: "Cửa vào · đã đăng nhập rồi", html: notice("Đang đưa bạn về trang học…", "U-F đã chốt: chuyển về dashboard. Route đó là việc sau, nên đây vẽ Ý ĐỊNH chuyển chứ không vẽ đích") },
            ],
            blockTree: "Layout · AcademyChrome        ← owner mới; đọc template mount, ghi biến CSS\n├── Page · AcademyLanding\n│   └── Block · một khối cho mỗi key hiện, theo thứ tự đã lưu\n│       └── Block · CustomSection (một trình vẽ cho mọi khối tự tạo)\n└── Page · AcademyAuth\n    └── Block · StudentEntryPanel   ← owner mới",
            contracts: [
                { key: "ordered-toggleable-section-stack", why: "Các khối là hàng xóm ngang cấp chứ không lồng nhau, nên tắt một khối bỏ đi một hàng chứ không để lại lỗ, và dời một khối chỉ đổi vị trí của nó." },
            ],
            proposals: [
                { name: "AcademyChrome", tier: "layout · owner mới", why: "Người đọc DUY NHẤT của template mount và người ghi duy nhất của bảng màu. Một hook mọi khối gọi được thì rải một quyết định ra khắp nơi và không còn chỗ nào chứng minh việc phối màu chạy đúng." },
                { name: "StudentEntryPanel", tier: "block · owner mới", why: "SignInPanel của control plane cân cho người ĐÃ có tài khoản. Cửa vào của học viên dẫn bằng đăng ký — câu sản phẩm khác, không phải một cờ chế độ." },
            ],
            assumptions: ["Thứ tự catalog vốn hợp lý vì backend và hai trang tham chiếu đều theo nó."],
            unknowns: [
                "U-A: ảnh ngoài lộ IP học viên cho bên thứ ba. Đã đặt no-referrer, nhưng nó không giấu được địa chỉ.",
                "U-B: stats/testimonials/bằng cấp là tuyên bố không kiểm được chạy trên hạ tầng nivo. Chưa luật nào phủ.",
                "U-C: instructor là khối hệ thống hay tự tạo — ca đầu tiên BR-B06 không cắt gọn.",
                "U-D: tên miền riêng hay subdomain nivo.",
                "U-E: guarantee · audience · schedule — ba bậc mô hình dự đoán, chưa dựng.",
            ],
            css: CSS,
        },
    ],
}
