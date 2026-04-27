/**
 * Server-rendered inline script that applies the persisted theme to <html>
 * before React hydrates. Without this, switching from default-dark to
 * a user's saved "light" choice causes a one-frame flash. Read once,
 * synchronously, in <head>.
 *
 * Storage contract:
 *   localStorage["theme"] in { "dark", "light", "system" }
 *   absent ⇒ "dark" (the design-guide default)
 */
const SCRIPT = `
try {
  var t = localStorage.getItem("theme") || "dark";
  var resolved = t === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : t;
  if (resolved === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
} catch (_) {
  document.documentElement.classList.add("dark");
}
`.trim();

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
