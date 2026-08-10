import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("macOS app packaging", () => {
  it("uses the public Typing Garden identity for distribution", () => {
    const packageJson = JSON.parse(readFileSync(resolve("package.json"), "utf8"));

    expect(packageJson.build.appId).toBe("io.github.wanqingcn.typinggarden");
    expect(packageJson.build.productName).toBe("Typing Garden");
    expect(packageJson.name).toBe("typing-garden");
    expect(packageJson.author).toBe("wanqingcn");
    expect(packageJson.license).toBe("GPL-3.0-only");
    expect(packageJson.repository.url).toBe(
      "git+https://github.com/wanqingcn/typing-garden.git"
    );
    expect(packageJson.author).not.toContain("@");
    expect(packageJson.build.appId).toMatch(/^io\.github\./);
  });

  it("builds static assets with relative paths for file:// loading", () => {
    const viteConfig = readFileSync(resolve("vite.config.ts"), "utf8");

    expect(viteConfig).toMatch(/base:\s*["']\.\/["']/);
  });

  it("loads the packaged app without a localhost server", () => {
    const mainProcess = readFileSync(resolve("electron/main.cjs"), "utf8");

    expect(mainProcess).toContain("loadFile");
    expect(mainProcess).not.toContain("loadURL");
    expect(mainProcess).not.toMatch(/localhost|127\.0\.0\.1|:\d{4}/);
  });

  it("uses a custom macOS app icon instead of the Electron default", () => {
    const packageJson = JSON.parse(readFileSync(resolve("package.json"), "utf8"));
    const iconPath = packageJson.build.mac.icon;

    expect(iconPath).toBe("assets/icons/typing-garden-icon.png");
    expect(existsSync(resolve(iconPath))).toBe(true);
  });

  it("declares hardened runtime entitlements for Developer ID notarization", () => {
    const packageJson = JSON.parse(readFileSync(resolve("package.json"), "utf8"));
    const entitlementPath = packageJson.build.mac.entitlements;

    expect(entitlementPath).toBe("build/entitlements.mac.plist");
    expect(existsSync(resolve(entitlementPath))).toBe(true);

    const entitlements = readFileSync(resolve(entitlementPath), "utf8");
    expect(entitlements).toContain("com.apple.security.cs.allow-jit");
    expect(entitlements).toContain("com.apple.security.cs.disable-library-validation");
  });

  it("only declares GitHub DMG release targets", () => {
    const packageJson = JSON.parse(readFileSync(resolve("package.json"), "utf8"));

    expect(packageJson.build.artifactName).toBe("Typing-Garden-${version}-${arch}.${ext}");
    expect(packageJson.build.mac.target).toEqual([
      {
        target: "dmg",
        arch: ["arm64", "x64"]
      }
    ]);
    expect(packageJson.build.mas).toBeUndefined();
  });

  it("includes a release script for Developer ID notarization", () => {
    const scriptPath = resolve("scripts/sign-and-notarize.sh");
    const script = readFileSync(scriptPath, "utf8");

    expect(existsSync(scriptPath)).toBe(true);
    expect(script).toContain("--keychain-profile");
    expect(script).toContain("TYPING_GARDEN_NOTARY_PROFILE");
    expect(script).not.toMatch(/APPLE_ID|APP_PASSWORD|--password|identity=null/);
  });

  it("builds both supported Mac architectures", () => {
    const script = readFileSync(resolve("scripts/build-mac.sh"), "utf8");

    expect(script).toContain("npx electron-builder --mac");
    expect(script).not.toMatch(/electron-builder --mac --(?:arm64|x64)/);
  });

  it("declares a restrictive content security policy", () => {
    const html = readFileSync(resolve("index.html"), "utf8");

    expect(html).toContain("default-src 'self'");
    expect(html).toContain("connect-src 'self' ws://127.0.0.1:*");
    expect(html).toContain("object-src 'none'");
    expect(html).not.toMatch(/connect-src[^;]*https:/);
  });

  it("denies renderer permissions and navigation", () => {
    const mainProcess = readFileSync(resolve("electron/main.cjs"), "utf8");

    expect(mainProcess).toContain("setPermissionRequestHandler");
    expect(mainProcess).toContain("callback(false)");
    expect(mainProcess).toContain("setWindowOpenHandler");
    expect(mainProcess).toContain('return { action: "deny" }');
    expect(mainProcess).toContain("will-navigate");
    expect(mainProcess).not.toContain("openExternal");
  });
});
