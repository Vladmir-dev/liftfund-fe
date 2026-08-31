<template>
  <div class="flex flex-col gap-6 animate-fade-in text-left">
    <div class="border-b border-slate-150 pb-3 mb-2">
      <h2 class="text-2xl font-bold text-slate-900 mb-1">Transfers</h2>
      <span class="text-xs text-slate-500 font-bold tracking-wider uppercase">Start receiving funds</span>
    </div>

    <h3 class="text-base font-extrabold text-slate-900 mb-1">Whose account will the funds be transferred to?</h3>
    <p class="text-xs text-slate-400 mb-4 font-semibold leading-relaxed">
      The account holder must be 18 years or older with a valid ID. <a href="#" class="text-[#024731] underline font-bold hover:text-[#013424]">Learn more</a>
    </p>

    <!-- Action list items -->
    <div class="flex flex-col gap-3 mb-8">
      <div class="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between hover:bg-slate-50/50 cursor-pointer transition-all">
        <div class="text-xs">
          <h4 class="font-bold text-slate-800 mb-0.5">Your bank account</h4>
          <p class="text-slate-505 font-semibold">Verify your email, provide basic info, and link a bank account</p>
        </div>
        <iconify-icon icon="ph:caret-right-bold" class="text-slate-400 text-sm shrink-0"></iconify-icon>
      </div>

      <div class="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between hover:bg-slate-50/50 cursor-pointer transition-all">
        <div class="text-xs">
          <h4 class="font-bold text-slate-800 mb-0.5">A business bank account</h4>
          <p class="text-slate-505 font-semibold">Deposit into an account owned by a business or organization</p>
        </div>
        <iconify-icon icon="ph:caret-right-bold" class="text-slate-400 text-sm shrink-0"></iconify-icon>
      </div>

      <div class="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between hover:bg-slate-50/50 cursor-pointer transition-all">
        <div class="text-xs">
          <h4 class="font-bold text-slate-800 mb-0.5">Someone else's bank account</h4>
          <p class="text-slate-505 font-semibold">Send an email invite to a beneficiary to link their own bank account</p>
        </div>
        <iconify-icon icon="ph:caret-right-bold" class="text-slate-400 text-sm shrink-0"></iconify-icon>
      </div>
    </div>

    <!-- Video Tutorials section -->
    <div class="bg-slate-100/50 border border-slate-200/50 rounded-3xl p-6">
      <h4 class="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">How to set up bank transfers</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Left video card -->
        <div class="flex flex-col gap-3">
          <div class="aspect-video w-full rounded-2xl overflow-hidden bg-slate-200 relative flex items-center justify-center border border-slate-300">
            <img src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=300" class="absolute inset-0 w-full h-full object-cover opacity-60" />
            <button class="w-12 h-12 rounded-full bg-slate-900/80 hover:bg-slate-950 text-white flex items-center justify-center text-lg shadow-lg z-10 transition-all cursor-pointer focus:outline-none">
              <iconify-icon icon="ph:play-fill"></iconify-icon>
            </button>
          </div>
          <p class="text-xs font-bold text-slate-700 leading-snug">See how to set up transfers for your own bank account</p>
        </div>

        <!-- Right video card -->
        <div class="flex flex-col gap-3">
          <div class="aspect-video w-full rounded-2xl overflow-hidden bg-slate-200 relative flex items-center justify-center border border-slate-300">
            <img src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=300" class="absolute inset-0 w-full h-full object-cover opacity-60" />
            <button class="w-12 h-12 rounded-full bg-slate-900/80 hover:bg-slate-950 text-white flex items-center justify-center text-lg shadow-lg z-10 transition-all cursor-pointer focus:outline-none">
              <iconify-icon icon="ph:play-fill"></iconify-icon>
            </button>
          </div>
          <p class="text-xs font-bold text-slate-700 leading-snug">How to transfer funds</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}
</style>
