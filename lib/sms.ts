// Messaging adapter, switched via SMS_PROVIDER env var:
//   - "mock"     → codes logged to the dev server console (default)
//   - "twilio"   → real SMS via the Twilio REST API
//   - "whatsapp" → WhatsApp message via Twilio (uses the WhatsApp sandbox by default)
//
// --- WhatsApp Sandbox setup (recommended for dev) ---
// 1. Twilio Console → Messaging → Try it out → "Send a WhatsApp message".
// 2. Note the sandbox number (default +14155238886) and the join code,
//    e.g. "join purple-lion".
// 3. From your WhatsApp on +96594942442, send that join phrase to +14155238886.
//    Twilio replies confirming you've joined.
// 4. In .env:
//      SMS_PROVIDER=whatsapp
//      TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//      TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//      TWILIO_WHATSAPP_FROM=+14155238886       (sandbox; or your approved sender)
// 5. Restart `npm run dev`. Sign up — code arrives on WhatsApp.
//
// Sandbox messages are free but only work to numbers that have joined.
// Each opt-in lasts 72 hours; re-send the join phrase to refresh.
//
// --- SMS setup (alternative) ---
// Same as above but: SMS_PROVIDER=twilio, TWILIO_FROM=<a Twilio phone number>.
// Trial accounts can only text Verified Caller IDs.

export async function sendSms(to: string, body: string): Promise<void> {
  const provider = (process.env.SMS_PROVIDER ?? "mock").toLowerCase();

  if (provider === "mock") {
    console.log("\n========== [MOCK SMS] ==========");
    console.log(`To:   ${to}`);
    console.log(`Body: ${body}`);
    console.log("================================\n");
    return;
  }

  if (provider === "twilio") {
    return sendViaTwilio({ to, body, channel: "sms" });
  }

  if (provider === "whatsapp") {
    return sendViaTwilio({ to, body, channel: "whatsapp" });
  }

  throw new Error(`SMS provider "${provider}" is not configured.`);
}

type TwilioArgs = { to: string; body: string; channel: "sms" | "whatsapp" };

async function sendViaTwilio({ to, body, channel }: TwilioArgs): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from =
    channel === "whatsapp"
      ? process.env.TWILIO_WHATSAPP_FROM ?? "+14155238886" // Twilio's sandbox number
      : process.env.TWILIO_FROM;

  if (!sid || !token || !from) {
    throw new Error(
      `Twilio (${channel}) is selected but credentials are incomplete. ` +
        `Need TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and ${
          channel === "whatsapp" ? "TWILIO_WHATSAPP_FROM" : "TWILIO_FROM"
        } in .env.`,
    );
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");

  const form = new URLSearchParams();
  form.set("To", channel === "whatsapp" ? `whatsapp:${to}` : to);
  form.set("From", channel === "whatsapp" ? `whatsapp:${from}` : from);
  form.set("Body", body);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const data = (await res.json()) as { message?: string; code?: number };
      detail = data?.message ? ` — ${data.message}` : "";
      if (data?.code) detail += ` (Twilio code ${data.code})`;
    } catch {
      // body wasn't JSON; fall through with status only
    }
    throw new Error(
      `Twilio ${channel} send failed: ${res.status} ${res.statusText}${detail}`,
    );
  }

  console.log(`[twilio:${channel}] sent to ${to} (status ${res.status})`);
}
