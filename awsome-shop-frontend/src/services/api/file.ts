import request from "../request";
import type { UploadResultDTO } from "../../types/api";

const FILE_BASE = "/api/files";

/**
 * Upload an image file via multipart/form-data.
 * Backend: POST /api/files/upload, field name `file` (≤5MB, jpg/png/gif/webp).
 */
export function uploadFile(
  file: File,
  bizType?: string,
): Promise<UploadResultDTO> {
  const form = new FormData();
  form.append("file", file);
  if (bizType) form.append("bizType", bizType);
  return request.post<UploadResultDTO>(`${FILE_BASE}/upload`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
