import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

const toastFn = vi.fn() as unknown as ReturnType<typeof vi.fn> & {
  success: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  loading: ReturnType<typeof vi.fn>;
  dismiss: ReturnType<typeof vi.fn>;
  promise: ReturnType<typeof vi.fn>;
};

toastFn.mockImplementation(() => undefined);
toastFn.success = vi.fn();
toastFn.error = vi.fn();
toastFn.loading = vi.fn();
toastFn.dismiss = vi.fn();
toastFn.promise = vi.fn();

vi.mock("react-hot-toast", () => ({
  __esModule: true,
  default: toastFn,
  toast: toastFn,
  Toaster: () => null,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
