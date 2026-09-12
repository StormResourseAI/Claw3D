import { afterEach, describe, expect, it } from "vitest";
import { resolveStudioProxyGatewayUrl } from "@/lib/gateway/proxy-url";

const ORIGINAL_LOCATION = window.location;

const stubLocation = (href: string) => {
  const url = new URL(href);
  Object.defineProperty(window, "location", {
    configurable: true,
    enumerable: true,
    value: {
      href: url.href,
      protocol: url.protocol,
      host: url.host,
      hostname: url.hostname,
      port: url.port,
      origin: url.origin,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
    },
  });
};

describe("resolveStudioProxyGatewayUrl", () => {
  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      enumerable: true,
      value: ORIGINAL_LOCATION,
    });
  });

  it("preserves_loopback_upstream_when_browser_is_localhost", () => {
    stubLocation("http://localhost:3001/");
    expect(resolveStudioProxyGatewayUrl("ws://localhost:18790")).toBe(
      "ws://localhost:18790",
    );
  });

  it("preserves_loopback_upstream_when_browser_is_127_0_0_1", () => {
    stubLocation("http://127.0.0.1:3001/");
    expect(resolveStudioProxyGatewayUrl("ws://127.0.0.1:18790")).toBe(
      "ws://127.0.0.1:18790",
    );
  });

  it("preserves_ipv6_loopback_upstream_when_browser_is_ipv6_loopback", () => {
    stubLocation("http://[::1]:3001/");
    expect(resolveStudioProxyGatewayUrl("ws://[::1]:18790")).toBe("ws://[::1]:18790");
  });

  it("uses_same_origin_wss_proxy_for_remote_https_with_loopback_upstream", () => {
    stubLocation("https://brians-mac-mini.tailb10b9b.ts.net:3001/");
    expect(resolveStudioProxyGatewayUrl("ws://localhost:18790")).toBe(
      "wss://brians-mac-mini.tailb10b9b.ts.net:3001/api/gateway/ws",
    );
  });

  it("uses_same_origin_ws_proxy_for_remote_http_with_loopback_upstream", () => {
    stubLocation("http://office.example:3001/");
    expect(resolveStudioProxyGatewayUrl("ws://localhost:18790")).toBe(
      "ws://office.example:3001/api/gateway/ws",
    );
  });

  it("uses_same_origin_proxy_when_upstream_is_undefined", () => {
    stubLocation("http://localhost:3000/");
    expect(resolveStudioProxyGatewayUrl()).toBe("ws://localhost:3000/api/gateway/ws");
  });

  it("keeps_openclaw_undefined_upstream_on_the_same_origin_proxy_for_remote_https", () => {
    stubLocation("https://remote.example:3001/");
    expect(resolveStudioProxyGatewayUrl(undefined)).toBe(
      "wss://remote.example:3001/api/gateway/ws",
    );
  });
});
