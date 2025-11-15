<script setup lang="ts">
import landingLogo from "@/assets/logo-landing-page-01.svg?url";
import linkedinIcon from "@/assets/home/linkedin-icon.svg?url";
</script>

<template>
  <footer class="bg-white">
    <!-- top content row -->
    <div
      class="mx-auto flex w-full max-w-[1660px] 2xl:max-w-[1760px] items-start justify-between gap-16 px-6 md:px-10 xl:px-16 2xl:px-20 pt-14 pb-10"
    >
      <!-- logo -->
      <div class="shrink-0 pr-10 lg:pr-16">
        <img :src="landingLogo" alt="MailTrace" class="h-12 w-auto md:h-12" />
      </div>

      <!-- middle nav columns -->
      <div
        class="flex flex-1 justify-start gap-24 pl-4 md:pl-10 text-[18px] leading-10 tracking-[-0.04em] text-black"
      >
        <!-- left column -->
        <div class="flex flex-col space-y-1">
          <a
            href="#about"
            class="inline-block pb-0.5 border-b-2 border-transparent hover:border-[#47bfa9] transition-colors"
          >
            About
          </a>
          <a
            href="#pricing"
            class="inline-block pb-0.5 border-b-2 border-transparent hover:border-[#47bfa9] transition-colors"
          >
            Pricing
          </a>
          <a
            href="#faq"
            class="inline-block pb-0.5 border-b-2 border-transparent hover:border-[#47bfa9] transition-colors"
          >
            FAQ
          </a>
          <a
            href="#demo"
            class="inline-block pb-0.5 border-b-2 border-transparent hover:border-[#47bfa9] transition-colors"
          >
            Get a Demo
          </a>
          <a
            href="#contact"
            class="inline-block pb-0.5 border-b-2 border-transparent hover:border-[#47bfa9] transition-colors"
          >
            Contact
          </a>
        </div>

        <!-- right column -->
        <div class="flex flex-col space-y-1">
          <a
            href="#careers"
            class="inline-block pb-0.5 border-b-2 border-transparent hover:border-[#47bfa9] transition-colors"
          >
            Careers
          </a>
          <a
            href="#products"
            class="inline-block pb-0.5 border-b-2 border-transparent hover:border-[#47bfa9] transition-colors"
          >
            Products
          </a>
          <a
            href="#blog"
            class="inline-block pb-0.5 border-b-2 border-transparent hover:border-[#47bfa9] transition-colors"
          >
            Blog
          </a>
          <a
            href="#testimonials"
            class="inline-block pb-0.5 border-b-2 border-transparent hover:border-[#47bfa9] transition-colors"
          >
            Testimonials
          </a>
          <a
            href="#support"
            class="inline-block pb-0.5 border-b-2 border-transparent hover:border-[#47bfa9] transition-colors"
          >
            Support
          </a>
        </div>
      </div>

      <!-- right contact block -->
      <div class="flex flex-col items-end gap-6 shrink-0">
        <a href="mailto:support@mailtrace.com" class="text-[18px] text-black">
          support@mailtrace.com
        </a>

        <a
          href="https://www.linkedin.com/company/mailtrace/"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="MailTrace on LinkedIn"
        >
          <img :src="linkedinIcon" alt="" class="h-[26px] w-[26px]" />
        </a>
      </div>
    </div>

    <!-- copyright -->
    <div class="pb-6">
      <p
        class="mx-auto max-w-[1660px] 2xl:max-w-[1760px] px-6 md:px-10 xl:px-16 2xl:px-20 text-right text-[16px] md:text-[18px] text-black"
      >
        © 2025 MailTrace Inc. All rights reserved
      </p>
    </div>

    <!-- bottom dark bar -->
    <div class="h-20 w-full bg-[#0b2d50]" />
  </footer>
</template>
