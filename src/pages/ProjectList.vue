<template lang="pug">
    el-container.project-list
        el-main.project-list-main
            el-dialog(title='新增项目', :visible.sync='dialog_add_proj_visible', width='40%', append-to-body='', center='', :show-close='false', :close-on-click-modal='false', :close-on-press-escape='false')
                el-form(:model='form_add_proj', :rules='rules', ref='form_add_proj', size='small', :disabled='isSendingForm')
                    el-form-item(label='项目名称', prop='proName')
                        el-input(v-model.trim='form_add_proj.proName', auto-complete='off')
                    el-form-item.input-dir(label='工作目录')
                        el-input(v-model.trim='form_add_proj.proName', disabled='')
                            |
                            template(slot="prepend") {{prepend}}

                .dialog-footer(slot='footer')
                    el-button(@click="cancelForm('form_add_proj')") 取消
                    el-button(type='primary', @click="validateForm('form_add_proj')", icon='el-icon-upload2', :loading='isSendingForm')
                        | 提交


            el-card.card.operations(:body-style="{padding:'15px'}", style='margin-bottom: 10px;')
                .button-group
                    el-button(size='small', type='primary', icon='el-icon-circle-plus', style='margin-right: 10px;', @click='showForm')
                        | 新增项目
                    el-input(placeholder='过滤项目名', suffix-icon='el-icon-search', size='small', clearable='', v-model='input_proj_filter')
            el-row.loading-target(type='flex', :style="{height: proj_container_height + 'px','overflow': 'hidden','margin-bottom': '10px'}")
                el-col.empty-list-container(v-if='proj_list.length === 0', :span='24')
                    .tip 暂无项目
                el-col(v-if='proj_list.length !== 0', :span='24', :style="{'overflow-y': 'auto','overflow-x': 'hidden'}")
                    el-row.proj-container(type='flex', :gutter='10')
                        el-col(v-for='proj in proj_list', :xs='12', :sm='8', :md='8', :lg='6', :xl='4', :key='proj.proId', :style="{height: 'auto','margin-bottom': '10px'}")
                            el-card.proj-card(:body-style="{padding:'15px'}")
                                .card-header(slot='header')
                                    span {{proj.proName}}
                                div(style='font-size: 13px;line-height: 30px;user-select: none;')
                                    p 创建时间： {{proj.createDate_converted}}
                                .button-group
                                    el-button(size='mini', plain='', icon='el-icon-back', style='color: #303133;', @click='handleGoToProj(proj)')
                                        | 训练列表
                                    <!--el-button(size='mini', type='primary', icon='el-icon-edit', @click='handleEditProj(proj)')-->
                                    <!--| 编辑-->
                                    el-button(size='mini', type='danger', icon='el-icon-delete', @click='handleDeleteProj(proj)')
                                        | 删除

</template>

