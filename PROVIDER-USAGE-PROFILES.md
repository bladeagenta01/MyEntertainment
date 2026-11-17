# Provider Usage Profiles and Operating Modes

Date: 16 November 2026  
Build: My Entertainment v0.1 Pilot Draft  
Target branch: `pages-multiprovider-pilot`

## Purpose

Provide a consistent interface for Google Gemini, OpenAI and Anthropic while accurately representing the different ways their API access and billing work. The application must not describe an API provider as free merely because the user has a free ChatGPT or Claude consumer account, an API key, or a model in the model list.

## Provider account classifications

These are user-selected labels only. They are not verified by the app.

| Provider | Profile labels | Important distinction |
|---|---|---|
| Google Gemini | Google Free Tier; Google Paid / Billing Enabled | The Gemini API has a Free Tier for selected models and usage limits. Model availability and tool availability vary. Google Search grounding can have a separate quota and charge. |
| OpenAI | Free or Promotional API Credits; Funded API Usage | OpenAI API billing is separate from ChatGPT. Promotional credits may be available to some API organisations. A separate API credit benefit exists for eligible ChatGPT Pro and Business subscribers, not as a general Free-plan entitlement. |
| Anthropic Claude | Initial Trial Credits; Prepaid or Contract Usage | New API users may receive a small amount of introductory credit. This is not a permanent general free API tier. Claude consumer-plan access is separate from Claude Platform API billing. |

## Operating modes

### Testing Mode (default)

- Maximum research depth: Level 2.
- Maximum question length: 1,200 characters.
- Maximum saved reference context sent with a request: 4,000 characters.
- Lower output token limits.
- Live web search defaults off and is turned off when entering Testing Mode.
- Does not automatically change provider, model, profile or billing settings.

### Production Mode

- Research depth: Levels 1 to 4.
- Maximum question length: 4,000 characters.
- Maximum saved reference context sent with a request: 30,000 characters.
- Higher output token limits.
- Live web search remains off unless the user enables it.
- Selecting Production Mode does not itself authorise paid usage or enable web search.

## Generation authorisation

A separate per-provider setting, `allowCharges`, defaults to false. It must be explicitly enabled before the app will:

- run the small AI generation test; or
- submit a research request.

The Pages Function backend checks this value as well as the browser interface. Provider key authentication and model-list retrieval remain available without generation authorisation because they do not request model output.

The setting is stored separately for each provider in the current browser. Clearing a provider's saved key also clears that provider's generation authorisation.

This is a user-consent gate, not a financial guarantee, billing detector or hard spending cap. The application cannot inspect the provider's credit balance or reliably determine whether a particular model/tool request will be free. When enabled, a request may consume a free quota, promotional credits, prepaid credits or paid billing depending on the provider account, project, model, feature and remaining balance.

Provider-side billing controls remain authoritative. Users should check the selected project and model, provider usage limits, credit balance, payment settings and automatic recharge settings before enabling generation. The app must not claim a request is free based on the selected profile.

## Search tool safeguards

Live web search defaults off in both modes. The backend treats a missing `webSearch` field as false. When enabled, provider-specific search or grounding features may use separate quotas or incur separate charges. Testing Mode reduces some provider search settings, but Google grounding does not expose an equivalent per-request maximum in this implementation.

## Prohibited automatic behaviour

- No automatic provider switching.
- No automatic paid fallback.
- No automatic retries.
- No automatic enabling of live web search when Production Mode is selected.
- No claim that a provider profile or model list proves free eligibility.

## Known limits

- No server-side per-user request ledger or daily budget. The app is anonymous BYOK and has no trusted user identity.
- Browser-stored API keys are not encrypted by localStorage.
- The app cannot enforce a provider-side spending cap or stop based on remaining credits.
- Model-list visibility does not prove compatibility with every generation endpoint or search tool.

## Official provider references checked 16 November 2026

- Google Gemini API pricing: https://ai.google.dev/gemini-api/docs/pricing
- Google Gemini API billing and tiers: https://ai.google.dev/gemini-api/docs/billing
- OpenAI API credits for eligible ChatGPT subscriptions: https://developers.openai.com/api/docs/guides/chatgpt-api-credits
- OpenAI prepaid API billing: https://help.openai.com/en/articles/8264644-setting-up-and-managing-prepaid-api-billing
- Anthropic Claude Platform pricing and credits FAQ: https://platform.claude.com/docs/en/about-claude/pricing
