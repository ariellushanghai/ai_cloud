<template lang="pug">
    el-container.ProjectDetails(v-loading='isLoading')
        el-main.project-details-main
            el-dialog.dialog-build-image(:visible.sync='dialog_add_training_visible', width='50%', append-to-body='', modal-append-to-body='', lock-scroll='', :show-close='false', :close-on-click-modal='false', :close-on-press-escape='false')
                div(slot='title')
                    el-steps(:active='at_step_add_training', simple='', finish-status='success')
                        el-step(title='构建镜像', icon='el-icon-edit')
                        el-step(title='部署镜像', icon='el-icon-upload')
                .form-container
                    el-form(v-show='at_step_add_training === 0', :model='form_build_image', :rules='rules_build_image', ref='form_build_image', status-icon='', label-position='top', size='small')
                        el-form-item(label='选择镜像', prop='image.imageName')
                            el-select(v-model='form_build_image.image.imageName', placeholder='请选择镜像', style='width: 100%;')
                                el-option(v-for='image in list_images', :label='image.imageName', :key='image.imageId', :value='image.imageName')
                        el-form-item(label='上传代码')
                            el-upload(:action='upload_to_url', multiple='')
                                el-button(type='primary', icon='el-icon-upload') 上传代码
                    el-form(v-show='at_step_add_training === 1', :model='form_build_image', :rules='rules_build_image', ref='form_build_image', status-icon='', label-position='top', size='small')
                        el-form-item(label='选择镜像', prop='image')
                            el-select(v-model='form_build_image.image', placeholder='请选择镜像', style='width: 100%;')
                                el-option(v-for='image in list_images', :label='image.imageName', :key='image.imageId', :value='image')
                        el-form-item(label='上传代码')
                            el-upload(action='https://jsonplaceholder.typicode.com/posts/', multiple='')
                                el-button(type='primary', icon='el-icon-upload') 上传代码
                .dialog-footer(slot='footer')
                    el-button(@click="cancelForm('form_build_image')", size='small') 取消
                    el-button(type='primary', @click="validateForm('form_build_image')", :loading='isSendingForm', icon='el-icon-check', size='small')
                        | 下一步
                el-form(:model='form_build_image', :rules='rules_build_image', ref='form_build_image', status-icon='', label-position='top', size='small')
                    el-form-item(label='训练名', prop='image')
                        // <el-input v-model="form_build_image.image"></el-input>
                        el-select(v-model='form_build_image.image', placeholder='请选择镜像', style='width: 100%;')
                            el-option(v-for='image in list_images', :label='image.imageName', :key='image.imageId', :value='image')
                    el-form-item(label='上传代码')
                        el-upload(action='https://jsonplaceholder.typicode.com/posts/', multiple='')
                            el-button(size='small', type='primary', icon='el-icon-upload') 上传代码
                .dialog-footer(slot='footer')
                    el-button(@click="cancelForm('form_build_image')") 取消
                    el-button(type='primary', @click="validateForm('form_build_image')", icon='el-icon-upload2', :loading='isSendingForm')
                        | 提交
            el-row(type='flex', style='overflow: hidden;')
                el-col.menu-wrapper(:sm='6', :md='6', :lg='4', :xl='3')
                    project-menu(:data='project_menu_data')
                el-col(:sm='18', :md='18', :lg='20', :xl='21')
                    el-card.card.operations(:body-style="{padding:'15px',display: 'flex','justify-content': 'space-between'}")
                        .button-group
                            el-button(size='small', type='primary', icon='el-icon-circle-plus-outline', style='margin-right: 10px;', @click='handleAddTrain')
                                | 新增训练
                        el-input(placeholder='过滤训练名', suffix-icon='el-icon-search', size='small', clearable='', v-model='input_trainings_filter')
                    el-card.card(:body-style="{padding:'15px'}")
                        el-table.training-table(:data='tableTrainings', :height='table_height', stripe='', fit='', border='')
                            el-table-column(type='expand')
                                template(slot-scope='props')
                                    el-form.table-expand(label-position='left', inline='', size='small')
                                        el-form-item(label='ID: ')
                                            span {{ props.row.trainId }}
                                        el-form-item(label='基础镜像名: ')
                                            span {{ props.row.imageName }}
                                        el-form-item(label='代码库URL: ')
                                            el-input(placeholder='请输入内容', v-model='props.row.codeURL', :id="'input_codeURL_'+ props.row.trainId", readonly='')
                                                el-tooltip.item(slot='append', effect='dark', content='点击复制到剪贴板', placement='bottom', :hide-after='1000')
                                                    el-button(type='primary', :class="'btn-copy-codeURL-' + props.row.trainId", @click="copyToClipBoard(props.row,'codeURL')")
                                                        img.icon_clippy(:src='icon_clippy')
                                        el-form-item(label='分布式存储路径: ')
                                            el-input(placeholder='请输入内容', v-model='props.row.workdir', :id="'input_workdir_'+ props.row.trainId", readonly='')
                                                el-tooltip.item(slot='append', effect='dark', content='点击复制到剪贴板', placement='bottom', :hide-after='1000')
                                                    el-button(type='primary', :class="'btn-copy-workdir-' + props.row.trainId", @click="copyToClipBoard(props.row,'workdir')")
                                                        img.icon_clippy(:src='icon_clippy')
                                        el-form-item(label='运行目标环境: ')
                                            span {{ props.row.target }}
                                        el-form-item(label='版本号: ')
                                            span {{ props.row.revision }}
                            el-table-column(prop='trainName', label='训练名', sortable='')
                            el-table-column(prop='createDate_converted', label='创建时间', width='220', :sort-method='sortCreateDate', sortable='')
                            el-table-column(prop='status', label='状态', align='center', width='120')
                                template(slot-scope='scope')
                                    el-tag(v-if="scope.row.status === '00'", type='warning')
                                        i.el-icon-time
                                        | {{scope.row.status_zh}}
                                    el-tag(v-if="scope.row.status === '10'")
                                        i.el-icon-loading
                                        | {{scope.row.status_zh}}
                                    el-tag(v-if="scope.row.status === '20'", type='success')
                                        i.el-icon-success
                                        | {{scope.row.status_zh}}
                            el-table-column(prop='count', label='训练轮数', align='center', width='100')
                            el-table-column(label='操作', align='center', width='220')
                                template(slot-scope='scope')
                                    el-button(v-show="scope.row.status === '20'", size='mini', icon='el-icon-check', @click='handleEdit(scope.$index, scope.row)')
                                        | 开始训练
                                    el-button(v-show="scope.row.status === '20'", size='mini', icon='el-icon-edit-outline', @click='handleEdit(scope.$index, scope.row)')
                                        | 编辑

