/**
 * Centralized read of AI provider env vars. Lazy (called inside
 * accessors) so the build doesn't fail when a key isn't yet configured.
 */

const SETUP_DOCS_HINT = "See docs/setup.md > Anthropic API for how to obtain a key.";

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(`Missing environment variable: ${name}. ${SETUP_DOCS_HINT}`);
  }
  return value;
}

export function getAnthropicApiKey(): string {
  return required("ANTHROPIC_API_KEY", process.env.ANTHROPIC_API_KEY);
}

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.length > 0);
}
