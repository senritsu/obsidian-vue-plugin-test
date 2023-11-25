<script setup lang="ts"></script>

<template>
  <h1>Vue Test View</h1>
  <div class="test">
    <span>🤔</span>
    <span>💡</span>
    <span>⚡</span>
    <span>👌</span>
  </div>
</template>

<style scoped>
.test {
  display: grid;
  grid-template: 1fr 1fr / 1fr 1fr;
  place-items: center;
}

.test span {
  padding: 1em;
  font-size: 2em;
}
</style>
