<script setup>
import { RouterLink, RouterView } from 'vue-router'
import './assets/styles.css'
</script>

<template>
  <header></header>



  <nav class="header-nav">
    <img src="..\src\assets\Group 622.png" alt="HDP_logo" />
    <ul>
      <li>
        <RouterLink to="/">Main Menü</RouterLink>
      </li>
      <li>
        <RouterLink to="/Configuration"> Lables</RouterLink>
      </li>
      <li>
        <RouterLink to="/Try_Skill">Try Skill</RouterLink>
      </li>
      <!--<li><RouterLink to="/form">form form</RouterLink></li>-->
    </ul>
  </nav>

  <RouterView />
</template>

<style scoped></style>
