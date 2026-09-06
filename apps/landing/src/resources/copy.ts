/** Search and social description for the public NIVO landing surface. */
export const LANDING_DESCRIPTION = "NIVO Agentic OS — System of Responsibility cho doanh nghiệp vận hành cùng Human, AI và System.";

/** Canonical Vietnamese product narrative consumed by the landing surface. */
export const LANDING_COPY = {
  labels: {
    skip: "Bỏ qua đến nội dung chính", home: "NIVO — về đầu trang", nav: "Điều hướng chính",
    navItems: [{ href: "#responsibility", label: "Trách nhiệm" }, { href: "#operating-loop", label: "Cách hoạt động" }, { href: "#offer", label: "Bắt đầu" }],
    arrow: "→", operatingModel: "03 — OPERATING MODEL", intentEyebrow: "Start with intent", intentTitle: "Bắt đầu từ điều business cần tiến lên.", explore: "Khám phá intent", mantra: "Human leads. AI operates. System learns.", copyright: "© 2026 NIVO Agentic OS"
  },
  hero: {
    eyebrow: "AI-Native Business Operating Platform", title: "Founder không còn phải tự mình làm Operating System của business.", lede: "NIVO biến mục tiêu thành responsibility rõ ràng, để Human dẫn dắt, AI vận hành và System học từ mỗi outcome đã được kiểm chứng.", primary: "Tìm responsibility đầu tiên", secondary: "Xem NIVO hoạt động thế nào", note: "Bắt đầu trong 7 ngày · Không cần thẻ",
    artAlt: "Kỳ lân NIVO dẫn dắt một vòng lặp responsibility kết nối con người, AI, evidence và kết quả được kiểm chứng.", mapLabel: "Minh họa System of Responsibility", mapStatus: "Responsibility đang vận hành", mapKicker: "NIVO AGENTIC OS", mapTitle: "Growth Pipeline", mapOwner: "Owner: Founder · AI operator: Revenue Agent", mapFlow: ["Context", "Evidence", "Outcome"], proofTitle: "Verified outcome", proofBody: "3 cơ hội đã đủ evidence để quyết định"
  },
  shift: { index: "01 — THE SHIFT", title: "Business không thiếu thêm một AI tool. Business thiếu một hệ thống biết ai chịu trách nhiệm.", body: "Task rời rạc tạo ra activity. Responsibility có context, evidence và outcome mới tạo ra tiến bộ có thể kiểm chứng." },
  responsibility: { eyebrow: "System of Responsibility", title: "Mỗi mục tiêu có một người dẫn dắt. Một hệ thống cùng vận hành.", body: "NIVO biến công việc quan trọng thành responsibility rõ ràng — đủ ngữ cảnh để AI vận hành, đủ evidence để con người quyết định.", items: [
    { title: "Responsibility", body: "Điều gì phải được hoàn thành — và ai là người chịu trách nhiệm cuối cùng." },
    { title: "Context", body: "Quyết định, dữ liệu và tri thức cần thiết được đặt đúng chỗ." },
    { title: "Evidence", body: "Mọi hành động để lại dấu vết có thể xem lại và kiểm chứng." },
    { title: "Verified outcome", body: "Kết quả được xác nhận trước khi trở thành trust cho vòng tiếp theo." }
  ] },
  loop: { eyebrow: "The operating loop", title: "Từ context đến trust — trong một vòng lặp có trách nhiệm.", lede: "NIVO kết nối con người, AI và hệ thống quanh kết quả cần đạt, thay vì quanh danh sách task.", steps: ["Context", "Responsibility", "Human + AI + System", "Evidence", "Verified outcome", "Trust"], caption: "Mỗi vòng lặp làm hệ thống hiểu business hơn — không phải bằng lời hứa, mà bằng evidence." },
  roles: [{ label: "Human", title: "Human Leads.", body: "Con người đặt hướng, giữ phán đoán và chịu trách nhiệm cho quyết định cuối cùng." }, { label: "AI", title: "AI Operates.", body: "AI xử lý phần việc lặp lại, theo dõi tín hiệu và đưa công việc tiến về outcome." }, { label: "System", title: "System Learns.", body: "Hệ thống giữ context và evidence để mỗi vòng sau vận hành tốt hơn vòng trước." }],
  intents: [{ title: "Tạo", body: "Biến một ý tưởng thành offer, workflow và responsibility có thể bắt đầu." }, { title: "Điều hành", body: "Biết điều gì đang chạy, ai đang giữ trách nhiệm và đâu là điểm cần quyết định." }, { title: "Revenue", body: "Theo dõi pipeline và evidence để tập trung vào cơ hội có khả năng tiến lên." }, { title: "Money", body: "Giữ dòng tiền, nghĩa vụ và quyết định tài chính trong một context đáng tin cậy." }],
  instances: { eyebrow: "One OS. Many responsibilities.", title: "Một workspace không chỉ có một bot.", body: "Một công ty có nhiều người với nhiều trách nhiệm. NIVO cũng vậy: một OS hoặc workspace có thể sở hữu nhiều responsibility và nhiều module instance — mỗi instance có owner, context, evidence và vòng đời riêng.", items: [{ intent: "Revenue", name: "Pipeline Agent · HCM", meta: "Instance 01 · Active" }, { intent: "Money", name: "Accounting · Company A", meta: "Instance 02 · Active" }, { intent: "Operate", name: "Customer Chatbot · Brand B", meta: "Instance 03 · Learning" }] },
  offer: { eyebrow: "Start small. Learn by doing.", title: "Chọn một responsibility. Để NIVO cùng bạn vận hành.", body: "Không cần thay đổi toàn bộ business trong một ngày. Bắt đầu với nơi đang cần rõ trách nhiệm nhất.", plan: "NIVO START", price: "499.000", unit: " VND / tháng", benefits: ["Một workspace NIVO", "Bắt đầu với responsibility đầu tiên", "Human + AI + System trong một operating loop", "7 ngày đầu miễn phí"], href: "mailto:hello@nivo.vn?subject=Tìm responsibility đầu tiên", note: "Không cần thẻ. Dừng bất cứ lúc nào." }
} as const;
