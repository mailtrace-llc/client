// src/composables/useDashboardBilling.ts
import { ref, computed, watch } from "vue";
import type { RouteLocationNormalizedLoaded, Router } from "vue-router";

import { useAuthStore } from "@/stores/auth";
import {
    createCheckoutSession,
    createBillingPortalSession,
    createRunCharge,
    type RunEstimateResponse,
} from "@/api/billing";

type PaywallMode = "subscription" | "run_charge";

interface BackendPaywallConfig {
    title?: string;
    body?: string;

    // snake + camel from backend
    priceSummary?: string;
    price_summary?: string;

    primaryLabel?: string;
    primary_label?: string;

    secondaryLabel?: string;
    secondary_label?: string;

    bullets?: string[];
}

export interface PaywallConfig {
    title?: string;
    body?: string;
    priceSummary?: string;
    primaryLabel?: string;
    secondaryLabel?: string;
    bullets?: string[];
}

interface RunChargeRequiredPayload {
    runId: string;
    estimate: RunEstimateResponse;
}

export function useDashboardBilling(
    route: RouteLocationNormalizedLoaded,
    router: Router
) {
    const auth = useAuthStore();

    const showPaywall = ref(false);
    const paywallBusy = ref(false);

    const showPaymentFailed = ref(false);
    const paymentFailedBusy = ref(false);

    const paywallMode = ref<PaywallMode>("subscription");
    const pendingRunId = ref<string | null>(null);
    const runEstimate = ref<RunEstimateResponse | null>(null);

    // Raw billing from auth store
    const rawBilling = computed<any | null>(() => auth.billing ?? null);

    // Normalise paywall_config keys into camelCase for the modal
    const billing = computed(() => {
        const b = rawBilling.value;
        if (!b) return null;

        const cfg = (b.paywall_config || {}) as BackendPaywallConfig;

        const normalizedConfig: PaywallConfig = {
            title: cfg.title,
            body: cfg.body,
            priceSummary: cfg.priceSummary ?? cfg.price_summary,
            primaryLabel: cfg.primaryLabel ?? cfg.primary_label,
            secondaryLabel: cfg.secondaryLabel ?? cfg.secondary_label,
            bullets: cfg.bullets ?? [],
        };

        return { ...b, paywall_config: normalizedConfig } as any;
    });

    const paywallConfig = computed<PaywallConfig>(() => {
        const base = (billing.value?.paywall_config || {}) as PaywallConfig;

        // 1) Subscription paywall unchanged
        if (paywallMode.value === "subscription") {
            return base;
        }

        // 2) Run-charge paywall
        const est = runEstimate.value;

        // Build price summary directly from the estimate, if present
        let priceSummary: string | undefined;
        if (est) {
            const dollars = (est.amount_cents ?? 0) / 100;
            const unit = (est.unit_cents ?? 0) / 100;

            priceSummary = `This run will cost approximately $${dollars.toFixed(
                2
            )} (${est.distinct_count} mailers at $${unit.toFixed(2)} each).`;
        } else {
            // Fallback if, for some reason, we don't have an estimate yet
            priceSummary = base.priceSummary;
        }

        return {
            ...base,
            // For run_charge mode we *override* the generic subscription text
            title: "Confirm run charges",
            body:
                "We’ll create a one-time metered charge for this matching run before it starts.",
            priceSummary,
            primaryLabel: "Confirm & charge",
            secondaryLabel: "Cancel",
        };
    });

    const isBillingOverlayActive = computed(
        () => showPaywall.value || showPaymentFailed.value
    );

    // Watch for “payment failed” statuses from backend billing
    watch(
        () => billing.value,
        (b) => {
            if (!b) return;

            const status = b.subscription_status || (b as any).status;
            if (["past_due", "unpaid", "incomplete"].includes(status)) {
                showPaymentFailed.value = true;
            }
        },
        { immediate: true }
    );

    // Success banner after returning from Stripe
    const billingQuery = computed(
        () => route.query.billing as string | undefined
    );

    const billingDismissed = ref(false);

    const showBillingSuccess = computed(
        () =>
            !billingDismissed.value &&
            billingQuery.value === "success" &&
            !!billing.value?.is_subscribed
    );

    function dismissBillingSuccess() {
        billingDismissed.value = true;

        // Remove billing=success from the URL without reloading
        const { billing, ...rest } = route.query;
        router.replace({ query: rest }).catch(() => {
            // ignore navigation duplication
        });
    }

    /**
     * Called when backend/frontend decides the user needs a subscription
     * before running matching.
     */
    function onRequireSubscription() {
        paywallMode.value = "subscription";
        showPaywall.value = true;
    }

    function onRunChargeRequired(payload: RunChargeRequiredPayload) {
        paywallMode.value = "run_charge";
        pendingRunId.value = payload.runId;
        runEstimate.value = payload.estimate;
        showPaywall.value = true;
    }

    async function onPaywallPrimary() {
        if (paywallBusy.value) return;
        paywallBusy.value = true;

        try {
            if (paywallMode.value === "subscription") {
                const { url } = await createCheckoutSession("dashboard_paywall");
                if (url) {
                    window.location.href = url; // Stripe Checkout (subscription)
                } else {
                    console.error(
                        "[DashboardBilling] No checkout URL received from createCheckoutSession"
                    );
                }
                return;
            }

            // run_charge mode
            if (!pendingRunId.value) {
                console.error(
                    "[DashboardBilling] paywall in run_charge mode, but no pendingRunId"
                );
                return;
            }

            const { url, raw } = await createRunCharge(
                pendingRunId.value,
                "dashboard_run"
            );

            if (url) {
                window.location.href = url;
            } else {
                console.error(
                    "[DashboardBilling] run charge did not return a checkout/invoice URL",
                    raw
                );
            }

            showPaywall.value = false;
        } catch (err) {
            console.error(
                "[DashboardBilling] Failed to start checkout / run charge:",
                err
            );
        } finally {
            paywallBusy.value = false;
        }
    }

    function onPaywallSecondary() {
        showPaywall.value = false;
    }

    async function onPaymentFixPrimary() {
        if (paymentFailedBusy.value) return;
        paymentFailedBusy.value = true;

        try {
            const { url } = await createBillingPortalSession("/dashboard");
            if (url) {
                window.location.href = url;
            } else {
                console.error(
                    "[DashboardBilling] No portal URL received from createBillingPortalSession"
                );
            }
        } catch (err) {
            console.error("[DashboardBilling] Failed to open billing portal:", err);
        } finally {
            paymentFailedBusy.value = false;
        }
    }

    function onPaymentFailedSecondary() {
        showPaymentFailed.value = false;
    }

    async function maybeStartCheckoutFromQuery() {
        const src = (route.query.startCheckout as string) || "";
        if (!src) return;

        // Make sure we know whether we’re authenticated
        if (!auth.initialized && !auth.loading) {
            await auth.fetchMe();
        }

        if (!auth.isAuthenticated) {
            // Not logged in; don’t attempt billing.
            return;
        }

        try {
            const { url } = await createCheckoutSession(src);
            if (url) {
                window.location.href = url;
            } else {
                console.error(
                    "[DashboardBilling] No checkout URL from createCheckoutSession (startCheckout=%s)",
                    src
                );
            }
        } catch (err) {
            console.error(
                "[DashboardBilling] Failed to start checkout from startCheckout query",
                err
            );
        }
    }

    async function maybeResumeRunAfterRunCheckout(
        startRunForId: (runId: string) => Promise<void>
    ) {
        const runId = route.query.run as string | undefined;
        const billing = route.query.billing as string | undefined;

        if (!runId || billing !== "run_success") {
            return;
        }

        // Make sure auth state is loaded so /runs/start is allowed
        if (!auth.initialized && !auth.loading) {
            await auth.fetchMe();
        }
        if (!auth.isAuthenticated) {
            console.warn(
                "[DashboardBilling] Cannot resume run after checkout: user not authenticated"
            );
            return;
        }

        try {
            console.info(
                "[DashboardBilling] Resuming run after successful run charge",
                runId
            );
            await startRunForId(runId);
        } catch (err) {
            console.error(
                "[DashboardBilling] Failed to re-start run after billing success",
                err
            );
        } finally {
            // Clean query params so refresh doesn't keep restarting the run
            const { billing, run, ...rest } = route.query;
            router
                .replace({ query: rest })
                .catch(() => {/* ignore duplicate nav */ });
        }
    }


    return {
        // state
        showPaywall,
        paywallBusy,
        showPaymentFailed,
        paymentFailedBusy,
        paywallConfig,
        isBillingOverlayActive,
        showBillingSuccess,

        // actions
        dismissBillingSuccess,
        onRequireSubscription,
        onRunChargeRequired,
        onPaywallPrimary,
        onPaywallSecondary,
        onPaymentFixPrimary,
        onPaymentFailedSecondary,
        maybeStartCheckoutFromQuery,
        maybeResumeRunAfterRunCheckout,
    };
}