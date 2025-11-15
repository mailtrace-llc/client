<script setup lang="ts">
import heroMockup from "@/assets/home/dashboard_sample_image.png";
import landingLogo from "@/assets/logo-landing-page-01.svg?url";

import curve from "@/assets/home/curve.svg?url";
import rightDown from "@/assets/home/right-down.svg?url";
</script>

<template>
  <section class="bg-[#f6f5f9] min-h-[980px] flex flex-col">
    <!-- NAVBAR -->
    <header
      class="mx-auto flex w-full max-w-[1660px] 2xl:max-w-[1760px] items-center justify-between px-4 sm:px-6 md:px-10 xl:px-16 2xl:px-20 pt-4 sm:pt-8 pb-4 sm:pb-10"
    >
      <!-- logo -->
      <div class="flex items-center gap-2">
        <img
          :src="landingLogo"
          alt="MailTrace"
          class="h-[42px] sm:h-[46px] md:h-14 w-auto"
        />
      </div>

      <!-- top-right CTAs -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Disabled Sign Up/Login with tooltip -->
        <div class="relative group">
          <button
            type="button"
            class="rounded-lg bg-[#47bfa9] px-4 sm:px-6 py-2 text-[16px] sm:text-[20px] font-semibold text-white shadow-sm opacity-70 cursor-not-allowed"
            aria-disabled="true"
          >
            Sign Up / Login
          </button>
          <div
            class="pointer-events-none absolute right-0 top-full mt-2 w-max rounded bg-[#0b2d4f] px-3 py-1 text-xs text-white shadow-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          >
            Coming soon. Contact support@mailtrace.ai for help.
          </div>
        </div>

        <!-- Book a Demo -> mailto -->
        <a
          href="mailto:support@mailtrace.ai"
          class="hidden md:inline-flex rounded-lg bg-[#0b2d50] px-6 py-2 text-[20px] font-semibold text-white shadow-sm hover:bg-[#123b6a]"
        >
          Book a Demo
        </a>
      </div>
    </header>

    <!-- HERO ROW -->
    <div
      class="mx-auto flex w-full max-w-[1660px] 2xl:max-w-[1760px] flex-col-reverse md:flex-row md:items-center md:justify-between gap-10 md:gap-16 px-4 sm:px-6 md:px-10 xl:px-16 2xl:px-20 pb-16 sm:pb-24 pt-2 flex-1"
    >
      <!-- LEFT COLUMN -->
      <div class="w-full md:w-[52%] max-w-[780px] text-center">
        <h1
          class="font-normal text-[#0b2d4f] tracking-[-0.04em] text-[34px] sm:text-[56px] xl:text-[78px] leading-10 sm:leading-16 xl:leading-[90px]"
        >
          QR Codes &amp; Promo Codes Miss 70–90% of Conversions
        </h1>

        <p
          class="mt-6 text-[15px] sm:text-[18px] leading-6 sm:leading-7 font-semibold text-[#47bfa9]"
        >
          Our AI matches every job to the exact mailed address for 100% accurate
          ROI and rich analytical insight
        </p>

        <!-- 01 / 02 / 03 strip -->
        <!-- Desktop / tablet: horizontal circles + curves + labels -->
        <div class="mt-8 sm:mt-10 hidden md:flex flex-col items-center gap-5">
          <div class="flex items-center">
            <!-- 01 -->
            <div
              class="flex h-10 w-10 sm:h-[45px] sm:w-[45px] shrink-0 items-center justify-center rounded-full border-2 border-[#47bfa9] bg-white shadow-[0_4px_14px_rgba(11,45,80,0.12)]"
            >
              <span
                class="text-[18px] sm:text-[20px] font-bold tracking-[0.27px] text-[#0b2d50]"
              >
                01
              </span>
            </div>

            <img :src="curve" alt="" class="h-10 sm:h-[45px] w-auto" />

            <!-- 02 -->
            <div
              class="flex h-10 w-10 sm:h-[45px] sm:w-[45px] shrink-0 items-center justify-center rounded-full border-2 border-[#47bfa9] bg-white shadow-[0_4px_14px_rgba(11,45,80,0.12)]"
            >
              <span
                class="text-[18px] sm:text-[20px] font-bold tracking-[0.27px] text-[#0b2d50]"
              >
                02
              </span>
            </div>

            <img :src="curve" alt="" class="h-10 sm:h-[45px] w-auto" />

            <!-- 03 -->
            <div
              class="flex h-10 w-10 sm:h-[45px] sm:w-[45px] shrink-0 items-center justify-center rounded-full border-2 border-[#47bfa9] bg-white shadow-[0_4px_14px_rgba(11,45,80,0.12)]"
            >
              <span
                class="text-[18px] sm:text-[20px] font-bold tracking-[0.27px] text-[#0b2d50]"
              >
                03
              </span>
            </div>
          </div>

          <div
            class="grid w-full max-w-[640px] grid-cols-3 gap-2 text-[16px] sm:text-[18px] font-semibold text-[#0b2d4f]"
          >
            <!-- Step 1 label with tooltip -->
            <div class="relative group text-center md:text-left">
              <span>Sign Up / Login</span>
              <div
                class="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-[#0b2d4f] px-3 py-1 text-xs text-white shadow-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              >
                Coming soon. Contact support@mailtrace.ai for help.
              </div>
            </div>

            <p class="text-center md:text-left">Upload Your CSV</p>
            <p class="text-center md:text-left">Review KPIs &amp; Trends</p>
          </div>
        </div>

        <!-- Mobile: vertical stepper with circles + dashed connector -->
        <div class="mt-8 flex flex-col gap-4 md:hidden">
          <!-- Step 1 -->
          <div class="flex items-center gap-4">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#47bfa9] bg-white shadow-[0_4px_14px_rgba(11,45,80,0.12)] shrink-0"
            >
              <span
                class="text-[18px] font-bold tracking-[0.27px] text-[#0b2d50]"
              >
                01
              </span>
            </div>
            <div class="relative group text-left">
              <span class="text-[16px] font-semibold text-[#0b2d4f]">
                Sign Up / Login
              </span>
              <div
                class="pointer-events-none absolute left-0 top-full mt-1 whitespace-nowrap rounded bg-[#0b2d4f] px-3 py-1 text-xs text-white shadow-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              >
                Coming soon. Contact support@mailtrace.ai for help.
              </div>
            </div>
          </div>

          <!-- connector -->
          <div class="ml-5 h-6 border-l border-dashed border-[#47bfa9]" />

          <!-- Step 2 -->
          <div class="flex items-center gap-4">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#47bfa9] bg-white shadow-[0_4px_14px_rgba(11,45,80,0.12)] shrink-0"
            >
              <span
                class="text-[18px] font-bold tracking-[0.27px] text-[#0b2d50]"
              >
                02
              </span>
            </div>
            <p class="text-[16px] font-semibold text-[#0b2d4f]">
              Upload Your CSV
            </p>
          </div>

          <!-- connector -->
          <div class="ml-5 h-6 border-l border-dashed border-[#47bfa9]" />

          <!-- Step 3 -->
          <div class="flex items-center gap-4">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#47bfa9] bg-white shadow-[0_4px_14px_rgba(11,45,80,0.12)] shrink-0"
            >
              <span
                class="text-[18px] font-bold tracking-[0.27px] text-[#0b2d50]"
              >
                03
              </span>
            </div>
            <p class="text-[16px] font-semibold text-[#0b2d4f]">
              Review KPIs &amp; Trends
            </p>
          </div>
        </div>

        <!-- Get Started CTA -> mailto -->
        <div class="mt-8 sm:mt-10 flex justify-center">
          <a
            href="mailto:support@mailtrace.ai"
            class="inline-flex items-center gap-3 rounded-lg bg-[#47bfa9] px-7 sm:px-8 py-3 text-[16px] sm:text-[18px] font-semibold text-white shadow-md hover:bg-[#3fa592]"
          >
            Get Started
            <img
              :src="rightDown"
              alt=""
              class="h-[26px] sm:h-[30px] w-[26px] sm:w-[30px]"
            />
          </a>
        </div>
      </div>

      <!-- RIGHT COLUMN: hero image card -->
      <div
        class="w-full md:w-[48%] flex justify-center md:justify-end mb-4 md:mb-0"
      >
        <div
          class="relative w-full max-w-[802px] overflow-hidden rounded-[18px] bg-white shadow-[0_24px_70px_rgba(11,45,80,0.18)]"
        >
          <img
            :src="heroMockup"
            alt="MailTrace dashboard preview"
            class="block h-auto w-full"
          />
        </div>
      </div>
    </div>
  </section>
</template>
