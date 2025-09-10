import { reactive, readonly } from 'vue'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'

const state = reactive({
  user: null,
  ready: false,
})

export function initAuthWatcher() {
  const auth = getAuth()
  onAuthStateChanged(auth, (u) => {
    state.user = u
    state.ready = true
  })
}

export function useAuthState() {
  return readonly(state)
}

export async function logout() {
  await signOut(getAuth())
}
