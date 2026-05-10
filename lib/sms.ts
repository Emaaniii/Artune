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
// 4. Set SMS_PROVIDER=whatsapp + TWILIO_ACCOUNT_SID/AUTH_TOKEN/WHATSAPP_FROM in env.
//
// IMPORTANT — the WhatsApp 24-hour customer-care window:
//   Even after joining the sandbox, WhatsApp only allows you to send freeform
//   messages within 24 hours of the user's last *inbound* message. After that
//   window, Twilio's API still returns 201 (queued) but delivery fails moments
//   later with error_code 63016 ("freeform message outside allowed window").
//
//   sendSms() now performs a brief post-send delivery probe and throws a
//   typed error so the caller can map 63016 → a clear "send 'hi' to the
//   sandbox first" message in the UI.

export class SendSmsError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "OUTSIDE_WHATSAPP_WINDOW"
      | "SANDBOX_NOT_JOINED"
      | "DELIVERY_FAILED"
      | "TWILIO_API"
      | "MISCONFIGURED",
  ) {
    super(message);
    this.name = "SendSmsError";
  }
}

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

  throw new SendSmsError(
    `SMS provider "${provider}" is not configured.`,
    "MISCONFIGURED",
  );
}

type TwilioArgs = { to: string; body: string; channel: "sms" | "whatsapp" };

async function sendViaTwilio({ to, body, channel }: TwilioArgs): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from =
    channel === "whatsapp"
      ? process.env.TWILIO_WHATSAPP_FROM ?? "+14155238886"
      : process.env.TWILIO_FROM;

  if (!sid || !token || !from) {
    throw new SendSmsError(
      `Twilio (${channel}) credentials incomplete: need TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and ${
        channel === "whatsapp" ? "TWILIO_WHATSAPP_FROM" : "TWILIO_FROM"
      }.`,
      "MISCONFIGURED",
    );
  }

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const accountUrl = `https://api.twilio.com/2010-04-01/Accounts/${sid}`;

  const form = new URLSearchParams();
  form.set("To", channel === "whatsapp" ? `whatsapp:${to}` : to);
  form.set("From", channel === "whatsapp" ? `whatsapp:${from}` : from);
  form.set("Body", body);

  // 1. Send.
  const res = await fetch(`${accountUrl}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  const sentJson = (await res.json().catch(() => ({}))) as {
    sid?: string;
    message?: string;
    code?: number;
  };

  if (!res.ok) {
    const msg = sentJson.message ?? `${res.status} ${res.statusText}`;
    throw new SendSmsError(
      `Twilio ${channel} API error: ${msg}${sentJson.code ? ` (code ${sentJson.code})` : ""}`,
      "TWILIO_API",
    );
  }

  const messageSid = sentJson.sid;
  console.log(`[twilio:${channel}] queued ${messageSid} → ${to}`);

  // 2. WhatsApp only — poll once after ~1.5s to catch silent 63016 delivery
  // failures. SMS goes through carriers without the same window restriction,
  // so we skip the probe there to avoid the latency hit.
  if (channel === "whatsapp" && messageSid) {
    await new Promise((r) => setTimeout(r, 1500));
    try {
      const probe = await fetch(`${accountUrl}/Messages/${messageSid}.json`, {
        headers: { Authorization: `Basic ${auth}` },
      });
      if (probe.ok) {
        const status = (await probe.json()) as {
          status?: string;
          error_code?: number | null;
          error_message?: string | null;
        };
        if (
          status.status === "undelivered" ||
          status.status === "failed"
        ) {
          if (status.error_code === 63016) {
            throw new SendSmsError(
              "WhatsApp blocked the message because the user is outside the 24-hour reply window. Ask them to send any message to the sandbox number first.",
              "OUTSIDE_WHATSAPP_WINDOW",
            );
          }
          if (status.error_code === 63015 || status.error_code === 63007) {
            throw new SendSmsError(
              "WhatsApp could not deliver — the recipient is not in the Twilio Sandbox. Sandbox membership expires every 72 hours. From the recipient's WhatsApp, send the join phrase (Twilio Console → Messaging → Try it out → Send a WhatsApp message) to +14155238886, then retry.",
              "SANDBOX_NOT_JOINED",
            );
          }
          throw new SendSmsError(
            `WhatsApp ${status.status}${
              status.error_code ? ` (code ${status.error_code})` : ""
            }${status.error_message ? ` — ${status.error_message}` : ""}`,
            "DELIVERY_FAILED",
          );
        }
      }
    } catch (e) {
      if (e instanceof SendSmsError) throw e;
      // Probe failure (network, timeout) is non-fatal — message may still arrive.
      console.warn(
        `[twilio:${channel}] status probe failed for ${messageSid}: ${
          e instanceof Error ? e.message : "unknown"
        }`,
      );
    }
  }
}
