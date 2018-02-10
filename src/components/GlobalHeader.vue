<template>
    <el-row type="flex" class="row">
        <el-col :sm="1" :md="1" :lg="2" :xl="2">
            <router-link :to="{path: '/'}" class="link col">
                <img src="../assets/images/logo.jpg" class="logo"/>
            </router-link>
        </el-col>
        <el-col :sm="3" :md="3" :lg="2" :xl="2" class="title">
            <span>AI Cloud</span>
        </el-col>
        <el-col :span="17">
            <el-menu mode="horizontal" background-color="#333644" text-color="#fff" active-text-color="#EA5505"
                     :default-active="defaultActive" router>
                <el-menu-item v-for="(menu, idx) in menuItems" :index="'/'+menu.route" :key="menu.name">{{menu.name}}
                </el-menu-item>
                <!--<el-menu-item index="/overview">概览</el-menu-item>-->
                <!--<el-menu-item index="/project">TensorFlow 模型训练</el-menu-item>-->
                <!--<el-menu-item index="/deployment">上线部署</el-menu-item>-->
                <!--<el-menu-item index="/solution">算法库</el-menu-item>-->
                <!--<el-menu-item index="/storage">数据存储</el-menu-item>-->
            </el-menu>
        </el-col>
        <el-col :span="3" class="col-user">
            <el-dropdown @command="handleCommand" placement="bottom">
                <el-button type="text" class="btn-user">
                    {{userName}}
                    <i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="logout">Logout</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </el-col>
    </el-row>
</template>

<script>
  import API from '@/service/api'

  export default {
    name: 'GlobalHeader',
    data() {
      return {}
    },
    computed: {
      defaultActive() {
        // if (/^\/workflows\//.exec(this.$route.path)) {
        //   return '/workflows/all'
        // }
        // if (/^\/workflowform\//.exec(this.$route.path)) {
        //   return '/workflowform/0'
        // }
        return this.$route.path;
      },
      menuItems() {
        return this.$store.getters.global_menu;
      },
      userName() {
        return this.$store.getters.user_name;
      }
    },
    mounted() {
      console.log(`GlobalHeader mounted()`);
      this.fetchData();
    },
    methods: {
      fetchData() {
        let cm_user_name = 'LUHUAN994';
        setTimeout(() => {
          API.loginAICloud(cm_user_name).then(res => {
            this.$store.commit('SAVE_USER_INFO', res);
          });
        }, 3000);
      },
      handleCommand(command) {
        this.$message('click on item ' + command);
      }
    }
  }
</script>

<style lang="stylus" scoped>
    header-height = 60px
    ping_an-orange = #EA5505

    .row
        height 100%
        background-color #333644
        color #fff

    .col
        height 100%
        background-color #35495e

    .link
        display flex
        justify-content space-around
        align-items center
        background-color ping_an-orange

    .logo
        display block
        flex-grow 0
        flex-shrink 0
        width 82px
        height auto
        max-height header-height

    .title
        justify-content center
        line-height header-height
        text-align center
        background-color ping_an-orange
        font-size 20px
        font-weight bold
        color #fff

    .col-user
        display flex
        align-items center
        justify-content center

    .btn-user
        color #fff

    .btn-user:hover
        color rgb(234, 85, 5)

</style>
