<template>
  <el-menu
    router
    class="left-menu"
    unique-opened
    @select="handleSelectMenu"
    :default-active="defaultActive"
    background-color="#333644"
    text-color="#fff"
    active-text-color="#EA5505">

    <el-submenu v-for="item in data" :index="String(item.name)" :key="item.name">
      <template slot="title">
        <i class="el-icon-tickets"></i>
        <span>{{item.label}}</span>
      </template>
      <el-tooltip v-for="wf in item.children" :key="wf.label" effect="dark" :content="wf.label" placement="right">
        <el-menu-item :index="String('/workflows/'+wf.label)" :key="wf.label" :route="wf.route">
          <span slot="title">{{wf.label}}</span>
        </el-menu-item>
      </el-tooltip>
    </el-submenu>
  </el-menu>
</template>

<script>
  import API from '@/service/api'

  export default {
    name: "WorkFlowLeftMenu",
    props: ['data'],
    data() {
      return {};
    },
    computed: {
      defaultActive() {
        return this.$route.path;
      }
    },
    mounted() {
      // console.log('WorkFlowLeftMenu  mounted(): ',this.$route);
    },
    methods: {
      fetchData(rootJobId) {
        return API.getLayers(rootJobId);
      },
      handleSelectMenu(key, keyPath) {
        console.log('handleSelectMenu(', key, keyPath, ')');
        let group_name = keyPath[0];
        let workflow_name = keyPath[1].replace(/^\/workflows\//, '');
        let wf = _.find(this.$store.state.all[group_name].workflows, {name: workflow_name});
        console.log(wf);
        console.log(workflow_name);
        if (wf) {
          this.fetchData(wf.rootJobId).then(res => {
            this.$store.commit('SET_ROOTJOB_LAYERS', {
              'group': group_name,
              'workflow': workflow_name,
              'layers': res
            });
            this.$store.commit('SET_SELECTED_WORKFLOW', {
              'group': group_name,
              'workflow': workflow_name
            });
          });
        }
      }
    }
  }
</script>

<style scoped>
  .left-menu .el-submenu .el-menu-item {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .left-menu .el-menu-item {
    font-size: 12px;
  }
</style>
