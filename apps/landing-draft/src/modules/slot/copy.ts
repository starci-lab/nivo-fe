/**
 * The shared data-status sentences every slot renders, in this app's one served locale.
 * landing-draft keeps visitor copy in modules, not a translation runtime; when the published
 * shape-slot seam lands a message namespace, this constant is the piece it replaces.
 */
export const SLOT_STATUS_COPY = {
  forbidden: "Bạn không có quyền xem mục này", // vn-ok: approved visitor copy, canon messages/vi.json slot.forbidden
  error: "Không tải được", // vn-ok: approved visitor copy, canon messages/vi.json slot.error
  retry: "Thử lại", // vn-ok: approved visitor copy, canon messages/vi.json slot.retry
} as const;
