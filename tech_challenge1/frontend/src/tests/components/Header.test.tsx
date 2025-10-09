import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import Header from "../../components/header/Header";
import { renderWithProviders } from "../utils";

describe("Header", () => {
  it("renders title and navigation links", () => {
    renderWithProviders(<Header />, { withRouter: false });

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /fiap frontend/i }),
    ).toBeVisible();
    const nav = screen.getByRole("navigation", { name: /main navigation/i });
    expect(nav).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/");
    expect(links[1]).toHaveAttribute("href", "/profile");
  });
});
