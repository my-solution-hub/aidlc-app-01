import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

vi.mock("../request", () => ({
  default: {
    post: vi.fn(() =>
      Promise.resolve({ filename: "x.png", url: "/api/files/x.png" }),
    ),
  },
}));

import request from "../request";
import { uploadFile } from "./file";

const post = request.post as Mock;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("uploadFile service (BR-PROD-008)", () => {
  it("posts multipart form-data to /api/files/upload with file + bizType", async () => {
    const file = new File(["abc"], "photo.png", { type: "image/png" });
    const res = await uploadFile(file, "product");

    expect(post).toHaveBeenCalledTimes(1);
    const [url, body, config] = post.mock.calls[0];
    expect(url).toBe("/product/api/files/upload");
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("file")).toBe(file);
    expect((body as FormData).get("bizType")).toBe("product");
    expect(config).toMatchObject({
      headers: { "Content-Type": "multipart/form-data" },
    });
    expect(res).toEqual({ filename: "x.png", url: "/api/files/x.png" });
  });

  it("omits bizType when not provided", async () => {
    const file = new File(["abc"], "p.jpg", { type: "image/jpeg" });
    await uploadFile(file);
    const body = post.mock.calls[0][1] as FormData;
    expect(body.get("file")).toBe(file);
    expect(body.get("bizType")).toBeNull();
  });
});
