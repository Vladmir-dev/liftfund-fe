import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(localStorage.getItem('helpfund_isLoggedIn') === 'true')
  
  const user = ref({
    name: localStorage.getItem('helpfund_userName') || 'John Doe',
    email: localStorage.getItem('helpfund_userEmail') || 'john.doe@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300'
  })

  function login(emailInput: string, nameInput: string = 'John Doe') {
    isLoggedIn.value = true
    user.value = {
      name: nameInput,
      email: emailInput,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300'
    }
    localStorage.setItem('helpfund_isLoggedIn', 'true')
    localStorage.setItem('helpfund_userName', nameInput)
    localStorage.setItem('helpfund_userEmail', emailInput)
  }

  function logout() {
    isLoggedIn.value = false
    user.value = { name: '', email: '', avatar: '' }
    localStorage.removeItem('helpfund_isLoggedIn')
    localStorage.removeItem('helpfund_userName')
    localStorage.removeItem('helpfund_userEmail')
  }

  return { isLoggedIn, user, login, logout }
})
