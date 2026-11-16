import { ENTERTAINMENT_PROMPT } from "./research-prompt.js";

const PROVIDERS = {
  google: {
    label: "Google Gemini",
    defaultModel: "gemini-3.8-flash",
    testUrl: "https://generativelanguage.googleapis.com/v1beta/models",
  },
  openai: {
    label: "OpenAI",
    defaultModel: "gpt-6-astra",
    testUrl: "https://api.openai.com/v1/models",
  },
  anthropic: {
    label: "Anthropic Claude",
    defaultModel: "claude-sonnet-5-5",
    testUrl: "https://api.anthropic.com/v1/models?limit=1",
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function providerMessage(status, payload) {
  const detail = payload?.error?.message || payload?.message || "";
  if (status === 401 || status === 403) {
    return "The provider rejected this API key or it lacks permission. Check the key and provider account." + (detail ? " Provider detail: " + String(detail).slice(0, 350) : "");
  }
  if (status === 429) {
    return "The provider reports a usage limit or quota issue. Check billing, usage and rate limits." + (detail ? " Provider detail: " + String(detail).slice(0, 350) : "");
  }
  if (status >= 500) {
    return "The AI provider returned a server error. Try again later." + (detail ? " Provider detail: " + String(detail).slice(0, 350) : "");
  }
  return (detail ? String(detail).slice(0, 500) : "The provider rejected the request. Check the selected model and API settings.");
}

function providerHeaders(provider, key, jsonBody = false) {
  const headers = {};
  if (jsonBody) headers["Content-Type"] = "application/json";
  if (provider === "google") headers["x-goog-api-key"] = key;
  if (provider === "openai") headers.Authorization = `Bearer ${key}`;
  if (provider === "anthropic") {
    headers["x-api-key"] = key;
    headers["anthropic-version"] = "2023-06-01";
  }
  return headers;
}


async function providerFetch(url, options) {
  try {
    const response = await fetch(url, {
      ...options,
      redirect: "manual",
    });

    if (response.status >= 300 && response.status < 400) {
      throw new Error(
        `Provider returned an unexpected redirect (HTTP ${response.status}).`
      );
    }

    return response;
  } catch (error) {
    console.error("Provider connection diagnostic:", {
      host: new URL(url).host,
      errorName: error?.name || "Unknown",
      errorMessage: error?.message || String(error),
    });

    throw new Error(
      error?.message || "The provider connection failed."
    );
  }
}

export async function testProvider(provider, key) {
  const config = PROVIDERS[provider];
  if (!config) return json({ error: "Choose a supported AI provider." }, 400);

  const response = await providerFetch(config.testUrl, {
    method: "GET",
    headers: providerHeaders(provider, key),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return json({ error: providerMessage(response.status, data), provider }, response.status);
  return json({
    ok: true,
    provider,
    message: `The ${config.label} API accepted the key. This checks authentication, not a full research request.`,
  });
}

function makeInstructions(body) {
  const depth = Math.min(4, Math.max(1, Number(body.depth) || 2));
  const category = String(body.category || "auto").slice(0, 80);
  const region = String(body.region || "unspecified").slice(0, 80);
  const spoilers = String(body.spoilers || "light").slice(0, 40);
  const reference = String(body.referenceInfo || "").slice(0, 30000);
  return `${ENTERTAINMENT_PROMPT}

APPLICATION REQUEST SETTINGS
- Category selection: ${category}. If automatic, identify and disambiguate the correct entity and specialist research structure.
- Research depth: Level ${depth}. Level 2 is Standard.
- Region: ${region}. Do not infer a region if unspecified.
- Spoiler setting: ${spoilers}.
- Every request is independent. Do not assume access to previous searches.
- Use the provider's live web-search capability for current, upcoming, contested, detailed-credit and availability claims.
- Similar entertainment recommendations and sourced interesting facts are standard parts of substantive research across categories.
- Cite factual claims. Provide verified, entity-specific direct links. For screen entities, check IMDb and TMDB and disclose when a page cannot be confidently verified.
- Do not invent facts, credits, links, IDs, dates, availability, citations or relationships. Label uncertainty and source conflicts.
${reference ? "\nUSER-SUPPLIED REFERENCE INFORMATION (context only, not verified fact):\n" + reference : ""}`;
}

function extractGoogle(data) {
  const candidate = data?.candidates?.[0];
  const text = (candidate?.content?.parts || []).map(part => part.text || "").join("\n\n");
  const citations = [];
  for (const chunk of candidate?.groundingMetadata?.groundingChunks || []) {
    if (chunk.web?.uri) citations.push({ title: chunk.web.title || chunk.web.uri, url: chunk.web.uri });
  }
  return { text, citations };
}

function extractOpenAI(data) {
  const messages = (data?.output || []).filter(item => item.type === "message");
  const citations = [];
  const text = messages.flatMap(message => message.content || [])
    .filter(item => item.type === "output_text")
    .map(item => {
      for (const annotation of item.annotations || []) {
        const citation = annotation.url_citation || annotation;
        if (citation.url) citations.push({
          title: citation.title || citation.url,
          url: citation.url,
        });
      }
      return item.text || "";
    }).join("\n\n");
  return { text, citations };
}

function extractAnthropic(data) {
  const citations = [];
  const text = (data?.content || []).filter(item => item.type === "text").map(item => {
    for (const citation of item.citations || []) {
      if (citation.url) citations.push({ title: citation.title || citation.url, url: citation.url });
    }
    return item.text || "";
  }).join("\n\n");
  return { text, citations };
}

export async function runResearch(provider, key, body) {
  const config = PROVIDERS[provider];
  if (!config) return json({ error: "Choose a supported AI provider." }, 400);

  const query = String(body.query || "").trim();
  if (!query) return json({ error: "A research question is required." }, 400);
  if (query.length > 4000) return json({ error: "The question is too long. Maximum 4,000 characters." }, 400);

  const model = String(body.model || "").trim() || config.defaultModel;
  const instructions = makeInstructions(body);
  let url, payload;

  if (provider === "google") {
    url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    payload = {
      systemInstruction: { parts: [{ text: instructions }] },
      contents: [{ role: "user", parts: [{ text: query }] }],
      tools: [{ google_search: {} }],
      generationConfig: { temperature: 0.3 },
    };
  } else if (provider === "openai") {
    url = "https://api.openai.com/v1/responses";
    payload = {
      model,
      instructions,
      input: query,
      tools: [{ type: "web_search", search_context_size: Number(body.depth) >= 3 ? "high" : "medium" }],
      tool_choice: "required",
    };
  } else {
    url = "https://api.anthropic.com/v1/messages";
    payload = {
      model,
      max_tokens: Number(body.depth) >= 3 ? 12000 : 8000,
      system: instructions,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: Number(body.depth) >= 3 ? 8 : 5 }],
      messages: [{ role: "user", content: query }],
    };
  }

  const response = await providerFetch(url, {
    method: "POST",
    headers: providerHeaders(provider, key, true),
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const status = response.status;
    return json({ error: providerMessage(status, data), provider, providerStatus: status }, status);
  }

  const extracted = provider === "google" ? extractGoogle(data)
    : provider === "openai" ? extractOpenAI(data)
    : extractAnthropic(data);

  const unique = extracted.citations.filter((item, index, all) =>
    item.url && /^https?:\/\//i.test(item.url) && all.findIndex(other => other.url === item.url) === index
  );
  if (!extracted.text.trim()) {
    return json({ error: "The provider returned no readable answer. Check the selected model, provider access and quota." }, 502);
  }
  return json({
    text: extracted.text,
    citations: unique,
    research_date: new Date().toISOString().slice(0, 10),
    provider,
    model,
  });
}

export function validateRequestBody(body) {
  const key = String(body?.apiKey || "").trim();
  const provider = String(body?.provider || "").trim();
  if (!key) return { error: "Add your API key in application Settings." };
  if (key.length > 1000) return { error: "The supplied API key is too long." };
  if (!PROVIDERS[provider]) return { error: "Choose a supported AI provider." };
  return { key, provider };
}

export { json };