<script>
  import API from '@/service/api'
  import router from '@/router'
  import {map, extend, assign, debounce, sortBy} from 'lodash'
  import format from 'date-fns/format'
  import ElCard from "element-ui/packages/card/src/main";

  const zh_cn = require('date-fns/locale/zh-CN');

  export default {
    name: 'ProjectList',
    metaInfo: {
      titleTemplate: '%s-模型训练'
    },
    data: function () {
      return {
        isLoading: false,
        dialog_add_proj_visible: false,
        isSendingForm: false,
        tmpl_form_add_proj: {
          proName: ''
        },
        form_add_proj: {
          proName: ''
        },
        rules: {
          proName: [
            {type: "string", required: true, message: '请输入项目名', trigger: 'blur'},
            {min: 3, message: '长度在3个字符以上', trigger: 'blur'}
          ]
        },
        projects_data: [],
        input_proj_filter: '',
        proj_container_height: this.resizeHandler()
      }
    },
    computed: {
      proj_list() {
        // console.log(this.filters)
        return sortBy(map(this.projects_data, (v) => {
          return assign(v, {
            createDate_converted: format(
              new Date(v.createDate),
              'YYYY[年]MMMD[日]Ah[点]mm[分]',
              {locale: zh_cn}
            )
          })
        }), ['createDate']).filter((proj) => proj.proName.toLowerCase().includes(String(this.input_proj_filter).toLowerCase()))
      },
      userName() {
        return this.$store.getters.user_name
      },
      prepend() {
        return `${this.$store.state.user.parentDir}/train/`;
      }
    },

    mounted: function () {
      console.log('ProjectList mounted()');
      this.fetchData();
      this.proj_container_height = this.resizeHandler();
      window.onresize = debounce(() => {
        this.proj_container_height = this.resizeHandler();
      }, 300);
    },
    beforeDestroy: function () {
      window.onresize = undefined;
    },
    methods: {
      fetchData() {
        console.log(this.userName)
        let loading = this.$loading({
          target: '.loading-target',
          lock: true,
          text: '正在获取数据。。。',
          background: 'rgba(250,235,215,0.5)'
        });

        return API.getProjects(this.userName).then(res => {
          this.projects_data = res;
          this.$store.commit('SET_PROJECTS_LIST', this.projects_data);
          loading.close();
        }, err => {
          console.log(`err: `, err);
          loading.close();
          this.$notify({
            message: `${err}`,
            type: 'error',
            duration: 0
          });
        });
      },
      showForm() {
        console.log(`showForm()`);
        this.form_add_proj = extend({}, this.tmpl_form_add_proj);
        this.dialog_add_proj_visible = true;
      },
      cancelForm(formName: string) {
        console.log(`cancelForm(${formName})`);
        this.$refs[formName].resetFields();
        this.form_add_proj = extend({}, this.tmpl_form_add_proj);
        return this.dialog_add_proj_visible = false;
      },
      validateForm(formName: string) {
        console.log('validateForm(formName): ', formName);
        this.$refs[formName].validate((valid) => {
          console.log(`valid: `, valid);
          if (valid) {
            // alert('submit!');
            return this.postForm(extend(this.form_add_proj, {
              userName: this.userName,
              dirPath: `${this.prepend}${this.form_add_proj.proName}`,
              type: '00'
            }));
          } else {
            console.error('error submit!!');
            return false;
          }
        });
      },
      postForm(data) {
        console.log(`postForm(): `, data);
        this.isSendingForm = true;
        return API.addProject(data).then(res => {
          this.fetchData();
          this.$notify({
            message: `新增项目成功`,
            type: 'success',
            duration: 1000
          });
          this.isSendingForm = false;
          this.cancelForm('form_add_proj');
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
      handleGoToProj(proj) {
        console.log(`handleGoToProj()`, proj);
        return router.push({name: 'project_details', params: {name: proj.proName}})
      },
      // handleEditProj(proj) {
      //
      // },
      handleDeleteProj(proj) {
        console.log(`handleDeleteProj()`, proj);
        this.$confirm(`<p>您确定删除<strong>${proj.proName}</strong></p>`, '提示', {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          return API.delProject(proj.proId).then(res => {
            this.fetchData();
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
          }, err => {
            console.error(`err: `, err);
            this.$notify({
              message: `${err.message}`,
              type: 'error',
              duration: 0
            });
          });

        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      resizeHandler() {
        return document.querySelector('#router_view').getBoundingClientRect().height - (20 + 64 + 10);
      }
    },
    components: {ElCard}
  }

</script>

<style lang="stylus" scoped>
    .project-list
        background-color antiquewhite
        width 100%
        height 100%
        position relative

    .project-list-main
        padding 10px
        width 100%
        height 100%
        position relative
        overflow hidden

    .card.operations .el-input
        width 200px

    .proj-container
        flex-wrap wrap

    .proj-card
        will-change transform
        height 100%
        margin-bottom 10px
        background-color #fff
        border none
        transition transform .2s ease-in-out

    .proj-card:hover
        transform scale(1.05)

    .proj-card /deep/ .el-card__header
        background #fafafa
        padding 10px 20px

    .card-header
        line-height 20px
        font-size 16px
        overflow hidden
        text-overflow ellipsis

    .proj-card /deep/ .el-card__body
        height calc(100% - 41px)
        display flex
        flex-direction column
        justify-content space-between

    .button-group
        display flex
        justify-content space-between

    .proj-card .button-group
        justify-content flex-end

    .empty-list-container
        display flex
        overflow hidden
        height 100%
        justify-content center
        align-items center

    .input-dir
        font-family monospace
        /deep/ .el-input.is-disabled .el-input__inner
            font-family monospace
</style>