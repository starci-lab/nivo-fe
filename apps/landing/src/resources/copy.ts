/** Search and social description for the public NIVO landing surface. */
export const LANDING_DESCRIPTION = "NIVO Agentic OS — System of Responsibility cho doanh nghiệp vận hành cùng Human, AI và System.";

/** Canonical Vietnamese product narrative consumed by the landing surface. */
export const LANDING_COPY = {
  labels: {
    skip: "Bỏ qua đến nội dung chính", home: "NIVO — về đầu trang", nav: "Điều hướng chính",
    navItems: [{ href: "#intent-modules", label: "Sản phẩm" }, { href: "#responsibility", label: "Giải pháp" }, { href: "#operating-loop", label: "Tài liệu" }],
    arrow: "→", operatingModel: "Responsibility handoff", operatingModelTitle: "Human Leads. AI Operates. System Learns.", operatingModelBody: "Trách nhiệm được chuyển giao mượt mà và có bằng chứng ở mỗi bước.", exploreOperating: "Tìm hiểu cách hoạt động", intentEyebrow: "Intent modules", intentTitle: "Bốn ý định cốt lõi. Một hệ điều hành thống nhất.", explore: "Khám phá intent", mantra: "Hệ điều hành trách nhiệm cho tổ chức AI-native.", footerNav: "Điều hướng cuối trang", footerItems: [{ href: "#intent-modules", label: "Sản phẩm" }, { href: "#responsibility", label: "Giải pháp" }, { href: "#operating-loop", label: "Tài liệu" }, { href: "#offer", label: "Đặt lịch demo" }], copyright: "© 2026 NIVO. All rights reserved."
  },
  hero: {
    eyebrow: "NIVO · Agentic OS", title: "Founder không còn phải tự mình làm Operating System của business.", lede: "NIVO Agentic OS là hệ điều hành trách nhiệm cho tổ chức AI-native. Mọi việc đều có ngữ cảnh, chủ thể, bằng chứng và kết quả được kiểm chứng.", primary: "Đặt lịch demo", secondary: "Khám phá NIVO", note: "Bắt đầu trong 7 ngày · Không cần thẻ",
    artAlt: "Kỳ lân NIVO nguyên bản dẫn dắt operating loop kết nối Context, Responsibility, Human, AI, System, Evidence, Verified outcome và Trust.", mapLabel: "Evidence được NIVO ghi nhận", mapStatus: "Evidence captured", mapKicker: "CAMPAIGN", mapTitle: "Q2 Launch", mapOwner: "Owner · Growth Agent", mapFlow: ["Context", "Evidence", "Outcome"], proofTitle: "Outcome · +18.7% SQLs", proofBody: "Bằng chứng đã được kiểm chứng", proofBadge: "Verified"
  },
  shift: { index: "01 — THE SHIFT", title: "Business không thiếu thêm một AI tool. Business thiếu một hệ thống biết ai chịu trách nhiệm.", body: "Task rời rạc tạo ra activity. Responsibility có context, evidence và outcome mới tạo ra tiến bộ có thể kiểm chứng." },
  responsibility: { eyebrow: "System of Responsibility", title: "Mỗi mục tiêu có một người dẫn dắt. Một hệ thống cùng vận hành.", body: "NIVO biến công việc quan trọng thành responsibility rõ ràng — đủ ngữ cảnh để AI vận hành, đủ evidence để con người quyết định.", items: [
    { title: "Responsibility", body: "Điều gì phải được hoàn thành — và ai là người chịu trách nhiệm cuối cùng." },
    { title: "Context", body: "Quyết định, dữ liệu và tri thức cần thiết được đặt đúng chỗ." },
    { title: "Evidence", body: "Mọi hành động để lại dấu vết có thể xem lại và kiểm chứng." },
    { title: "Verified outcome", body: "Kết quả được xác nhận trước khi trở thành trust cho vòng tiếp theo." }
  ] },
  loop: { eyebrow: "Operating loop", title: "Trách nhiệm vận hành theo một đường đi rõ ràng.", lede: "", steps: ["Context", "Responsibility", "Human + AI + System", "Evidence", "Verified outcome", "Trust"], stepBodies: ["Hiểu đúng bối cảnh và mục tiêu.", "Giao đúng việc cho đúng chủ thể.", "Phối hợp con người, AI và hệ thống.", "Tự động thu thập bằng chứng.", "Kết quả được đo lường và kiểm chứng.", "Tạo niềm tin để mở rộng liên tục."], caption: "Mỗi vòng lặp làm hệ thống hiểu business hơn — không phải bằng lời hứa, mà bằng evidence." },
  roles: [{ label: "Human", title: "Human Leads.", body: "Đặt mục tiêu, quyết định và chịu trách nhiệm cuối cùng.", verb: "Lead" }, { label: "AI", title: "AI Operates.", body: "Lập kế hoạch, thực thi, đề xuất và tối ưu.", verb: "Operate" }, { label: "System", title: "System Learns.", body: "Ghi lại, kiểm chứng, học hỏi và cải thiện.", verb: "Learn" }],
  intents: [
    { title: "Create", body: "Tạo nội dung, chiến dịch và tài sản có trách nhiệm.", art: "/images/intent/create-v1.png", artAlt: "Minh họa cửa sổ sáng tạo, nút phát và bút chì của module Create." },
    { title: "Operate", body: "Vận hành quy trình, dự án và đội nhóm hiệu quả.", art: "/images/intent/operate-v1.png", artAlt: "Minh họa checklist và bánh răng của module Operate." },
    { title: "Revenue", body: "Tối ưu tăng trưởng và hiệu suất doanh thu.", art: "/images/intent/revenue-v1.png", artAlt: "Minh họa biểu đồ tăng trưởng của module Revenue." },
    { title: "Money", body: "Quản trị chi phí, lợi nhuận và dòng tiền thông minh.", art: "/images/intent/money-v1.png", artAlt: "Minh họa các chồng tiền xu của module Money." }
  ],
  instances: { eyebrow: "Module instances", title: "Mọi việc đều là Module. Mỗi Module là một trách nhiệm.", body: "", owner: "Owner", status: "Status", outcome: "Outcome", items: [
    { intent: "Create", tone: "danger", name: "Content Campaign", owner: "Content Agent", status: "Completed", outcome: "+27% Engagement", evidence: "12 evidence items" },
    { intent: "Operate", tone: "accent", name: "Onboarding Flow", owner: "Operations Agent", status: "In progress", outcome: "92% Completion rate", evidence: "8 evidence items" },
    { intent: "Revenue", tone: "accent", name: "Product Launch", owner: "Growth Agent", status: "Completed", outcome: "+18.7% SQLs", evidence: "15 evidence items" },
    { intent: "Money", tone: "success", name: "Budget Optimization", owner: "Finance Agent", status: "Completed", outcome: "-14% CAC", evidence: "9 evidence items" }
  ] },
  footer: {
    groups: [
      { title: "Sản phẩm", items: [{ label: "Tổng quan", href: "#main" }, { label: "Modules", href: "#intent-modules" }, { label: "Instances", href: "#module-instances" }, { label: "Ecosystem", href: "#responsibility" }] },
      { title: "Giải pháp", items: [{ label: "Marketing", href: "#intent-modules" }, { label: "Sales", href: "#intent-modules" }, { label: "Operations", href: "#responsibility" }, { label: "Finance", href: "#intent-modules" }] },
      { title: "Tài nguyên", items: [{ label: "Tài liệu", href: "#operating-loop" }, { label: "Hướng dẫn", href: "#operating-loop" }, { label: "Case studies", href: "#module-instances" }, { label: "Blog", href: "#main" }] },
      { title: "Công ty", items: [{ label: "Về NIVO", href: "#main" }, { label: "Sự nghiệp", href: "mailto:hello@nivo.vn?subject=Sự nghiệp tại NIVO" }, { label: "Liên hệ", href: "mailto:hello@nivo.vn" }] }
    ],
    newsletterTitle: "Đăng ký nhận tin",
    newsletterBody: "Nhận cập nhật về sản phẩm và hệ điều hành trách nhiệm.",
    newsletterAction: "Email của bạn",
    newsletterHref: "mailto:hello@nivo.vn?subject=Đăng ký nhận tin NIVO"
  },
  offer: { eyebrow: "NIVO Agentic OS", title: "NIVO Agentic OS", body: "Hệ điều hành trách nhiệm cho tổ chức AI-native.", plan: "NIVO START", price: "499.000", unit: " VND / tháng", benefits: ["Rõ ngữ cảnh, đúng trách nhiệm", "Bằng chứng tự động, kết quả được kiểm chứng", "Niềm tin được tạo ra, hiệu suất được nhân lên"], href: "mailto:hello@nivo.vn?subject=Đặt lịch demo NIVO", note: "Không cần thẻ. Dừng bất cứ lúc nào." }
} as const;
