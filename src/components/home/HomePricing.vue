<script setup lang="ts">
import check from "@/assets/home/check-icon.svg?url";
import rightDown from "@/assets/home/right-down.svg?url";

type Feature = { icon: string; label: string };

const starterFeatures: Feature[] = [
  { icon: check, label: "Full Access to KPIs" },
  { icon: check, label: "ROI calculation" },
  { icon: check, label: "Job conversion rate" },
  { icon: check, label: "Top performing cities and zip codes" },
];

const enterpriseFeatures: Feature[] = [
  { icon: check, label: "Full Access to KPIs" },
  { icon: check, label: "ROI calculation" },
  { icon: check, label: "Job conversion rate" },
  { icon: check, label: "Top performing cities and zip codes" },
  { icon: check, label: "Dedicated account manager" },
  { icon: check, label: "Priority support" },
  { icon: check, label: "And much more..." },
];
</script>

<template>
  <section class="bg-white py-16 sm:py-24 lg:py-28">
    <div
      class="mx-auto flex w-full max-w-[1660px] 2xl:max-w-[1760px] flex-col lg:flex-row items-center gap-10 lg:gap-20 px-4 sm:px-6 md:px-10 xl:px-16 2xl:px-20"
    >
      <!-- LEFT: heading & copy -->
      <div class="flex-1 justify-center text-center lg:text-left">
        <!-- PLANS & PRICING pill -->
        <span
          class="inline-flex items-center rounded-full bg-[#d6f4ec] px-4 py-1 text-[12px] sm:text-[13px] font-semibold text-[#0b2d4f]"
        >
          PLANS &amp; PRICING
        </span>

        <h2
          class="mt-6 sm:mt-8 font-normal text-[#0b2d4f] tracking-[-0.04em] text-[34px] leading-10 sm:text-[48px] sm:leading-[54px] md:text-[64px] md:leading-[72px] xl:text-[70px] xl:leading-20"
        >
          Flexible Plans for
          <br />
          Teams of Every Size
        </h2>

        <p
          class="mt-6 sm:mt-8 mx-auto lg:mx-0 max-w-[520px] text-[16px] sm:text-[20px] leading-[22px] sm:leading-[24.4px] text-black"
        >
          Simple, transparent pricing. Scale only when you need to.
        </p>
      </div>

      <!-- RIGHT: pricing cards + bottom note -->
      <div class="flex flex-1 justify-center lg:justify-end">
        <!-- wrapper so note centers under cards -->
        <div class="flex flex-col items-center">
          <!-- cards row -->
          <div
            class="flex flex-col sm:flex-row gap-6 sm:gap-8 w-full justify-center"
          >
            <!-- Starter -->
            <article
              class="flex w-full max-w-[392px] flex-col rounded-[14px] border border-[#24b39b] bg-white px-6 sm:px-10 pt-8 sm:pt-10 pb-8 shadow-[0_20px_60px_rgba(11,45,80,0.10)]"
            >
              <div>
                <h3
                  class="text-[18px] sm:text-[20px] font-bold tracking-[0.02em] text-[#0b2d4f] uppercase"
                >
                  Starter
                </h3>

                <div class="mt-4 h-px w-full bg-black/10" />

                <div class="mt-6 flex items-baseline gap-3">
                  <span
                    class="text-[48px] leading-[54px] sm:text-[64px] sm:leading-[72px] xl:text-[70px] xl:leading-20 font-medium tracking-[-0.04em] text-[#0b2d4f]"
                  >
                    $49
                  </span>
                  <span
                    class="text-[16px] sm:text-[18px] font-bold text-[#24b39b]"
                  >
                    / Month
                  </span>
                </div>

                <div class="mt-4 h-px w-full bg-black/10" />
              </div>

              <ul
                class="mt-6 sm:mt-8 text-[16px] sm:text-[20px] leading-10 text-black"
              >
                <li
                  v-for="feature in starterFeatures"
                  :key="feature.label"
                  class="flex items-start gap-3"
                >
                  <img
                    :src="feature.icon"
                    alt=""
                    class="mt-3 sm:mt-3 h-[15px] w-[15px] shrink-0"
                  />
                  <span>{{ feature.label }}</span>
                </li>
              </ul>

              <div class="mt-auto">
                <div class="mt-6 h-px w-full bg-black/10" />
                <p class="mt-3 text-[16px] sm:text-[18px] text-black/80">
                  $0.08 per mailer
                </p>

                <!-- Get Started -> mailto -->
                <a
                  href="mailto:support@mailtrace.ai"
                  class="mt-5 sm:mt-6 inline-flex w-full items-center justify-center gap-3 rounded-md bg-[#24b39b] px-6 py-3 text-[16px] sm:text-[18px] font-semibold text-white hover:bg-[#1f9e86]"
                >
                  Get Started
                  <img
                    :src="rightDown"
                    alt=""
                    class="h-6 sm:h-[30px] w-6 sm:w-[30px]"
                  />
                </a>
              </div>
            </article>

            <!-- Enterprise -->
            <article
              class="flex w-full max-w-[392px] flex-col rounded-[14px] border border-[#24b39b] bg-white px-6 sm:px-10 pt-8 sm:pt-10 pb-8 shadow-[0_20px_60px_rgba(11,45,80,0.10)]"
            >
              <div>
                <h3
                  class="text-[20px] sm:text-[20px] font-bold tracking-[0.02em] text-[#0b2d4f] uppercase"
                >
                  Enterprise
                </h3>

                <div class="mt-4 h-px w-full bg-black/10" />

                <div class="mt-18 flex items-baseline gap-3">
                  <span
                    class="text-[26px] sm:text-[26px] leading-7 sm:leading-8 font-semibold tracking-[-0.02em] text-[#0b2d4f]"
                  >
                    Tailored
                  </span>
                  <!-- <span
                    class="text-[18px] sm:text-[18px] font-bold text-[#24b39b]"
                  >
                    / Custom
                  </span> -->
                </div>
                <div class="mt-4 h-px w-full bg-black/10" />
              </div>

              <ul
                class="mt-8 sm:mt-8 text-[16px] sm:text-[20px] leading-10 text-black"
              >
                <li
                  v-for="feature in enterpriseFeatures"
                  :key="feature.label"
                  class="flex items-start gap-3"
                >
                  <img
                    :src="feature.icon"
                    alt=""
                    class="mt-3 sm:mt-3 h-[15px] w-[15px] shrink-0"
                  />
                  <span>{{ feature.label }}</span>
                </li>
              </ul>

              <div class="mt-auto">
                <div class="mt-6 h-px w-full bg-black/10" />
                <p class="mt-3 text-[18px] sm:text-[18px] text-black/80">
                  Custom pricing
                </p>

                <!-- Contact Sales -> mailto -->
                <a
                  href="mailto:support@mailtrace.ai"
                  class="mt-5 sm:mt-6 inline-flex w-full items-center justify-center gap-3 rounded-md bg-[#0b2d50] px-6 py-3 text-[16px] sm:text-[18px] font-semibold text-white hover:bg-[#123b6a]"
                >
                  Contact Sales
                  <img
                    :src="rightDown"
                    alt=""
                    class="h-6 sm:h-[30px] w-6 sm:w-[30px]"
                  />
                </a>
              </div>
            </article>
          </div>

          <!-- bottom note centered under the cards -->
          <p
            class="mt-8 sm:mt-10 text-center text-[14px] sm:text-[18px] leading-5 sm:leading-[22px] text-[#24b39b]"
          >
            No hidden fees. Upgrade anytime.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
