# Build notes

This is a pilot build, not a production-certified application. The package contains Cloudflare Pages Functions and multi-provider request code. Static checks are being performed before handoff. Live API and hosted deployment testing remain outstanding.

The source prompt supplied by the user is preserved byte-for-byte. Its opening heading says Version 3.7, while the version history within the same document identifies Version 3.8. This is disclosed rather than silently edited.

Provider defaults checked against official documentation on 15 November 2026:
- Google Gemini: `gemini-3.8-flash`.
- OpenAI: `gpt-6-astra`.
- Anthropic: `claude-sonnet-5-5`.

These IDs are documented defaults, not a guarantee that a particular API account has access. The user can enter another supported model ID in Settings.
