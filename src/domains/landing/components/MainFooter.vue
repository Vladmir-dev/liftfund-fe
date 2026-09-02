<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const startFundraiser = () => {
  router.push('/start-fundraiser')
}
</script>

<template>
  <footer class="bg-slate-950 text-slate-400 py-16 border-t border-slate-900 text-left">
    <div class="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
      <div class="col-span-2">
        <div class="flex items-center gap-1.5 mb-4 text-white">
          <iconify-icon icon="lucide:sunrise" class="text-[#02a95c] text-2xl"></iconify-icon>
          <span class="text-lg font-black tracking-tight">helpfund</span>
        </div>
        <p class="text-xs leading-relaxed max-w-sm mb-4 text-slate-400">
          HelpFund is the world's trust leader in crowdfunding, connecting people who need help with kind hearts willing to give. Rebuilding communities, one dollar at a time.
        </p>
        <span class="text-xs text-slate-500 block">&copy; 2026 HelpFund. All rights reserved.</span>
      </div>

      <div>
        <h5 class="text-xs font-bold text-white uppercase tracking-widest mb-4">Fundraise</h5>
        <ul class="flex flex-col gap-2.5 text-xs font-semibold">
          <li><button @click="startFundraiser" class="text-slate-400 hover:text-[#02a95c] text-left cursor-pointer transition-colors">Medical Fundraiser</button></li>
          <li><button @click="startFundraiser" class="text-slate-400 hover:text-[#02a95c] text-left cursor-pointer transition-colors">Emergency Fundraiser</button></li>
          <li><button @click="startFundraiser" class="text-slate-400 hover:text-[#02a95c] text-left cursor-pointer transition-colors">Education Fundraiser</button></li>
          <li><button @click="startFundraiser" class="text-slate-400 hover:text-[#02a95c] text-left cursor-pointer transition-colors">Animal Fundraiser</button></li>
        </ul>
      </div>

      <div>
        <h5 class="text-xs font-bold text-white uppercase tracking-widest mb-4">Donate</h5>
        <ul class="flex flex-col gap-2.5 text-xs font-semibold">
          <li><RouterLink to="/donate/categories" class="text-slate-400 hover:text-[#02a95c] transition-colors">Browse Categories</RouterLink></li>
          <li><RouterLink to="/donate/crisis-relief" class="text-slate-400 hover:text-[#02a95c] transition-colors">Crisis Relief Funds</RouterLink></li>
          <li><RouterLink to="/donate/social-impact" class="text-slate-400 hover:text-[#02a95c] transition-colors">Social Impact Portfolios</RouterLink></li>
          <li><RouterLink to="/donate/supporter-space" class="text-slate-400 hover:text-[#02a95c] transition-colors">Supporter Resource Center</RouterLink></li>
        </ul>
      </div>

      <div>
        <h5 class="text-xs font-bold text-white uppercase tracking-widest mb-4">Company</h5>
        <ul class="flex flex-col gap-2.5 text-xs font-semibold">
          <li><RouterLink to="/donate/supporter-space" class="text-slate-400 hover:text-[#02a95c] transition-colors">About Us</RouterLink></li>
          <li><RouterLink to="/donate/supporter-space" class="text-slate-400 hover:text-[#02a95c] transition-colors">Careers</RouterLink></li>
          <li><RouterLink to="/donate/supporter-space" class="text-slate-400 hover:text-[#02a95c] transition-colors">Pricing & Fees</RouterLink></li>
          <li><RouterLink to="/donate/supporter-space" class="text-slate-400 hover:text-[#02a95c] transition-colors">Press Releases</RouterLink></li>
        </ul>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 border-t border-slate-900 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
      <div class="flex items-center gap-4 font-semibold">
        <a href="#" class="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
        <a href="#" class="text-slate-400 hover:text-white transition-colors">Terms of Service</a>
        <a href="#" class="text-slate-400 hover:text-white transition-colors">Legal Notice</a>
      </div>
      <div class="flex items-center gap-2 text-slate-500 font-medium">
        <svg class="text-emerald-500 w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
        <span>HIPAA Compliant | ISO 27001 Certified | Secure SSL Encrypted Payments</span>
      </div>
    </div>
  </footer>
</template>
