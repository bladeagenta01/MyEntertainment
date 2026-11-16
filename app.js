(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const ENDPOINT = (window.ENTERTAINMENT_API_ENDPOINT || "/api").replace(/\/+$/, "");
  const KEYS = { provider: "er_provider", mode: "er_mode", webSearch: "er_web_search", info: "er_saved_info", draft: "er_saved_draft" };
  const PROFILE_OPTIONS = {
    google: [{ id: "free", label: "Google Free Tier" }, { id: "paid", label: "Google Paid / Billing Enabled" }],
    openai: [{ id: "credits", label: "Free or Promotional API Credits" }, { id: "funded", label: "Funded API Usage" }],
    anthropic: [{ id: "trial", label: "Initial Trial Credits" }, { id: "funded", label: "Prepaid or Contract Usage" }]
  };
  const apiKeyStorageName = provider => "er_key_" + provider;
  const modelStorageName = provider => "er_model_" + provider;
  const profileStorageName = provider => "er_profile_" + provider;

  function storageGet(key) {
    try { return window.localStorage.getItem(key) || ""; }
    catch (error) { throw new Error("Browser storage is unavailable. Open this app through its secure hosted address rather than directly as a file, then try again."); }
  }
  function storageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
      if (window.localStorage.getItem(key) !== value) throw new Error("The browser did not confirm the saved value.");
    } catch (error) {
      throw new Error("The browser could not save this information. Check that site storage is enabled and that you are using the secure hosted application address. " + (error && error.name === "QuotaExceededError" ? "Browser storage is full." : ""));
    }
  }
  function storageDelete(key) {
    try { window.localStorage.removeItem(key); }
    catch { throw new Error("The browser could not clear its saved information. Check browser storage settings."); }
  }
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));

  function setStatus(id, message) {
    const node = $(id);
    if (node) node.textContent = message;
  }
  function providerName(provider) {
    return ({ openai: "OpenAI", anthropic: "Anthropic", google: "Google Gemini" })[provider] || "Unknown provider";
  }
  function header() {
    let provider = "google", hasKey = false, hasInfo = false;
    try {
      provider = storageGet(KEYS.provider) || "google";
      hasKey = !!storageGet(apiKeyStorageName(provider));
      hasInfo = !!storageGet(KEYS.info);
    } catch (error) {
      $("aiStatus").textContent = "Storage Unavailable";
      $("aiStatus").className = "pill amber";
      $("infoStatus").textContent = "Storage Unavailable";
      return;
    }
    $("aiStatus").textContent = hasKey ? "Connected (" + providerName(provider) + ")" : "Setup Required";
    $("aiStatus").className = "pill " + (hasKey ? "green" : "amber");
    $("infoStatus").textContent = hasInfo ? "Info Loaded" : "No Info Saved";
  }
  function refreshProfiles() {
    const provider = $("provider").value;
    const options = PROFILE_OPTIONS[provider] || [];
    const saved = storageGet(profileStorageName(provider));
    $("providerProfile").innerHTML = options.map(option => `<option value="${esc(option.id)}">${esc(option.label)}</option>`).join("");
    $("providerProfile").value = options.some(option => option.id === saved) ? saved : options[0]?.id || "";
  }
  function applyModeDefaults() {
    const production = $("mode").value === "production";
    $("webSearch").checked = production;
    try { storageSet(KEYS.webSearch, production ? "true" : "false"); } catch (error) { setStatus("keyStatus", error.message); }
    $("depth").querySelectorAll('option[value="3"], option[value="4"]').forEach(option => { option.disabled = !production; });
    $("depth").value = production ? "2" : "1";
    setStatus("keyStatus", production
      ? "Production Mode selected. Full research depth and live web search are available. Provider charges may apply."
      : "Testing Mode selected. Conservative limits are active and live web search is off by default.");
  }
  function guide() {
    const provider = $("provider").value;
    const guides = {
      openai: '<ol><li><a href="https://platform.openai.com/" target="_blank" rel="noopener">Open OpenAI Platform</a>. This is separate from ChatGPT Plus.</li><li>Open Billing and arrange API payment or credits.</li><li>Open API keys, choose Create new secret key, name it and copy it.</li><li>Return here and paste the key.</li></ol>',
      anthropic: '<ol><li><a href="https://console.anthropic.com/" target="_blank" rel="noopener">Open Anthropic Console</a>.</li><li>Open Billing and arrange API payment or credits.</li><li>Open API Keys, create a key and copy it.</li><li>Return here and paste the key.</li></ol>',
      google: '<ol><li><a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Open Google AI Studio API keys</a>.</li><li>Create an API key and select or create a project if asked.</li><li>Copy the key and return here.</li><li>Usage limits and billing depend on your Google account and project.</li></ol>'
    };
    $("guide").innerHTML = guides[provider] || "";
  }
  function infoView() {
    let info = "", draft = "";
    try { info = storageGet(KEYS.info); draft = storageGet(KEYS.draft); }
    catch (error) { setStatus("savedInfoStatus", error.message); return; }
    $("savedDraft").value = draft || (() => { try { return JSON.parse(info).text || ""; } catch { return info; } })();
    if (info) {
      let obj;
      try { obj = JSON.parse(info); } catch { obj = { text: info }; }
      $("savedView").classList.remove("hidden");
      $("savedView").textContent = "Saved " + (obj.date ? new Date(obj.date).toLocaleString() : "") + ". Active for future requests.\n\n" + obj.text;
    } else {
      $("savedView").classList.add("hidden");
    }
    $("saveInfo").classList.toggle("hidden", !!info);
    $("editInfo").classList.toggle("hidden", !info);
  }
  function openSettings() {
    if (!$("settings").open) $("settings").showModal();
  }
  async function call(path, key, provider, body = {}) {
    if (!ENDPOINT) throw new Error("The application API path is not configured.");
    let response;
    try {
      response = await fetch(ENDPOINT + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, apiKey: key, provider }),
        cache: "no-store"
      });
    } catch (error) {
      throw new Error("Could not contact the application backend. Check your internet connection and the Cloudflare Pages deployment.");
    }
    let data = await response.json().catch(() => ({ error: "The Worker returned an unreadable response." }));
    if (!response.ok) {
      const error = new Error(data.error || ("Request failed with HTTP " + response.status));
      error.status = response.status;
      throw error;
    }
    return data;
  }
  function friendly(error) {
    if (error && error.status === 401) return error.message || "The API key was rejected. Check the key and provider account.";
    if (error && error.status === 429) return error.message || "The provider account may be out of credits or temporarily busy. Check billing and usage.";
    if (error && error.status >= 500) return error.message || "The AI service could not complete the request. Try again later.";
    return error && error.message ? error.message : "An unexpected error occurred.";
  }
  async function testAndSave() {
    const key = $("apiKey").value.trim();
    const provider = $("provider").value;
    if (!key) return setStatus("keyStatus", "Paste your API key first.");
    if (!ENDPOINT) return setStatus("keyStatus", "The application API path is not configured.");
    $("testSave").disabled = true;
    setStatus("keyStatus", "Testing the key with " + providerName(provider) + ". The key has not yet been saved.");
    try {
      await call("/test", key, provider);
      storageSet(apiKeyStorageName(provider), key);
      storageSet(KEYS.provider, provider);
      storageSet(modelStorageName(provider), $("model").value.trim());
      storageSet(KEYS.mode, $("mode").value);
      storageSet(profileStorageName(provider), $("providerProfile").value);
      if (storageGet(apiKeyStorageName(provider)) !== key || storageGet(KEYS.provider) !== provider) {
        throw new Error("The connection test passed, but browser storage could not confirm the saved settings.");
      }
      setStatus("keyStatus", "Connection successful. Your key and provider settings have been saved in this browser. This confirms authentication only, not available generation or search quota.");
      header();
    } catch (error) {
      setStatus("keyStatus", friendly(error));
    } finally {
      $("testSave").disabled = false;
    }
  }
  async function loadModels() {
    const provider = $("provider").value;
    const key = $("apiKey").value.trim() || storageGet(apiKeyStorageName(provider));
    if (!key) return setStatus("keyStatus", "Enter or save this provider's API key before loading its models.");
    const button = $("loadModels");
    button.disabled = true;
    setStatus("keyStatus", "Loading models available to this API key.");
    try {
      const data = await call("/models", key, provider);
      const select = $("modelList");
      select.innerHTML = '<option value="">Select an available model</option>' + (data.models || []).map(item =>
        `<option value="${esc(item.id)}">${esc(item.displayName && item.displayName !== item.id ? item.displayName + " (" + item.id + ")" : item.id)}</option>`
      ).join("");
      const current = $("model").value.trim() || storageGet(modelStorageName(provider));
      if (current && (data.models || []).some(item => item.id === current)) select.value = current;
      setStatus("keyStatus", `${data.count} model(s) returned by ${providerName(provider)}. Select one, or enter an exact model ID manually. The list does not guarantee access to every API feature.`);
    } catch (error) {
      setStatus("keyStatus", friendly(error));
    } finally { button.disabled = false; }
  }

  function renderMarkdown(markdown) {
    let html = esc(markdown);
    html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>")
      .replace(/^## (.*)$/gm, "<h2>$1</h2>")
      .replace(/^# (.*)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
      .replace(/`([^`\n]+)`/g, "<code>$1</code>")
      .replace(/^\s*[-*] (.*)$/gm, "<li>$1</li>")
      .replace(/(?:<li>.*<\/li>\s*)+/gs, match => "<ul>" + match + "</ul>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n{2,}/g, "</p><p>")
      .replace(/\n/g, "<br>");
    return "<p>" + html + "</p>";
  }
  async function search() {
    const question = $("query").value.trim();
    if (!question) return setStatus("status", "Enter a question first.");
    const mode = $("mode").value;
    const maxLength = mode === "production" ? 4000 : 1200;
    if (question.length > maxLength) return setStatus("status", `Your question is too long for ${mode === "production" ? "Production" : "Testing"} Mode. Maximum ${maxLength} characters.`);
    let key, provider, referenceInfo;
    try {
      provider = storageGet(KEYS.provider) || "google";
      key = storageGet(apiKeyStorageName(provider));
      const saved = storageGet(KEYS.info);
      try { referenceInfo = JSON.parse(saved).text || ""; } catch { referenceInfo = saved; }
    } catch (error) {
      setStatus("status", error.message);
      return;
    }
    if (!key) {
      setStatus("status", "Set up your AI connection first.");
      openSettings();
      return;
    }
    $("searchBtn").disabled = true;
    setStatus("status", "Researching online. Deeper research may take longer and may cost more through your provider.");
    try {
      const data = await call("/research", key, provider, {
        query: question,
        category: $("category").value,
        depth: Number($("depth").value),
        region: $("region").value,
        spoilers: $("spoilers").value,
        referenceInfo,
        model: $("model").value.trim() || storageGet(modelStorageName(provider)),
        mode,
        providerProfile: storageGet(profileStorageName(provider)) || $("providerProfile").value,
        webSearch: $("webSearch").checked
      });
      $("resultBody").innerHTML = renderMarkdown(data.text || "");
      if (Array.isArray(data.citations) && data.citations.length) {
        const links = data.citations.filter(item => item && /^https?:\/\//i.test(item.url || ""));
        if (links.length) $("resultBody").insertAdjacentHTML("beforeend",
          "<hr><h3>Verified Links &amp; Sources</h3><ol>" +
          links.map(item => '<li><a target="_blank" rel="noopener noreferrer" href="' + esc(item.url) + '">' + esc(item.title || item.url) + "</a></li>").join("") +
          "</ol>");
      }
      $("results").classList.remove("hidden");
      setStatus("status", `Research complete (${mode === "production" ? "Production" : "Testing"} Mode). ${$("webSearch").checked ? "Live web search was enabled." : "Live web search was disabled, so current claims may not be verified."} Review sources and verify important details.`);
      $("results").scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      setStatus("status", friendly(error));
    } finally {
      $("searchBtn").disabled = false;
    }
  }

  $("settingsBtn").onclick = openSettings;
  $("aiStatus").onclick = openSettings;
  $("infoStatus").onclick = () => { openSettings(); $("savedDraft").focus(); };
  $("closeSettings").onclick = () => $("settings").close();
  $("provider").onchange = () => {
    const selected = $("provider").value;
    try { $("apiKey").value = storageGet(apiKeyStorageName(selected)); }
    catch (error) { $("apiKey").value = ""; }
    $("model").value = storageGet(modelStorageName(selected));
    refreshProfiles();
    $("modelList").innerHTML = '<option value="">Load the model list first</option>';
    guide();
    setStatus("keyStatus", "Provider changed. Test this provider's key before saving it.");
  };
  $("toggleKey").onclick = () => {
    $("apiKey").type = $("apiKey").type === "password" ? "text" : "password";
    $("toggleKey").textContent = $("apiKey").type === "password" ? "Show" : "Hide";
  };
  $("apiKey").addEventListener("paste", () => setTimeout(() => { $("apiKey").value = $("apiKey").value.trim(); }, 0));
  $("testSave").onclick = testAndSave;
  $("loadModels").onclick = loadModels;
  $("modelList").onchange = () => {
    if ($("modelList").value) {
      $("model").value = $("modelList").value;
      try { storageSet(modelStorageName($("provider").value), $("model").value); }
      catch (error) { setStatus("keyStatus", error.message); }
    }
  };
  $("model").onchange = () => {
    try { storageSet(modelStorageName($("provider").value), $("model").value.trim()); }
    catch (error) { setStatus("keyStatus", error.message); }
  };
  $("mode").onchange = () => {
    try { storageSet(KEYS.mode, $("mode").value); } catch (error) { setStatus("keyStatus", error.message); }
    applyModeDefaults();
  };
  $("webSearch").onchange = () => {
    try { storageSet(KEYS.webSearch, String($("webSearch").checked)); }
    catch (error) { setStatus("keyStatus", error.message); }
  };
  $("providerProfile").onchange = () => {
    try { storageSet(profileStorageName($("provider").value), $("providerProfile").value); }
    catch (error) { setStatus("keyStatus", error.message); }
  };
  $("testResearch").onclick = async () => {
    const provider = $("provider").value;
    const key = $("apiKey").value.trim() || storageGet(apiKeyStorageName(provider));
    if (!key) return setStatus("keyStatus", "Enter an API key and select Test & Save Key first.");
    const button = $("testResearch");
    button.disabled = true;
    setStatus("keyStatus", "Testing a small AI generation request without live web search.");
    try {
      const result = await call("/test-generation", key, provider, {
        model: $("model").value.trim() || storageGet(modelStorageName(provider))
      });
      setStatus("keyStatus", "AI generation test passed. This confirms a basic model response without web search. It does not test live search grounding or prove that future requests are free.");
    } catch (error) {
      setStatus("keyStatus", friendly(error));
    } finally { button.disabled = false; }
  };
  $("clearKey").onclick = () => {
    try {
      storageDelete(apiKeyStorageName($("provider").value)); storageSet(KEYS.provider, $("provider").value); storageDelete(modelStorageName($("provider").value));
      $("apiKey").value = ""; $("model").value = "";
      setStatus("keyStatus", "API key and provider settings cleared from this browser.");
      header();
    } catch (error) { setStatus("keyStatus", error.message); }
  };
  $("savedDraft").oninput = () => {
    try { storageSet(KEYS.draft, $("savedDraft").value); }
    catch (error) { setStatus("savedInfoStatus", error.message); }
  };
  $("paste").onclick = async () => {
    try {
      $("savedDraft").value = await navigator.clipboard.readText();
      storageSet(KEYS.draft, $("savedDraft").value);
    } catch { setStatus("savedInfoStatus", "Clipboard access was blocked. Use your device Paste command."); }
  };
  $("replace").onclick = () => {
    $("savedDraft").value = "";
    try { storageSet(KEYS.draft, ""); } catch (error) { setStatus("savedInfoStatus", error.message); }
    $("savedDraft").focus();
  };
  $("saveInfo").onclick = () => {
    const text = $("savedDraft").value.trim();
    if (!text) return setStatus("savedInfoStatus", "Enter information before saving.");
    try {
      storageSet(KEYS.info, JSON.stringify({ text, date: new Date().toISOString() }));
      storageSet(KEYS.draft, $("savedDraft").value);
      infoView(); header();
      setStatus("savedInfoStatus", "Saved information updated in this browser.");
    } catch (error) { setStatus("savedInfoStatus", error.message); }
  };
  $("editInfo").onclick = () => { $("savedDraft").focus(); $("saveInfo").classList.remove("hidden"); };
  $("deleteInfo").onclick = () => {
    if (!confirm("Are you sure you want to clear your saved information?")) return;
    try {
      storageDelete(KEYS.info); storageDelete(KEYS.draft);
      $("savedDraft").value = ""; infoView(); header();
      setStatus("savedInfoStatus", "Saved information deleted from this browser.");
    } catch (error) { setStatus("savedInfoStatus", error.message); }
  };
  $("download").onclick = () => {
    try {
      const saved = storageGet(KEYS.info);
      if (!saved) return setStatus("savedInfoStatus", "There is no saved information to back up.");
      let content; try { content = JSON.parse(saved).text; } catch { content = saved; }
      const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
      const link = document.createElement("a"); link.href = url; link.download = "entertainment-saved-info.txt"; link.click();
      URL.revokeObjectURL(url);
    } catch (error) { setStatus("savedInfoStatus", error.message); }
  };
  $("upload").onchange = async event => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      $("savedDraft").value = text;
      storageSet(KEYS.draft, text);
      setStatus("savedInfoStatus", "Backup loaded into the editor. Select Save Changes to activate it.");
    } catch (error) { setStatus("savedInfoStatus", error.message); }
    event.target.value = "";
  };
  $("searchBtn").onclick = search;
  $("newSearchBtn").onclick = () => {
    $("query").value = ""; $("results").classList.add("hidden");
    setStatus("status", "Ready for a new independent search.");
  };

  try {
    $("provider").value = storageGet(KEYS.provider) || "google";
    $("mode").value = storageGet(KEYS.mode) || "testing";
    $("apiKey").value = storageGet(apiKeyStorageName($("provider").value));
    $("model").value = storageGet(modelStorageName($("provider").value));
    const savedWebSearch = storageGet(KEYS.webSearch);
    $("webSearch").checked = savedWebSearch ? savedWebSearch === "true" : $("mode").value === "production";
    $("depth").querySelectorAll('option[value="3"], option[value="4"]').forEach(option => { option.disabled = $("mode").value !== "production"; });
    if ($("mode").value === "testing" && Number($("depth").value) > 2) $("depth").value = "2";
    refreshProfiles();
    guide(); infoView(); header();
    if (!storageGet(apiKeyStorageName($("provider").value))) openSettings();
  } catch (error) {
    guide(); setStatus("keyStatus", error.message); header(); openSettings();
  }
})();
