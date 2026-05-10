// MyFatoorah server-side helpers.
//
// The customer-facing payment URL is created inside the Supabase edge function
// `myfatoorah-initiate`. This module is only used by the Next.js callback route
// to query payment status (v2/GetPaymentStatus) once the gateway redirects
// back to us.

import "server-only";

const TEST_BASE = "https://apitest.myfatoorah.com";
// Public sandbox key from https://docs.myfatoorah.com/docs/api-key (region KWT).
const TEST_KEY =
  "SK_KWT_vVZlnnAqu8jRByOWaRPNId4ShzEDNt256dvnjebuyzo52dXjAfRx2ixW5umjWSUx";

export type MyFatoorahStatus = "Paid" | "Pending" | "Canceled" | "Failed";

export interface PaymentStatus {
  invoiceId: string;
  invoiceStatus: MyFatoorahStatus;
  customerReference: string | null;
  paymentId: string | null;
  invoiceValue: number;
}

interface GetPaymentStatusResponse {
  IsSuccess?: boolean;
  Message?: string;
  Data?: {
    InvoiceId?: number;
    InvoiceStatus?: string;
    InvoiceReference?: string;
    CustomerReference?: string;
    InvoiceValue?: number;
    InvoiceTransactions?: Array<{
      PaymentId?: string;
      TransactionStatus?: string;
    }>;
  };
}

function baseUrl() {
  return process.env.MYFATOORAH_BASE_URL ?? TEST_BASE;
}

function apiKey() {
  return process.env.MYFATOORAH_API_KEY ?? TEST_KEY;
}

export async function getPaymentStatus(
  key: string,
  keyType: "PaymentId" | "InvoiceId" | "CustomerReference",
): Promise<PaymentStatus | null> {
  const res = await fetch(`${baseUrl()}/v2/GetPaymentStatus`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ Key: key, KeyType: keyType }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as GetPaymentStatusResponse;
  if (!json.IsSuccess || !json.Data) return null;

  const txs = json.Data.InvoiceTransactions ?? [];
  const last = txs[txs.length - 1];

  return {
    invoiceId: String(json.Data.InvoiceId ?? ""),
    invoiceStatus: (json.Data.InvoiceStatus as MyFatoorahStatus) ?? "Pending",
    customerReference: json.Data.CustomerReference ?? null,
    paymentId: last?.PaymentId ?? null,
    invoiceValue: Number(json.Data.InvoiceValue ?? 0),
  };
}
