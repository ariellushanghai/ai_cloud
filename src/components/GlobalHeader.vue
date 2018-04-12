<template lang="pug">
    el-row.row(type='flex', :class='{invisiable: hide_self}')
        el-col(:sm='3', :md='3', :lg='2', :xl='2')
            router-link.link.col(:to="{path: '/'}")
                img.logo(:src='logo_file')
        |
        el-col.title(:sm='3', :md='3', :lg='2', :xl='2')
            span AI Cloud
        |
        el-col(:sm='15', :md='15', :lg='17', :xl='17')
            el-menu(mode='horizontal', background-color='#333644', text-color='#fff', active-text-color='#EA5505', :default-active='defaultActive', router='')
                el-menu-item(v-for='(menu, idx) in menuItems', :index="'/'+menu.route", :key='menu.name')
                    | {{menu.name}}
        |
        el-col.col-user(:span='3')
            el-dropdown(@command='handleCommand', placement='bottom')
                el-button.btn-user(type='text')
                    | {{userName}}
                    i.el-icon-arrow-down.el-icon--right
                |
                el-dropdown-menu(slot='dropdown')
                    el-dropdown-item(command='changePasswd') 修改密码
                    |
                    el-dropdown-item(command='logout') 退出
            |
            el-dialog(title='修改密码', :visible.sync='dialog_change_passwd_visible', width='30%', :append-to-body='true', :show-close='false', :close-on-click-modal='false', :close-on-press-escape='false')
                el-form(:model='form_change_passwd', :rules='rules', ref='form_change_passwd', :status-icon='true', label-position='top', size='small', :disabled='isSendingForm')
                    el-form-item(label='请输入现在的密码', prop='oldPassword')
                        el-input(v-model='form_change_passwd.oldPassword' type='password', auto-complete='off')
                    el-form-item(label='请输入新密码', prop='newPassword')
                        el-input(v-model='form_change_passwd.newPassword', type='password', auto-complete='off')
                    el-form-item(label='请重复输入新密码', prop='repeatNewPassword')
                        el-input(v-model='form_change_passwd.repeatNewPassword', type='password', auto-complete='off')

                .dialog-footer(slot='footer')
                    el-button(@click="cancelForm('form_change_passwd')") 取消
                    el-button(type='primary', @click="validateForm('form_change_passwd')", icon='el-icon-upload2', :loading='isSendingForm')
                        | 提交

</template>

<script>
    // @flow

    import {extend, isNil} from 'lodash'
    import API from '@/service/api'
    import logo_file from '@/assets/images/logo.jpg'

    export default {
        name: 'GlobalHeader',
        data() {
            const validateOldPassword = (rule, value, callback) => {
                if (isNil(value) || value === '') {
                    return callback(new Error('请输入现在的密码'))
                } else {
                    if (this.form_change_passwd.newPassword !== '') {
                        this.$refs.form_change_passwd.validateField('newPassword');
                    }
                    callback();
                }
            };
            const validateNewPassword = (rule, value, callback) => {
                if (isNil(value) || value === '') {
                    return callback(new Error('请输入新密码'));
                } else {
                    if (this.form_change_passwd.repeatNewPassword !== '') {
                        this.$refs.form_change_passwd.validateField('repeatNewPassword');
                    }
                    callback();
                }
            };

            const validateRepeatNewPassword = (rule, value, callback) => {
                if (isNil(value) || value === '') {
                    return callback(new Error('请重复输入新密码'));
                } else if (value !== this.form_change_passwd.newPassword) {
                    return callback(new Error('两次输入密码不一致!'));
                } else {
                    callback();
                }
            };
            return {
                logo_file,
                dialog_change_passwd_visible: false,
                isSendingForm: false,
                tmpl_form_change_passwd: {
                    oldPassword: '',
                    newPassword: '',
                    repeatNewPassword: ''
                },
                form_change_passwd: {
                    oldPassword: '',
                    newPassword: '',
                    repeatNewPassword: ''
                },
                rules: {
                    oldPassword: [
                        {validator: validateOldPassword, trigger: 'blur'}
                    ],
                    newPassword: [
                        {validator: validateNewPassword, trigger: 'blur'}
                    ],
                    repeatNewPassword: [
                        {validator: validateRepeatNewPassword, trigger: 'blur'}
                    ]
                }
            }
        },
        computed: {
            defaultActive() {
                if (/^\/project\//.exec(this.$route.path)) {
                    return '/project'
                }
                if (/^\/development\//.exec(this.$route.path)) {
                    return '/development'
                }
                return this.$route.path;
            },
            menuItems() {
                return this.$store.getters.global_menu;
            },
            userName() {
                return this.$store.getters.user_name;
            },
            hide_self() {
                return !this.$store.getters.visiable_global_header;
            }
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
                this.form_change_passwd = extend({}, this.tmpl_form_change_passwd);
                return this.dialog_change_passwd_visible = true;
            },
            cancelForm(formName: string) {
                console.log(`cancelForm(${formName})`);
                this.$refs[formName].resetFields();
                this.form_change_passwd = extend({}, this.tmpl_form_change_passwd);
                return this.dialog_change_passwd_visible = false;
            },
            validateForm(formName: string) {
                console.log('validateForm(formName): ', formName);

                this.$refs[formName].validate((valid) => {
                    console.log(`valid: `, valid);
                    if (valid) {
                        // alert('submit!');
                        return this.postForm(extend(this.form_change_passwd, {userName: this.userName}));
                    } else {
                        console.error('error submit!!');
                        return false;
                    }
                });
            },
            postForm(data) {
                console.log(`postForm(): `, data);
                this.isSendingForm = true;
                return API.changePasswd(data).then(res => {
                    this.$notify({
                        message: `修改密码成功`,
                        type: 'success',
                        duration: 1000
                    });
                    this.isSendingForm = false;
                    this.cancelForm('form_change_passwd');
                }, err => {
                    console.error(`err: `, err);
                    this.$notify({
                        message: `${err.message}`,
                        type: 'error',
                        duration: 0
                    });
                    this.isSendingForm = false;
                });
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

    .invisiable
        visibility hidden
        display none
        opacity 0

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
        user-select none

    .logo
        display block
        flex-grow 0
        flex-shrink 0
        width 82px
        height auto
        max-height header-height
        user-select none

    .title
        justify-content center
        line-height header-height
        text-align center
        background-color ping_an-orange
        font-size 20px
        font-family Verdana
        font-weight bold
        color #fff
        user-select none

    .col-user
        display flex
        align-items center
        justify-content center

    .btn-user
        color #fff

    .btn-user:hover
        color rgb(234, 85, 5)

</style>
