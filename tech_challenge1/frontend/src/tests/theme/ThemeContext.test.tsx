import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../../theme/ThemeContext";

describe("ThemeContext", () => {
  it("provides light theme by default and toggles to dark", () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });

    expect(result.current.theme.name).toBe("light");

    act(() => result.current.toggle());

    expect(result.current.theme.name).toBe("dark");
  });

  it("throws an error when used outside of provider", () => {
    expect(() => renderHook(() => useTheme())).toThrowError(
      "useTheme must be used inside ThemeProvider",
    );
  });
});
