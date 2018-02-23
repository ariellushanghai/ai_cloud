<template>
    <el-row type="flex" class="row">
        <el-col :sm="3" :md="3" :lg="2" :xl="2">
            <router-link :to="{path: '/'}" class="link col">
                <img :src="logo_file" class="logo"/>
            </router-link>
        </el-col>
        <el-col :sm="3" :md="3" :lg="2" :xl="2" class="title">
            <span>AI Cloud</span>
        </el-col>
        <el-col :sm="15" :md="15" :lg="17" :xl="17">
            <el-menu mode="horizontal" background-color="#333644" text-color="#fff" active-text-color="#EA5505"
                     :default-active="defaultActive" router>
                <el-menu-item v-for="(menu, idx) in menuItems" :index="'/'+menu.route" :key="menu.name">
                    {{menu.name}}
                </el-menu-item>
            </el-menu>
        </el-col>
        <el-col :span="3" class="col-user">
            <el-dropdown @command="handleCommand" placement="bottom">
                <el-button type="text" class="btn-user">
                    {{userName}}
                    <i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="changePasswd">修改密码</el-dropdown-item>
                    <el-dropdown-item command="logout">退出</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </el-col>
    </el-row>
</template>

<script>
  import API from '@/service/api'
  import logo_file from '@/assets/images/logo.jpg'

  export default {
    name: 'GlobalHeader',
    data() {
      return {
        logo_file,
        tmpl_form_change_passwd: {
          userName: '',
          oldPassword: '',
          newPassword: ''
        },
        form_change_passwd: {
          userName: '',
          oldPassword: '',
          newPassword: ''
        },
        rules: {
          userName: [
            {type: "string", required: true, message: '请输入用户名', trigger: 'blur'}
          ],
          oldPassword: [
            {type: "string", required: true, message: '请输入密码', trigger: 'blur'}
          ],
          newPassword: [
            {type: "string", required: true, message: '两次密码输入不一致', trigger: 'blur'}
          ]
        }
      }
    },
    computed: {
      defaultActive() {
        if (/^\/project\//.exec(this.$route.path)) {
          return '/project'
        }
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
    },
    methods: {
      logoutAICloud() {
        return API.logoutAICloud().then(res => {
          console.log(`logout success!!`);
          this.$store.commit('LOGOUT');
          return this.$router.replace({name: 'login'})
        });
      },
      showForm() {

        this.$message(`成功修改密码`);
      },
      handleCommand(command) {
        if (command === 'logout') {
          return this.logoutAICloud();
        }
        if (command === 'changePasswd') {
          return this.showForm();
        }

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
