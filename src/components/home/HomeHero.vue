<script setup lang="ts">
import heroMockup from "@/assets/home/dashboard_sample_image.png";
import landingLogo from "@/assets/logo-landing-page-01.svg?url";

import ellipse1 from "@/assets/home/ellipse-1.svg?url";
import curve from "@/assets/home/curve.svg?url";
import rightDown from "@/assets/home/right-down.svg?url";
</script>

<template>
  <!-- Rectangle 3: bg #f6f5f9 -->
  <section class="bg-[#f6f5f9]">
    <!-- NAVBAR -->
    <header
      class="mx-auto flex w-full max-w-[1660px] 2xl:max-w-[1760px] items-center justify-between px-6 md:px-10 xl:px-16 2xl:px-20 pt-8 pb-10"
    >
      <!-- logo-02 2 -->
      <div class="flex items-center gap-2">
        <img
          :src="landingLogo"
          alt="MailTrace"
          class="h-[46px] w-auto md:h-14"
        />
      </div>

      <!-- top-right CTAs -->
      <div class="flex items-center gap-3">
        <!-- Disabled Sign Up/Login with tooltip -->
        <div class="relative group">
          <button
            type="button"
            class="rounded-lg bg-[#47bfa9] px-6 py-2 text-[20px] font-semibold text-white shadow-sm opacity-70 cursor-not-allowed"
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
          class="hidden rounded-lg bg-[#0b2d50] px-6 py-2 text-[20px] font-semibold text-white shadow-sm hover:bg-[#123b6a] md:inline-flex"
        >
          Book a Demo
        </a>
      </div>
    </header>

    <!-- HERO ROW -->
    <div
      class="mx-auto flex w-full max-w-[1660px] 2xl:max-w-[1760px] flex-col-reverse md:flex-row md:items-center md:justify-between gap-12 md:gap-16 px-6 md:px-10 xl:px-16 2xl:px-20 pb-24 pt-4"
    >
      <!-- LEFT COLUMN -->
      <div class="w-full md:w-[52%] max-w-[780px] text-center">
        <h1
          class="font-normal text-[#0b2d4f] tracking-[-0.04em] text-[40px] leading-11 sm:text-[56px] sm:leading-16 xl:text-[78px] xl:leading-[90px]"
        >
          QR Codes &amp; Promo Codes Miss 70–90% of Conversions
        </h1>

        <p
          class="mt-6 text-[16px] leading-[26px] font-semibold text-[#47bfa9] sm:text-[18px] sm:leading-7"
        >
          Our AI matches every job to the exact mailed address for 100% accurate
          ROI and rich analytical insight
        </p>

        <!-- 01 / 02 / 03 strip -->
        <div class="mt-10 flex flex-col items-center gap-5">
          <div class="flex items-center">
            <!-- 01 -->
            <div class="relative h-[45px] w-[45px]">
              <img :src="ellipse1" alt="" class="h-full w-full" />
              <span
                class="pointer-events-none absolute inset-0 flex items-center justify-center text-[20px] font-bold tracking-[0.27px] text-[#0b2d50]"
              >
                01
              </span>
            </div>

            <img :src="curve" alt="" class="h-[45px] w-auto" />

            <!-- 02 -->
            <div class="relative h-[45px] w-[45px]">
              <img :src="ellipse1" alt="" class="h-full w-full" />
              <span
                class="pointer-events-none absolute inset-0 flex items-center justify-center text-[20px] font-bold tracking-[0.27px] text-[#0b2d50]"
              >
                02
              </span>
            </div>

            <img :src="curve" alt="" class="h-[45px] w-auto" />

            <!-- 03 -->
            <div class="relative h-[45px] w-[45px]">
              <img :src="ellipse1" alt="" class="h-full w-full" />
              <span
                class="pointer-events-none absolute inset-0 flex items-center justify-center text-[20px] font-bold tracking-[0.27px] text-[#0b2d50]"
              >
                03
              </span>
            </div>
          </div>

          <div
            class="grid w-full max-w-[640px] grid-cols-1 sm:grid-cols-3 gap-2 text-[18px] font-semibold text-[#0b2d4f]"
          >
            <!-- Step 1 label with same tooltip -->
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

        <!-- Get Started CTA -> mailto -->
        <div class="mt-10 flex justify-center">
          <a
            href="mailto:support@mailtrace.ai"
            class="inline-flex items-center gap-3 rounded-lg bg-[#47bfa9] px-8 py-3 text-[18px] font-semibold text-white shadow-md hover:bg-[#3fa592]"
          >
            Get Started
            <img :src="rightDown" alt="" class="h-[30px] w-[30px]" />
          </a>
        </div>
      </div>

      <!-- RIGHT COLUMN: hero image card -->
      <div class="w-full md:w-[48%] flex justify-center md:justify-end">
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
