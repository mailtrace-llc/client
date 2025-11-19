// src/api/billing.ts
import { postJson } from "@/api/http";

export interface CheckoutSessionRaw {
    checkout_url?: string | null;
    url?: string | null;
}

export interface CheckoutSessionResult {
    url: string | null;
}

/**
 * Create a Stripe Checkout session (new subscription or upgrade)
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