import { describe, expect, it, vi } from "vitest";
import { preserveClientHost } from "../src/lib/proxyHost";

describe("preserveClientHost", () => {
  it("forwards the browser host to the API behind the dev proxy", () => {
    const setHeader = vi.fn();
    preserveClientHost(
      { setHeader },
      { headers: { host: "127.0.0.1:5176" } },
    );

    expect(setHeader).toHaveBeenCalledWith("host", "127.0.0.1:5176");
  });

  it("does not replace the upstream host when the browser host is missing", () => {
    const setHeader = vi.fn();
    preserveClientHost({ setHeader }, { headers: {} });

    expect(setHeader).not.toHaveBeenCalled();
  });
});
