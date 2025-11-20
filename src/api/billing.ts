// src/api/billing.ts
import { api, postJson } from "@/api/http";

export interface CheckoutSessionRaw {
    checkout_url?: string | null;
    url?: string | null;
}

export interface CheckoutSessionResult {
    url: string | null;
}

/**
 * Create a Stripe Checkout session (subscription)
 * Backend route: POST /api/billing/create-checkout-session
 * We call it as "/billing/..." because Axios http.ts already has "/api" as base.
 */
export async function createCheckoutSession(
    source: string = "dashboard_paywall"
): Promise<CheckoutSessionResult> {
    const data = await postJson<CheckoutSessionRaw>(
        "/billing/create-checkout-session",
        { source }
    );

    const url =
        (data.checkout_url && String(data.checkout_url)) ||
        (data.url && String(data.url)) ||
        null;

    if (!url) {
        console.error("[billing.api] No checkout URL returned from backend", data);
    }

    return { url };
}

/**
 * Create a Stripe Billing Portal session so the user can
 * update payment method / fix failed payments.
 * Backend route: POST /api/billing/create-portal-session
 */
export async function createBillingPortalSession(
    returnPath: string = "/dashboard"
): Promise<CheckoutSessionResult> {
    const data = await postJson<CheckoutSessionRaw>(
        "/billing/create-portal-session",
        { return_path: returnPath }
    );

    const url =
        (data.checkout_url && String(data.checkout_url)) ||
        (data.url && String(data.url)) ||
        null;

    if (!url) {
        console.error("[billing.api] No portal URL returned from backend", data);
    }

    return { url };
}

/* ------------------------------------------------------------------
 * Run-level pay-as-you-go billing
 * ------------------------------------------------------------------ */

export interface RunEstimateResponse {
    distinct_count: number;
    unit_cents: number;
    amount_cents: number;
    currency?: string;
    // allow extra fields without breaking TS
    [key: string]: any;
}

export interface RunChargeResponse {
    ok: boolean;
    run_id?: string;
    run_charge_id?: string;
    invoice_id?: string;
    invoice_status?: string;
    hosted_invoice_url?: string;
    amount_cents?: number;
    currency?: string;
    checkout_url?: string | null;
    url?: string | null;
    [key: string]: any;
}

export interface RunChargeResult {
    url: string | null;
    raw: RunChargeResponse;
}

/**
 * Get a cost estimate for a run.
 * Backend route: GET /api/billing/run-estimate/<run_id>
 */
export async function getRunEstimate(
    runId: string
): Promise<RunEstimateResponse> {
    const data = await api<RunEstimateResponse>(
        `/billing/run-estimate/${encodeURIComponent(runId)}`,
        { method: "GET" }
    );
    return data;
}

/**
 * Create a pay-as-you-go charge for a run.
 * Backend route: POST /api/billing/run-charge
 */
export async function createRunCharge(
    runId: string,
    source: string = "dashboard_run"
): Promise<RunChargeResult> {
    const data = await postJson<RunChargeResponse>("/billing/run-charge", {
        run_id: runId,
        source,
    });

    // Normalize URL: prefer hosted_invoice_url, but also support any direct url/checkout_url
    const url =
        (data.checkout_url && String(data.checkout_url)) ||
        (data.url && String(data.url)) ||
        (data.hosted_invoice_url && String(data.hosted_invoice_url)) ||
        null;

    if (!url) {
        console.error(
            "[billing.api] run charge did not return a checkout/invoice URL",
            data
        );
    }

    return { url, raw: data };
}