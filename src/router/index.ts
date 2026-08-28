import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('../domains/landing/views/LandingPage.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../domains/auth/views/LoginView.vue'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../domains/auth/views/SignupJourneyView.vue'),
    },
    {
      path: '/campaign/:id',
      name: 'campaign-detail',
      component: () => import('../domains/donate/views/CampaignDetailView.vue'),
    },
    {
      path: '/campaign/:id/dashboard',
      name: 'campaign-dashboard',
      component: () => import('../domains/donate/views/CampaignDashboardView.vue'),
    },
    {
      path: '/donate/categories',
      name: 'donate-categories',
      component: () => import('../domains/donate/views/DonateCategories.vue'),
    },
    {
      path: '/donate/crisis-relief',
      name: 'crisis-relief',
      component: () => import('../domains/donate/views/CrisisRelief.vue'),
    },
    {
      path: '/donate/social-impact',
      name: 'social-impact',
      component: () => import('../domains/donate/views/SocialImpactFunds.vue'),
    },
    {
      path: '/donate/supporter-space',
      name: 'supporter-space',
      component: () => import('../domains/donate/views/SupporterSpace.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../domains/auth/views/ProfileView.vue'),
    },
    {
      path: '/my-fundraisers',
      name: 'my-fundraisers',
      component: () => import('../domains/auth/views/MyFundraisersView.vue'),
    },
    {
      path: '/your-impact',
      name: 'your-impact',
      component: () => import('../domains/auth/views/YourImpactView.vue'),
    },
    {
      path: '/messages',
      name: 'messages',
      component: () => import('../domains/auth/views/MessagesView.vue'),
    },
    {
      path: '/account-settings',
      name: 'account-settings',
      component: () => import('../domains/auth/views/AccountSettingsView.vue'),
    },
  ],
})

export default router
