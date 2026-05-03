// Mock SMS adapter. In dev, codes are logged to the server console.
// To wire up Twilio in production:
//   1. set SMS_PROVIDER=twilio + TWILIO_ACCOUNT_SID/AUTH_TOKEN/FROM in env
//   2. add a `twilio` branch below that calls the Twilio REST API.

export async function sendSms(to: string, body: string): Promise<void> {
  const provider = process.env.SMS_PROVIDER ?? "mock";
  if (provider === "mock") {
    console.log("\n========== [MOCK SMS] ==========");
    console.log(`To:   ${to}`);
    console.log(`Body: ${body}`);
    console.log("================================\n");
    return;
  }

  throw new Error(`SMS provider "${provider}" is not configured.`);
}
