/** A resolved message the route boundaries draw: what happened, what to do, and the one action's label. */
export type BoundaryMessage = {
    readonly message: string
    readonly description: string
    readonly actionLabel: string
}

/** Visitor copy of the route boundaries, keyed by the closed failure kind so no exception text reaches a screen. */
export const BOUNDARY_COPY = {
    unexpected: { message: "Đã xảy ra sự cố", description: "Không thể hiển thị trang này. Hãy thử lại, nếu vẫn lỗi vui lòng liên hệ NIVO.", actionLabel: "Thử lại" }, // vn-ok: approved visitor copy
    staleBundle: { message: "Trang đã cũ", description: "Một phiên bản mới vừa được phát hành khi bạn đang xem. Hãy tải lại để tiếp tục.", actionLabel: "Tải lại" }, // vn-ok: approved visitor copy
    notFound: { message: "Không tìm thấy trang", description: "Địa chỉ này không tồn tại hoặc đã được chuyển.", actionLabel: "Về trang chủ" }, // vn-ok: approved visitor copy
} as const satisfies {
    readonly unexpected: BoundaryMessage
    readonly staleBundle: BoundaryMessage
    readonly notFound: BoundaryMessage
}
