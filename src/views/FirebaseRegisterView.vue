<template>
  <h1>Create an Account</h1>
  <p><input type="text" placeholder="Email" v-model="email" /></p>
  <p><input type="password" placeholder="Password" v-model="password" /></p>
  <p><button @click="register">Save to Firebase</button></p>
</template>

<script setup>
import { ref } from "vue"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { useRouter } from "vue-router"

// define reactive variables for email and password
const email = ref("")
const password = ref("")

// get router instance
const router = useRouter()

// get firebase auth instance
const auth = getAuth()

// register function
const register = () => {
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then((data) => {
      console.log("Firebase Register Successful!")
      // register success, redirect to login page
      router.push("/FireLogin")
    })
    .catch((error) => {
      console.log(error.code) // output error code
    })
}
</script>