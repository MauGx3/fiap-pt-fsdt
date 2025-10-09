import { describe, beforeEach, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import ErrorPage from "../../components/ErrorPage";
import { renderWithProviders } from "../utils";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe("ErrorPage", () => {
  beforeEach(() => {
    navigateMock.mockClear();
  });

  it("renders default title and message", () => {
    renderWithProviders(<ErrorPage />);

    expect(screen.getByRole("heading", { name: /oops!/i })).toBeInTheDocument();
    expect(screen.getByText(/we encountered an error/i)).toBeVisible();
    expect(screen.getByRole("button", { name: /go home/i })).toBeEnabled();
  });

  it("calls retry handler when provided", () => {
    const onRetry = vi.fn();
    renderWithProviders(<ErrorPage onRetry={onRetry} showHomeButton={false} />);

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("navigates home when clicking go home", () => {
    renderWithProviders(<ErrorPage />);

    fireEvent.click(screen.getByRole("button", { name: /go home/i }));
    expect(navigateMock).toHaveBeenCalledWith("/");
  });
});
