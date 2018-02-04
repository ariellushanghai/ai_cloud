<template>
  <div id="app">
    <el-container class="container">
      <el-header class="header">
        <global-header></global-header>
      </el-header>
      <el-container id="router_view">
          <router-view/>
      </el-container>
    </el-container>

  </div>
</template>

<script>

  import GlobalHeader from '@/components/GlobalHeader'

  export default {
    name: 'app',
    metaInfo: {
      title: 'AI☁️',
      titleTemplate: '%s-'
    },
    components: {
      GlobalHeader
    }
  }
</script>

<style scoped>
  #app {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
  }

  .header {
    padding: 0;
    position: absolute;
    width: 100%;
    height: 60px;
    left: 0;
    right: 0;
    top: 0;
  }

  .container {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }

  #router_view {
    width: 100%;
    height: calc(100% - 60px);
    position: absolute;
    left: 0;
    right: 0;
    top: 60px;
    bottom: 0;
  }
</style>
