import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// t returns the key so we can assert on stable strings.
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

vi.mock("react-router", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("../../services/api/auth", () => ({
  register: vi.fn(() => Promise.resolve({})),
}));

import Register from "./index";
import { register } from "../../services/api/auth";

const registerMock = register as Mock;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Register validation (US-001)", () => {
  it("rejects username shorter than 3 chars and does not call the API", async () => {
    const user = userEvent.setup();
    render(<Register />);
    await user.type(screen.getByPlaceholderText("register.usernamePlaceholder"), "ab");
    await user.type(screen.getByPlaceholderText("register.passwordPlaceholder"), "secret1");
    await user.click(screen.getByRole("button", { name: "register.registerBtn" }));

    expect(registerMock).not.toHaveBeenCalled();
    expect(screen.getByText("register.usernameInvalid")).toBeInTheDocument();
  });

  it("rejects password shorter than 6 chars", async () => {
    const user = userEvent.setup();
    render(<Register />);
    await user.type(screen.getByPlaceholderText("register.usernamePlaceholder"), "alice");
    await user.type(screen.getByPlaceholderText("register.passwordPlaceholder"), "123");
    await user.click(screen.getByRole("button", { name: "register.registerBtn" }));

    expect(registerMock).not.toHaveBeenCalled();
    expect(screen.getByText("register.passwordInvalid")).toBeInTheDocument();
  });

  it("submits username/password/employeeId when valid", async () => {
    const user = userEvent.setup();
    render(<Register />);
    await user.type(screen.getByPlaceholderText("register.usernamePlaceholder"), "alice");
    await user.type(screen.getByPlaceholderText("register.employeeIdPlaceholder"), "E1001");
    await user.type(screen.getByPlaceholderText("register.passwordPlaceholder"), "secret1");
    await user.click(screen.getByRole("button", { name: "register.registerBtn" }));

    expect(registerMock).toHaveBeenCalledTimes(1);
    expect(registerMock).toHaveBeenCalledWith(
      expect.objectContaining({ username: "alice", password: "secret1", employeeId: "E1001" }),
    );
  });
});
