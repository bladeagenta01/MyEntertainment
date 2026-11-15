import { json, testProvider, validateRequestBody } from "../_lib/provider.js";

export async function onRequestPost({ request }) {
  let body;
  try { body = await request.json(); }
  catch { return json({ error: "The request body must be valid JSON." }, 400); }
  const checked = validateRequestBody(body);
  if (checked.error) return json({ error: checked.error }, 400);
  try {
    return await testProvider(checked.provider, checked.key);
  } catch (error) {
    return json({ error: error.message || "The provider connection test failed." }, 502);
  }
}
