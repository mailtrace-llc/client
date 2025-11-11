<!-- src/pages/LandingPage.vue -->
<template>
  <div class="min-h-screen bg-[#0b1220] text-slate-200">
    <!-- Header -->
    <header
      class="sticky top-0 z-40 border-b border-slate-800/60 bg-[#0b1220]/80 backdrop-blur"
    >
      <div
        class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
      >
        <RouterLink to="/welcome" class="flex items-center gap-2">
          <Logo class="h-7 w-7" aria-hidden="true" />
          <span class="sr-only">MailTrace</span>
        </RouterLink>

        <nav class="hidden md:flex items-center gap-6 text-sm text-slate-300">
          <a href="#about" class="hover:text-white">ABOUT</a>
          <a href="#pricing" class="hover:text-white">PRICING</a>
          <a href="#faq" class="hover:text-white">FAQ</a>
          <a href="#contact" class="hover:text-white">CONTACT US</a>
        </nav>

        <div class="flex items-center gap-3">
          <RouterLink
            to="/paywall"
            class="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/40 px-3.5 py-2 text-sm font-medium hover:bg-slate-700/50"
          >
            Sign Up / Login
          </RouterLink>
          <a
            href="#contact"
            class="inline-flex items-center justify-center rounded-xl bg-slate-700 px-3.5 py-2 text-sm font-semibold hover:bg-slate-600"
          >
            Book A Demo
          </a>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section id="about" class="relative overflow-hidden">
      <div
        class="absolute inset-0 bg-linear-to-b from-sky-500/10 via-transparent to-transparent pointer-events-none"
      />
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="py-20 md:py-28 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 class="text-4xl sm:text-5xl font-bold text-white">
              QR Codes & Promo Mail Tracking — unified.
            </h1>
            <p class="mt-5 max-w-xl text-slate-300">
              Upload mail + CRM CSVs, normalize addresses, auto-match jobs to
              mailers, and see KPIs instantly.
            </p>
            <div class="mt-8 flex flex-wrap items-center gap-3">
              <RouterLink
                to="/paywall"
                class="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-slate-900"
              >
                Get started
              </RouterLink>
              <a
                href="#how"
                class="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold border border-slate-700 hover:bg-slate-800/50"
              >
                See how it works
              </a>
            </div>
          </div>

          <div class="relative">
            <div
              class="rounded-2xl border border-slate-800 bg-[#0f172a] shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
            >
              <!-- Replace with an exported Figma screenshot -->
              <div
                class="aspect-16/10 w-full rounded-2xl bg-linear-to-br from-slate-800 via-slate-900 to-black"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="how" class="py-16 sm:py-20 border-t border-slate-800/60">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-semibold text-white">How it works</h2>
        <ol class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 list-none">
          <li class="rounded-2xl border border-slate-800 bg-[#0f172a] p-5">
            <div class="flex items-center gap-3">
              <span
                class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-slate-900 text-xs font-bold"
                >1</span
              >
              <h3 class="text-base font-semibold text-white">Upload</h3>
            </div>
            <p class="mt-3 text-sm text-slate-300">
              Send raw CSVs to staging_raw tables.
            </p>
          </li>
          <li class="rounded-2xl border border-slate-800 bg-[#0f172a] p-5">
            <div class="flex items-center gap-3">
              <span
                class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-slate-900 text-xs font-bold"
                >2</span
              >
              <h3 class="text-base font-semibold text-white">Run</h3>
            </div>
            <p class="mt-3 text-sm text-slate-300">
              Click <b>Run</b>; normalize → staging with dedupe/upserts.
            </p>
          </li>
          <li class="rounded-2xl border border-slate-800 bg-[#0f172a] p-5">
            <div class="flex items-center gap-3">
              <span
                class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-slate-900 text-xs font-bold"
                >3</span
              >
              <h3 class="text-base font-semibold text-white">Match</h3>
            </div>
            <p class="mt-3 text-sm text-slate-300">
              Group by job_index, attach mail_ids[], compute scores.
            </p>
          </li>
          <li class="rounded-2xl border border-slate-800 bg-[#0f172a] p-5">
            <div class="flex items-center gap-3">
              <span
                class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-slate-900 text-xs font-bold"
                >4</span
              >
              <h3 class="text-base font-semibold text-white">KPIs</h3>
            </div>
            <p class="mt-3 text-sm text-slate-300">
              Summary card fetches on mount and on Refresh.
            </p>
          </li>
        </ol>
      </div>
    </section>

    <!-- Pricing -->
    <section id="pricing" class="py-16 sm:py-20 border-t border-slate-800/60">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-semibold text-white">Pricing</h2>
        <div class="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="rounded-2xl border border-slate-800 bg-[#0f172a] p-5">
            <div class="flex items-baseline justify-between">
              <h3 class="text-base font-semibold text-white">Starter</h3>
              <div class="text-lg font-bold text-slate-200">Free</div>
            </div>
            <ul class="mt-3 space-y-2 text-sm text-slate-300">
              <li>Up to 50k rows</li>
              <li>Manual runs</li>
              <li>Email support</li>
            </ul>
          </div>
          <div class="rounded-2xl border border-sky-600 bg-slate-900 p-5">
            <div class="flex items-baseline justify-between">
              <h3 class="text-base font-semibold text-white">Pro</h3>
              <div class="text-lg font-bold text-sky-400">$99/mo</div>
            </div>
            <ul class="mt-3 space-y-2 text-sm text-slate-300">
              <li>Up to 5M rows</li>
              <li>Priority runs</li>
              <li>Team seats</li>
            </ul>
          </div>
          <div class="rounded-2xl border border-slate-800 bg-[#0f172a] p-5">
            <div class="flex items-baseline justify-between">
              <h3 class="text-base font-semibold text-white">Enterprise</h3>
              <div class="text-lg font-bold text-slate-200">Custom</div>
            </div>
            <ul class="mt-3 space-y-2 text-sm text-slate-300">
              <li>10M+ rows</li>
              <li>SLA</li>
              <li>SSO</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section id="contact" class="py-16 sm:py-20 border-t border-slate-800/60">
      <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-semibold text-white">
          Ready to see your matches?
        </h2>
        <p class="mt-3 text-slate-300">
          Book a demo or jump straight into the app.
        </p>
        <div class="mt-6 flex items-center justify-center gap-3">
          <RouterLink
            to="/paywall"
            class="inline-flex items-center justify-center rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-sky-400"
          >
            Open the Dashboard
          </RouterLink>
          <a
            href="mailto:hello@mailtrace.example"
            class="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/40 px-5 py-3 text-sm font-medium hover:bg-slate-700/50"
          >
            Email Us
          </a>
        </div>
      </div>
    </section>

    <footer class="border-t border-slate-800/60">
      <div
        class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <p>© {{ new Date().getFullYear() }} MailTrace. All rights reserved.</p>
        <div class="flex items-center gap-4">
          <a href="#" class="hover:text-white">Terms</a>
          <a href="#" class="hover:text-white">Privacy</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import Logo from "@/assets/logo_new.svg?component"; // <-- inline SVG component
</script>

<style scoped></style>
