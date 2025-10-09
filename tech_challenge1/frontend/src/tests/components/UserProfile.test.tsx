import { describe, beforeEach, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import UserProfile from "../../components/userProfile/UserProfile";
import { renderWithProviders } from "../utils";
import { usersAPI } from "../../api";

vi.mock("../../api", () => ({
  usersAPI: {
    getMe: vi.fn(),
    getById: vi.fn(),
  },
}));

const usersAPIMock = usersAPI as unknown as {
  getMe: ReturnType<typeof vi.fn>;
  getById: ReturnType<typeof vi.fn>;
};

describe("UserProfile", () => {
  beforeEach(() => {
    usersAPIMock.getMe.mockReset();
    usersAPIMock.getById.mockReset();
  });

  it("loads the current user by default", async () => {
    usersAPIMock.getMe.mockResolvedValue({
      user: {
        uuid: "me",
        name: "Current User",
        email: "me@example.com",
        role: "admin",
        createdAt: new Date().toISOString(),
      },
    });

    renderWithProviders(<UserProfile />, { withRouter: false });

    expect(screen.getByText(/loading user profile/i)).toBeInTheDocument();
    expect(await screen.findByText("Current User")).toBeVisible();
    expect(screen.getByText(/me@example.com/)).toBeInTheDocument();
    expect(usersAPIMock.getMe).toHaveBeenCalled();
  });

  it("fetches user by id when provided", async () => {
    usersAPIMock.getById.mockResolvedValue({
      user: {
        uuid: "123",
        name: "Jane",
        email: "jane@example.com",
        role: "editor",
      },
    });

    renderWithProviders(<UserProfile userId="123" />, { withRouter: false });

    expect(await screen.findByText("Jane")).toBeVisible();
    expect(usersAPIMock.getById).toHaveBeenCalledWith("123");
  });

  it("falls back to demo data when the API is unreachable", async () => {
    const error = new Error("Network Error") as Error & { code?: string };
    error.code = "ECONNREFUSED";
    usersAPIMock.getMe.mockRejectedValue(error);

    renderWithProviders(<UserProfile />, { withRouter: false });

    expect(await screen.findByText("Demo User")).toBeInTheDocument();
    expect(screen.getByText(/demo@example.com/)).toBeVisible();
  });

  it("renders error page for unexpected failures", async () => {
    usersAPIMock.getMe.mockRejectedValue({
      response: { data: { error: "No user" } },
    });

    renderWithProviders(<UserProfile />, { withRouter: true });

    expect(await screen.findByText(/profile error/i)).toBeInTheDocument();
    expect(screen.getByText(/no user/i)).toBeVisible();
  });
});
