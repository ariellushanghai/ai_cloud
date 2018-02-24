<template lang="pug">
    el-container.login(:style='styleObj')
        el-main.login-main
            el-card(:body-style="{padding:'15px'}")
                el-form(:model='form_login', :rules="rules", ref='form_login', size='small', :disabled='isLoading')
                    el-form-item(label='用户名', prop='userName')
                        el-input(v-model='form_login.userName')
                    el-form-item(label='密码', prop='password')
                        el-input(v-model='form_login.password', type='password', auto-complete='off')
                    el-form-item.btn-grp
                        el-button(@click="submit('form_login')", type='primary') 登录
                        el-button(@click="resetForm('form_login')") 重置
</template>

<script>
  import API from '@/service/api'
  import icon_cloud from '@/assets/images/cloud_w.png'

  export default {
    name: 'Login',
    metaInfo: {
      titleTemplate: '%s-登录'
    },

    data: function () {
      return {
        icon_cloud,
        tmpl_form_login: {
          userName: '',
          password: ''
        },
        form_login: {
          userName: '',
          password: ''
        },
        rules: {
          userName: [
            {type: "string", required: true, message: '请输入用户名', trigger: 'blur'}
          ],
          password: [
            {type: "string", required: true, message: '请输入密码', trigger: 'blur'}
          ]
        },
        isLoading: false,
        styleObj: {
          'background-image': `url(${icon_cloud})`,
          'background-position': 'center',
          'background-color': '#87CEEB'
        }
      }
    },
    methods: {
      submit(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            console.log(`Koshe`);
            this.isLoading = true;
            return API.loginAICloud(this.form_login).then(res => {
              this.isLoading = false;
              this.$store.commit('SAVE_USER_INFO', res);
              return this.$router.push({name: 'project'})
            }, err => {
              this.isLoading = false;
              console.error(err);
              this.resetForm('form_login');
              this.$notify({
                message: `${err.message}`,
                type: 'error',
                duration: 2000
              });
            });
          } else {
            console.error('error submit!!');
            return false;
          }
        });

      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      }
    }
  }
</script>

<style lang="stylus" scoped>
    .login
        display flex
        align-items center
        justify-content center
        background-color white
        position fixed
        top 0
        bottom 0
        left 0
        right 0
        width 100%
        height 100%
        z-index 10000

    .login-main
        flex-grow 0
        flex-shrink 0
        padding 10px
        width 400px
        position relative
        overflow hidden
        z-index 10000

    .btn-grp
        display flex
        align-items center
        justify-content center

</style>