</template>

<script>
  // @flow
  import API from '@/service/api'
  import ProjectMenu from '@/components/ProjectMenu'
  import {map, extend, assign, debounce} from 'lodash'
  import Clipboard from 'clipboard'
  import format from 'date-fns/format'
  import ElCard from "element-ui/packages/card/src/main";
  import icon_clippy from '@/assets/images/clippy.svg'
  import ElRow from "element-ui/packages/row/src/row";

  const zh_cn = require('date-fns/locale/zh-CN')

  export default {
    name: 'ProjectDetails',
    metaInfo: {
      titleTemplate: '%s-项目详情'
    },
    data() {
      return {
        isLoading: false,
        icon_clippy: icon_clippy,
        trainings_data: [],
        list_images: [],
        dialog_add_training_visible: false,
        upload_to_url: API.baseUploadToAddr('/'),
        steps_add_training: [{
          name: '构建镜像',
          form_name: 'form_build_image'
        }, {
          name: '部署镜像',
          form_name: 'form_deploy_image'
        }],
        at_step_add_training: 0,
        tmpl_form_build_image: {
          image: {},
          uploaded: false
        },
        form_build_image: {
          image: {},
          uploaded: false
        },
        rules_build_image: {
          image: [
            {required: true, message: '请选择镜像', trigger: 'change'}
          ]
          //  上传代码标志位: 是否multiple?

        },
        isSendingForm: false,
        input_trainings_filter: '',
        table_height: this.resizeHandler()
      }
    },
    computed: {
      tableTrainings: function () {
        return map(this.trainings_data, (v) => {
          return assign(v, {
            createDate_converted: format(
              new Date(v.createDate),
              'YYYY[年]MMMD[日]Ah[点]mm[分]',
              {locale: zh_cn}
            ),
            status_zh: `${this.transProjStatus(v.status).zh}`
          })
        }).filter((train) => train.trainName.toLowerCase().includes(String(this.input_trainings_filter).toLowerCase()))
      },
      project_menu_data() {
        return this.$store.state.project_list
      }
    },
    mounted() {
      if (!this.$store.state.project_list || !this.$store.state.project_list.length) {
        return this.$router.push({name: 'project'})
      }
      this.fetchData();
      this.table_height = this.resizeHandler();
      window.onresize = debounce(() => {
        this.table_height = this.resizeHandler();
      }, 300);
      console.log(`upload_to_url: `, this.upload_to_url);
    },
    beforeDestroy: function () {
      window.onresize = undefined;
    },
    watch: {
      '$route':
        'fetchData'
    },
    methods: {
      transProjStatus(value) {
        switch (value) {
          case '00':
            return {
              zh: '等待中',
              en: 'waiting'
            };
            break;
          case '10':
            return {
              zh: '正在训练',
              en: 'training'
            };
            break;
          case '20':
            return {
              zh: '训练成功',
              en: 'success'
            };
            break;
          default:
            break;
        }
      },
      resizeHandler() {
        return document.querySelector('#router_view').getBoundingClientRect().height - (20 + 64 + 10 + 30);
      },
      fetchData() {
        const loading = this.$loading({
          target: '.training-table',
          lock: true,
          text: '正在获取数据。。。',
          background: 'rgba(255,255,255,1)'
        });
        setTimeout(() => {
          loading.close();
          return API.getTrains().then(res => {
            this.trainings_data = res;
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
        }, 500);
      },
      sortCreateDate(a: number, b: number): number {
        return Number(a.createDate) - Number(b.createDate);
      },
      copyToClipBoard(data, prop) {
        console.log(`copyToClipBoard()`, arguments)
        // debugger;

        const input = document.getElementById(`input_${prop}_${data.trainId}`)
        const clipboard = new Clipboard(`.btn-copy-${prop}-${data.trainId}`, {
          text: function () {
            return data[prop];
          }
        });
        clipboard.on('success', (e) => {
          e.clearSelection()
          input.focus()
          input.select()
          return this.$message({
            type: 'success',
            message: '已复制到剪贴板'
          });
        });

        clipboard.on('error', (e) => {
          e.clearSelection();
          input.focus();
          input.select();
          return this.$message({
            type: 'error',
            message: '失败! 请手动复制文本'
          });
        });
      },
      handleAddTrain() {
        console.log(`handleAddTrain()`);
        this.form_build_image = extend({}, this.tmpl_form_build_image);
        return API.getImages().then(res => {
          this.list_images = res;
          this.dialog_add_training_visible = true;
        });
      },
      cancelForm(formName) {
        console.log(`cancelForm(${formName})`);
        this.$refs[formName].resetFields();
        this.form_build_image = extend({}, this.tmpl_form_build_image);
        this.dialog_add_training_visible = false;
      },
      validateForm(form) {
        console.log('validateForm(form): ', form);
        console.log(this.$refs[form]);

        this.$refs[form].validate((valid) => {
          console.log(`valid: `, valid);
          if (valid) {
            // alert('submit!');
            return this.postForm(this.form_build_image);
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      postForm(data) {
        console.log(`postForm(${data})`);
        // let operation = this.operation === '新增' ? 'add用户' : 'edit用户';
        // API[operation](data).then(res => {
        //   this.$notify({
        //     message: `${this.operation}用户成功`,
        //     type: 'success',
        //     duration: 2000
        //   });
        //   this.isSendingForm = false;
        //   if (this.operation === '新增') {
        //     this.form = _.extend(this.form, this.template_of_用户);
        //   }
        //
        // }, err => {
        //   console.log(`err: `, err);
        //   this.$notify({
        //     message: `${err}`,
        //     type: 'error',
        //     duration: 0
        //   });
        //   this.isSendingForm = false;
        // });
      }
    },
    components: {
      ElRow,
      ElCard,
      ProjectMenu
    }
  }
</script>

<style lang="stylus" scoped>
    .ProjectDetails
        background-color antiquewhite
        min-height 100%
        position relative

    .project-details-main
        display flex
        flex-direction column
        padding 10px
        width 100%
        height 100%
        position relative
        overflow hidden

    .card
        margin-bottom 10px
        flex-shrink 0

    .card:last-of-type
        margin-bottom 0px
        flex-shrink 1
        height calc(100% - 74px)

    .card.operations .el-input
        width 200px

    .training-table
        padding 0
        width 100%
        font-size 12px

    .table-expand
        font-size 0
        /deep/ label
            width 120px
            color #99a9bf
        /deep/ .el-form-item
            font-size 12px
            width 50%
            margin-right 0
            margin-bottom 0

        /deep/ .el-form-item__label, /deep/ .el-form-item__content
            font-size 12px

    .proj-card.waiting {
        color: #e6a23c;
    }

    .proj-card.waiting /deep/ .el-card__header {
        background-color: rgba(230, 162, 60, .1);
    }

    .proj-card.training {
        color: #409eff;
    }

    .proj-card.training /deep/ .el-card__header {
        background-color: rgba(64, 158, 255, 0.1);
    }

    .proj-card.success {
        color: #67c23a;
    }

    .proj-card.success /deep/ .el-card__header {
        background-color: rgba(103, 194, 58, .1);
    }

    .icon_clippy
        width 12px
        height auto
        max-height 100%
        vertical-align middle

    .text-selected
        color #fff
        background-color #EA5505

    .menu-wrapper
        display flex
        align-items stretch
        padding-right 10px
        border-radius 4px
        overflow-x hidden
        overflow-y auto
</style>
