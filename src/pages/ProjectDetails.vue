<template lang="pug">
    el-container.ProjectDetails(v-loading='isLoadingTable')
        el-main.project-details-main

            // 训练日志弹出框
            el-dialog.dialog-train-log(:visible.sync='dialog_train_log_visible', custom-class='dialog-train-log', width='61.8%', top='50px', append-to-body='', modal-append-to-body='', lock-scroll='', :show-close='true', :close-on-click-modal='false', :close-on-press-escape='false', close='handleCloseLog')
                .log-container
                    log(:train_status='train_status' , :podName='train_pod', :freq='5000', :timestamp='trainCreateDate', :switch='dialog_train_log_visible')

            // 新建训练弹出框
            el-dialog.dialog-build-image(:visible.sync='dialog_add_training_visible', width='61.8%', append-to-body='', modal-append-to-body='', lock-scroll='', :before-close="handleCloseDialogBuildImage", :show-close='false', :close-on-click-modal='false', :close-on-press-escape='false')
                // 标题栏
                div(slot='title')
                    el-steps(:active='at_step_add_training', simple='', finish-status='success')
                        el-step(title='构建镜像', icon='el-icon-edit')
                        el-step(title='部署镜像', icon='el-icon-upload')
                // 表单
                .form-container(v-loading='isBuildingImage')
                    // 第一步: 构建镜像
                    el-form(v-show='at_step_add_training === 0', :model='form_build_image', :rules='rules_build_image', ref='form_build_image', element-loading-background='rgba(255, 255, 255, 0.1)', :disabled='isBuildingImage || isTransformingFile', :status-icon='true', label-position='left', label-width='50%', size='small')

                        el-form-item(label='输入训练名:', prop='trainName')
                            el-input(v-model.trim='form_build_image.trainName', auto-complete='off', :style="{'width': '200px'}")

                        el-form-item(label='选择镜像:', prop='imageName')
                            el-select(v-model='form_build_image.imageName', placeholder='请选择镜像', :style="{'width': '200px'}")
                                el-option(v-for='image in list_images', :label='image.imageName', :key='image.imageId', :value='image.imageName')

                        el-form-item(:label="'上传代码到 ' + upload_code_url_short", prop='uploaded_code')
                            el-upload(:action='upload_code_url', :on-progress='handleFileUploading', :on-success='handleCodeUploadedSuccess', :on-error='handleFileUploadedFailed', :show-file-list='true', :multiple='false', :disabled='form_build_image.trainName.length < 3 || !form_build_image.imageName')
                                el-button(type='primary', icon='el-icon-upload', :disabled='form_build_image.trainName.length < 3 || !form_build_image.imageName') 点击上传

                        el-form-item(:label="'上传训练数据到 ' + upload_data_url_short", prop='uploaded_data')
                            el-upload(:action='upload_data_url', :on-progress='handleFileUploading', :on-success='handleDataUploadedSuccess', :on-error='handleFileUploadedFailed', :show-file-list='true', :multiple='false', :disabled='form_build_image.trainName.length < 3 || !form_build_image.imageName')
                                el-button(type='primary', icon='el-icon-upload', :disabled='form_build_image.trainName.length < 3 || !form_build_image.imageName') 点击上传

                    // 第二步: 部署镜像
                    el-form(v-show='at_step_add_training === 1', :model='form_deploy_image', :rules='rules_deploy_image', ref='form_deploy_image', :status-icon='true', label-position='left', label-width='200px', size='small', :disabled='isTransformingFile')

                        .templates(v-show='!showCustomComputeResource')
                            .compute-resource-template(v-for='(tmpl, index) in tmpl_compute_resource', :key='index', @click="selectComputeResourceTemplate(index)", :class="{selected: index === selected_compute_resource_template}")
                                p
                                    span CPU:
                                    span {{tmpl.requestCPU}} 核
                                p
                                    span 内存:
                                    span {{tmpl.requestMemory}}
                                p
                                    span GPU:
                                    span {{tmpl.gpu}} 个



                        el-form-item(label='启用TensorBoard:')
                            el-switch(v-model='form_deploy_image.tensorboard', active-color='#13ce66')

                        .forty-sixty
                            .forty
                                el-form-item(:label="labelOfConfigParaServer")
                                    el-switch(v-model='form_deploy_image.enablePS', active-color='#13ce66')
                            .sixty
                                el-slider(v-model='form_deploy_image.env.ps', :step='1', :min='0', :max='3', :show-stops='true',:disabled='!form_deploy_image.enablePS')

                        .forty-sixty
                            .forty
                                el-form-item(:label="labelOfConfigWorker")
                                    el-switch(v-model='form_deploy_image.enableWorkers', active-color='#13ce66')
                            .sixty
                                el-slider(v-model='form_deploy_image.env.workers', :step='1', :min='0', :max='3', :show-stops='true', :disabled='!form_deploy_image.enableWorkers')

                        el-form-item(label='训练轮数:')
                            el-input-number(v-model.trim='form_deploy_image.env.train_num', :min='0', :step='1000', auto-complete='off')

                        el-form-item(label='命令行参数:')
                            el-input(v-model.trim='form_deploy_image.env.cmd', auto-complete='off')


                // 页脚

                // 第一步: 构建镜像
                .dialog-footer(v-show='at_step_add_training === 0', slot='footer')
                    el-button(@click="cancelForm('form_build_image')", :v-show='!isBuildingImage', :disabled='isTransformingFile || isBuildingImage', size='small')
                        | 取消
                    el-button(type='primary', @click="validateForm('form_build_image')", :disabled='disableBtnBuildImage', :loading='isBuildingImage', icon='el-icon-check', size='small')
                        | 下一步

                // 第二步: 部署镜像
                .dialog-footer(v-show='at_step_add_training === 1', slot='footer')
                    el-button(@click="cancelForm('form_deploy_image')", :disabled='isTransformingFile || isBuildingImage', size='small')
                        | 取消
                    el-button(type='primary', @click="validateForm('form_deploy_image')", :loading='isBuildingImage', icon='el-icon-check', size='small')
                        | 完成


            el-row(type='flex', style='overflow: hidden;')
                // 左侧菜单栏
                el-col.menu-wrapper(:sm='6', :md='6', :lg='4', :xl='3')
                    project-menu(:data='project_menu_data')
                el-col(:sm='18', :md='18', :lg='20', :xl='21')
                    // 操作栏
                    el-card.card.operations(:body-style="{padding:'15px',display: 'flex','justify-content': 'space-between'}")
                        .button-group
                            el-button(size='small', type='primary', icon='el-icon-circle-plus-outline', style='margin-right: 10px;', @click='handleAddTrain', :disabled='trainings_data.length !== 0')
                                | 新增训练
                            el-button(size='small', type='primary', icon='el-icon-refresh', @click='fetchData()', :disabled='isLoadingTable')
                                | 刷新

                        el-input(placeholder='过滤训练名', suffix-icon='el-icon-search', size='small', clearable='', v-model='input_trainings_filter')
                    // 训练表格
                    el-card.card(:body-style="{padding:'15px'}")
                        el-table.training-table(:data='tableTrainings', :height='table_height', stripe='', fit='')
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
                                    el-tag(v-if="scope.row.status === '30'", type='danger')
                                        i.el-icon-error
                                        | {{scope.row.status_zh}}
                            el-table-column(prop='count', label='训练轮数', align='center', width='100')
                            el-table-column(label='操作', align='center', width='220')
                                template(slot-scope='scope')
                                    el-button(v-show="scope.row.status === '00'", type='primary', size='mini', icon='el-icon-edit-outline', @click='handleContinueDeployImage(scope.$index, scope.row)')
                                        | 部署镜像
                                    el-button(v-show="scope.row.status !== '00'", type='primary', size='mini', icon='el-icon-view', @click='handleOpenLog(scope.$index, scope.row)')
                                        | 察看日志

