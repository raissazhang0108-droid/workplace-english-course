import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AuthDialog from "../src/AuthDialog";

const legacyAttempt = { completedAt: "2026-10-12T12:00:00Z", answers: Array(21).fill("") };

describe("AuthDialog", () => {
  it("registers with the email, password and guest learning state", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({
      email: "learner@example.com",
      completedCourses: ["intro", "meeting"],
    }, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const onAuthenticated = vi.fn();

    render(
      <AuthDialog
        anonymousLearnerId="guest-123"
        completedCourses={["intro", "meeting"]}
        legacyAttempts={[legacyAttempt]}
        onClose={vi.fn()}
        onAuthenticated={onAuthenticated}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "注册" }));
    fireEvent.change(screen.getByLabelText("邮箱"), { target: { value: "Learner@Example.com" } });
    fireEvent.change(screen.getByLabelText("密码"), { target: { value: "a-long-password" } });
    fireEvent.click(screen.getByRole("button", { name: "创建账号" }));

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith({
      email: "learner@example.com",
      completedCourses: ["intro", "meeting"],
    }));
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/register", expect.objectContaining({
      method: "POST",
      credentials: "same-origin",
      body: JSON.stringify({
        email: "Learner@Example.com",
        password: "a-long-password",
        anonymousLearnerId: "guest-123",
        completedCourses: ["intro", "meeting"],
        legacyAttempts: [legacyAttempt],
      }),
    }));
  });

  it("switches between login and registration and reports server errors", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(
      { detail: "邮箱或密码不匹配" },
      { status: 401 },
    ));
    vi.stubGlobal("fetch", fetchMock);
    render(
      <AuthDialog
        anonymousLearnerId="guest-123"
        completedCourses={[]}
        legacyAttempts={[]}
        onClose={vi.fn()}
        onAuthenticated={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "登录" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "注册" }));
    expect(screen.getByRole("button", { name: "创建账号" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "登录" }));
    fireEvent.change(screen.getByLabelText("邮箱"), { target: { value: "learner@example.com" } });
    fireEvent.change(screen.getByLabelText("密码"), { target: { value: "wrong-password" } });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("邮箱或密码不匹配");
  });

  it("lets a guest dismiss the dialog", () => {
    const onClose = vi.fn();
    render(
      <AuthDialog
        anonymousLearnerId="guest-123"
        completedCourses={[]}
        legacyAttempts={[]}
        onClose={onClose}
        onAuthenticated={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "继续以游客身份学习" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