</template>

<script>
  // @flow
  import {baseURL} from '@/conf/env'
  import API from '@/service/api'
  import ProjectMenu from '@/components/ProjectMenu'
  import Log from '@/components/Log'
  import {map, extend, assign, debounce, omit, find} from 'lodash'
  import Clipboard from 'clipboard'
  import format from 'date-fns/format'
  import ElCard from "element-ui/packages/card/src/main";
  import icon_clippy from '@/assets/images/clippy.svg'
  import ElRow from "element-ui/packages/row/src/row";
  import ElSwitch from 'element-ui/packages/switch/src/component';

  const zh_cn = require('date-fns/locale/zh-CN')

  export default {
    name: 'ProjectDetails',
    metaInfo: {
      titleTemplate: '%s-项目详情'
    },
    data() {
      return {
        isLoadingTable: false,
        isTransformingFile: false,
        icon_clippy: icon_clippy,
        trainings_data: [],
        list_images: [],
        dialog_add_training_visible: false,
        dialog_train_log_visible: false,
        train_pod: '',
        train_status: '',
        trainCreateDate: null,
        steps_add_training: [{
          name: '构建镜像',
          form_name: 'form_build_image'
        }, {
          name: '部署镜像',
          form_name: 'form_deploy_image'
        }],
        at_step_add_training: 0,
        selected_compute_resource_template: 0,
        tmpl_compute_resource: [{
          requestCPU: 1,
          requestMemory: '2Gi',
          gpu: 0
        }, {
          requestCPU: 2,
          requestMemory: '4Gi',
          gpu: 0
        }, {
          requestCPU: 8,
          requestMemory: '16Gi',
          gpu: 1
        }, {
          requestCPU: 16,
          requestMemory: '32Gi',
          gpu: 2
        }],
        tmpl_form_build_image: {
          trainName: '',
          name: '',
          projectType: 'train',
          namespace: '',
          imageName: '',
          uploaded_code: false,
          uploaded_data: false
        },
        form_build_image: {
          trainName: '',
          name: '',
          projectType: 'train',
          namespace: '',
          imageName: '',
          uploaded_code: false,
          uploaded_data: false
        },
        rules_build_image: {
          trainName: [
            {type: "string", required: true, message: '请输入训练名', trigger: 'blur'},
            {min: 3, message: '长度在3个字符以上', trigger: 'blur'}
          ],
          imageName: [
            {type: 'string', required: true, message: '请选择镜像', trigger: 'change'}
          ],
          uploaded_code: [
            {type: 'boolean', required: true, message: '请上传代码', trigger: 'change'}
          ],
          uploaded_data: [
            {type: 'boolean', required: true, message: '请上传数据', trigger: 'change'}
          ]
        },
        tmpl_form_deploy_image: {
          env: {
            ps: 0,
            workers: 0,
            train_num: 0,
            cmd: ''
          },
          projectType: 'train',
          replicas: 1,
          type: 'job',
          tensorboard: false,
          enablePS: false,
          enableWorkers: false
        },
        form_deploy_image: {
          env: {
            ps: 0,
            workers: 0,
            train_num: 0,
            cmd: ''
          },
          projectType: 'train',
          replicas: 1,
          type: 'job',
          tensorboard: false,
          enablePS: false,
          enableWorkers: false
        },
        rules_deploy_image: {},
        isBuildingImage: false,
        isDeployingImage: false,
        showCustomComputeResource: false,

        input_trainings_filter: '',
        table_height: this.resizeHandler()
      }
    },
    computed: {
      home_path() {
        return `${this.$store.state.user.parentDir}/`;
      },
      upload_code_url() {
        console.log(`upload_code_url: ${baseURL}/upload?path=${this.home_path}train/${this.$route.params.name}/project/`);
        return `${baseURL}/upload?path=${encodeURIComponent(this.home_path + 'train/' + this.$route.params.name + '/project/')}`;
      },
      upload_code_url_short() {
        return `~/train/${this.$route.params.name}/project/`;
      },
      upload_data_url() {
        return `${baseURL}/upload?path=${encodeURIComponent(this.home_path + 'train/' + this.$route.params.name + '/data/')}`;
      },
      upload_data_url_short() {
        return `~/train/${this.$route.params.name}/data/`;
      },
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
      },
      disableBtnBuildImage() {
        if (this.isTransformingFile || this.isBuildingImage) {
          console.log(`L308`)
          return true;
        } else if (!this.uploaded_data || !this.uploaded_data) {
          console.log(`L311`)
          return true;
        } else if (this.form_build_image.trainName.length < 3 || !this.form_build_image.imageName) {
          console.log(`L314`)
          return true;
        } else {
          return false;
        }
      },
      disableBtnDeployImage() {

      },
      labelOfConfigParaServer() {
        return this.form_deploy_image.enablePS ? `配置参数服务器(已选${this.form_deploy_image.env.ps}台): ` : '配置参数服务器: ';
      },
      labelOfConfigWorker() {
        return this.form_deploy_image.enableWorkers ? `配置计算节点(已选${this.form_deploy_image.env.workers}个): ` : '配置计算节点: ';
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
      console.log(`upload_code_url: `, this.upload_code_url);
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
              zh: '未部署镜像',
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
          case '30':
            return {
              zh: '训练失败',
              en: 'error'
            };
            break;
          default:
            break;
        }
      },
      formatCPUs(v) {
      },
      formatMemories(v) {
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
        this.isLoadingTable = true;
        return API.getTrains({
          proName: this.$route.params.name,
          userName: this.$store.getters.user_name
        }).then(res => {
          console.log(`res: `, res)
          this.trainings_data = res;
          this.isLoadingTable = false;
          loading.close();
        }, err => {
          console.log(`err: `, err);
          this.isLoadingTable = false;
          loading.close();
          this.$notify({
            message: `${err}`,
            type: 'error',
            duration: 0
          });
        });
      },
      sortCreateDate(a: number, b: number): number {
        return Number(a.createDate) - Number(b.createDate);
      },
      copyToClipBoard(data, prop) {
        console.log(`copyToClipBoard()`, arguments)
        const input = document.getElementById(`input_${prop}_${data.trainId}`)
        const clipboard = new Clipboard(`.btn-copy-${prop}-${data.trainId}`, {
          text: function () {
            return data[prop];
          }
        });
        clipboard.on('success', (e) => {
          e.clearSelection();
          input.focus();
          input.select();
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
        this.form_deploy_image = extend({}, this.tmpl_form_deploy_image);
        return API.getImages().then(res => {
          this.list_images = res;
          this.dialog_add_training_visible = true;
        });
      },
      cancelForm(formName) {
        console.log(`cancelForm(${formName})`);
        this.$refs[formName].resetFields();
        this[formName] = extend({}, this[`tmpl_${formName}`]);
        this.dialog_add_training_visible = false;
      },
      handleCloseDialogBuildImage(done) {
        if (!this.isTransformingFile) {
          return done();
        }
      },
      handleFileUploading(event, file, fileList) {
        console.log(`handleFileUploading`, file);
        this.isTransformingFile = true;
      },
      handleCodeUploadedSuccess(response, file, fileList) {
        console.log(response, file, fileList);
        this.isTransformingFile = false;
        this.uploaded_code = true;
        return this.$message({
          type: 'success',
          message: `上传${file.name}成功!`
        });
      },
      handleDataUploadedSuccess(response, file, fileList) {
        console.log(response, file, fileList);
        this.isTransformingFile = false;
        this.uploaded_data = true;
        return this.$message({
          type: 'success',
          message: `上传${file.name}成功!`
        });
      },
      handleFileUploadedFailed(err, file, fileList) {
        this.isTransformingFile = false;
        return this.$message.error(`上传${file.name}失败!`)
      },
      handleOpenLog(index, row) {
        console.log(`handleOpenLog(): `, index, row);
        this.dialog_train_log_visible = true;
        this.train_pod = row.pod;
        this.trainCreateDate = row.createDate;
        this.train_status = row.status
      },
      handleCloseLog() {
        console.log(`handleCloseLog(): `);
        this.dialog_train_log_visible = false;
      },
      handleContinueDeployImage(index, row) {
        console.log(`handleContinueDeployImage(): `, index, row);
        this.form_deploy_image = omit(extend(this.form_deploy_image, row, {
          image: row.imageUrl
        }), ['status_zh', 'createDate_converted']);
        console.log(`L489: this.form_deploy_image: `, JSON.stringify(this.form_deploy_image));
        this.at_step_add_training = 1;
        this.dialog_add_training_visible = true;
      },
      validateForm(form) {
        console.log('validateForm(form): ', form);
        console.log(this.$refs[form]);

        this.$refs[form].validate((valid) => {
          console.log(`valid: `, valid);
          if (valid) {
            if (form === 'form_build_image') {
              return this.postFormBuildImage(this.form_build_image);
            }
            if (form === 'form_deploy_image') {
              return this.postFormDeployImage(this.form_deploy_image);
            }
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      selectComputeResourceTemplate(idx) {
        console.log(`selectComputeResourceTemplate(${idx})`);
        this.selected_compute_resource_template = idx;
        console.log(extend({}, this.tmpl_compute_resource[this.selected_compute_resource_template]));
      },
      postFormBuildImage(raw_form_data) {
        let self = this;
        console.log(self.$route.params.name);
        console.log(`postFormBuildImage(${raw_form_data})`);
        let payload = omit(extend((raw_form_data), {
          imageType: find(self.list_images, {imageName: raw_form_data.imageName}).imageType,
          baseImage: find(self.list_images, {imageName: raw_form_data.imageName}).imageUrl
        }, {
          name: self.$route.params.name,
          namespace: self.$store.getters.user_name
        }), ['uploaded_code', 'uploaded_data', 'imageName']);

        this.isBuildingImage = true;
        console.log('API: ', API);
        console.log('payload: ', payload);
        API.buildImage(payload).then(res => {
          if (Number(res.status) === 200 && res.data && res.data.result === 'success') {
            let response = res.data.data;
            this.$notify({
              message: `构建镜像成功`,
              type: 'success',
              duration: 2000
            });
            this.isBuildingImage = false;
            this.form_deploy_image = omit(extend({}, this.tmpl_form_deploy_image, this.form_build_image, response), [
              'uploaded_code', 'uploaded_data', 'pod', 'status', 'imageId', 'containers', 'imageUrl'
            ]);
            this.form_deploy_image.image = response.imageUrl;
            console.log(`L567: this.form_deploy_image: `, JSON.stringify(this.form_deploy_image));
            this.form_build_image = extend({}, this.tmpl_form_build_image);
            this.at_step_add_training = 1;
          }
        }, err => {
          console.log(`err: `, err);
          this.$notify({
            message: `${err}`,
            type: 'error',
            duration: 0
          });
          this.isBuildingImage = false;
        });
      },
      postFormDeployImage(raw_form_data) {
        let selected_compute_resource = extend({}, this.tmpl_compute_resource[this.selected_compute_resource_template]);
        console.log(`postFormDeployImage(${raw_form_data}): `, raw_form_data);
        let payload = omit(extend(raw_form_data, selected_compute_resource, {
          limitCPU: selected_compute_resource.requestCPU,
          limitMemory: selected_compute_resource.requestMemory
        }), ['baseImage', 'codeURL', 'createDate', 'imageUrl', 'modifyDate', 'revision', 'env']);
        if (raw_form_data.tensorboard) {
          payload = extend(payload, {
            tensorboard: 1,
            servicePort: 6006,
            containerPort: 6006
          });
        } else {
          payload = omit(extend(payload, {
            tensorboard: 0
          }), ['servicePort', 'containerPort', 'env']);
        }
        console.log(`payload: `, payload);
        this.isDeployingImage = true;
        API.deployImage(payload).then(res => {
          if (Number(res.status) === 200 && res.data && res.data.result === 'success') {
            let response = res.data.data;
            this.$notify({
              message: `部署镜像成功`,
              type: 'success',
              duration: 2000
            });
            this.fetchData();
            this.dialog_add_training_visible = false;
            this.isDeployingImage = false;
            this.form_deploy_image = extend({}, this.tmpl_form_deploy_image);
            this.at_step_add_training = 0;
          } else {
            console.log(`err: `, res.data.result);
            this.$notify({
              message: `${res.data.result}`,
              type: 'error',
              duration: 0
            });
            this.isDeployingImage = false;
          }
        });
      }
    },
    components: {
      ElSwitch,
      ElRow,
      ElCard,
      ProjectMenu,
      Log
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

    /*.dialog-image-operations*/

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

    .templates
        display flex
        justify-content space-between
        margin-bottom 18px

    .compute-resource-template
        will-change border font-weight
        font-family monospace
        padding 10px
        width 120px
        margin 0
        border 2px dashed #c0c4cc
        transition all ease-in-out .2s

    .compute-resource-template:hover, .compute-resource-template.selected
        cursor pointer
        border 2px solid #409EFF
        font-weight bold

    .compute-resource-template.selected
        cursor none

    .compute-resource-template p
        display flex
        margin 5px 0

        span
            width 50%

    .forty-sixty
        display flex
        margin-bottom 18px

        .forty
            width 40%
        .sixty
            width 60%

    .dialog-train-log /deep/ .el-dialog__header
        padding 10px

    .dialog-train-log /deep/ .el-dialog__body
        height 500px

    .log-container
        background-color black
        position relative
        width 1000%
        max-width 100%
        height 100%

</style>
