<template>
    <el-container class="ProjectDetails" v-loading="isLoading">
        <el-main class="project-details-main">
            <el-dialog title="新增训练" :visible.sync="dialog_add_training_visible" width="30%" append-to-body>
                <el-form :model="form_add_train" :rules="rules" ref="form_add_train" status-icon label-position="top"
                         size="small">

                    <el-form-item label="训练名" prop="trainName">
                        <el-input v-model="form_add_train.trainName"></el-input>
                    </el-form-item>

                    <el-form-item label="角色" prop="role">
                        <el-select v-model="form_add_train.role" placeholder="请选择用户角色" style="width: 100%;">
                            <el-option v-for="role in roles" :label="role.name" :key="role.v"
                                       :value="role.v">

                            </el-option>
                        </el-select>
                    </el-form-item>

                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="cancelForm('form_add_train')">取消</el-button>
                    <el-button type="primary" @click="validateForm('form_add_train')" icon="el-icon-upload2"
                               :loading="isSendingForm">提交
                    </el-button>
                </div>
            </el-dialog>

            <el-card :body-style="{padding:'15px',display: 'flex','justify-content': 'space-between'}"
                     class="card operations">
                <div class="button-group">
                    <el-button size="small" type="primary" icon="el-icon-circle-plus-outline"
                               style="margin-right: 10px;" @click="handleAddTrain">
                        新增训练
                    </el-button>
                </div>
                <el-input
                        placeholder="过滤训练名"
                        suffix-icon="el-icon-search"
                        size="small"
                        clearable
                        v-model="input_trainings_filter">
                </el-input>
            </el-card>
            <el-card :body-style="{padding:'15px'}" class="card">
                <el-table
                        :data="tableTrainings"
                        :height="table_height"
                        class="training-table"
                        stripe
                        fit
                        border>
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="table-expand">
                                <el-form-item label="ID: ">
                                    <span>{{ props.row.trainId }}</span>
                                </el-form-item>
                                <el-form-item label="基础镜像: ">
                                    <span>{{ props.row.baseImage }}</span>
                                </el-form-item>
                                <el-form-item label="代码库URL: ">
                                    <span>{{ props.row.codeURL }}</span>
                                </el-form-item>
                                <el-form-item label="分布式存储路径: ">
                                    <span>{{ props.row.workdir }}</span>
                                </el-form-item>
                                <el-form-item label="运行目标环境: ">
                                    <span>{{ props.row.target }}</span>
                                </el-form-item>
                                <el-form-item label="版本号: ">
                                    <span>{{ props.row.revision }}</span>
                                </el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="trainName"
                            label="训练名"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="createDate_converted"
                            label="创建时间"
                            width="220"
                            :sort-method="sortCreateDate"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="role"
                            label="状态"
                            align="center"
                            width="120px">
                        <template slot-scope="scope">
                            <el-tag v-if="scope.row.status === '00'" type="warning">
                                <i class="el-icon-time"></i>
                                {{scope.row.status_zh}}
                            </el-tag>
                            <el-tag v-if="scope.row.status === '10'">
                                <i class="el-icon-loading"></i>
                                {{scope.row.status_zh}}
                            </el-tag>
                            <el-tag v-if="scope.row.status === '20'" type="success">
                                <i class="el-icon-success"></i>
                                {{scope.row.status_zh}}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="count"
                            label="训练轮数">
                    </el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button
                                    size="mini"
                                    @click="handleEdit(scope.$index, scope.row)">开始训练
                            </el-button>
                            <el-button
                                    size="mini"
                                    @click="handleEdit(scope.$index, scope.row)">编辑
                            </el-button>

                        </template>
                    </el-table-column>
                </el-table>
            </el-card>
        </el-main>
    </el-container>
</template>

<script>
  import API from '@/service/api'
  import {map, extend, assign, debounce} from 'lodash'
  import * as moment from 'moment'
  import 'moment/locale/zh-cn'
  import ElCard from "element-ui/packages/card/src/main";

  moment.locale('zh-cn');

  export default {
    name: 'ProjectDetails',
    metaInfo: {
      titleTemplate: '%s-项目详情'
    },
    data() {
      return {
        isLoading: false,
        trainings_data: [],
        dialog_add_training_visible: false,
        roles: [{'v': 'admin', 'name': '管理员'}, {'v': 'normal', 'name': '普通用户'}],
        tmpl_form_add_train: {
          trainName: '',
          role: ''
        },
        form_add_train: {
          trainName: '',
          role: ''
        },
        rules: {
          trainName: [
            {type: "string", required: true, message: '请输入训练名', trigger: 'blur'},
            {min: 3, message: '长度在3个字符以上', trigger: 'blur'}
          ],
          role: [
            {type: "string", required: true, message: '请选择用户角色', trigger: 'change'}
          ]
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
            createDate_converted: moment(new Date(v.createDate)).format('LLL'),
            status_zh: `${this.transProjStatus(v.status).zh}`
          })
        }).filter((train) => train.trainName.toLowerCase().includes(String(this.input_trainings_filter).toLowerCase()))
      }
    },
    mounted() {
      this.fetchData();
      this.table_height = this.resizeHandler();
      window.onresize = debounce(() => {
        this.table_height = this.resizeHandler();
      }, 300);
    },
    beforeDestroy: function () {
      window.onresize = undefined;
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
        let loading = this.$loading({
          target: '.ProjectDetails',
          lock: true,
          text: '正在获取数据。。。',
          background: 'rgba(250,235,215,0.5)'
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
      sortCreateDate(a, b) {
        return Number(a.createDate) - Number(b.createDate);
      },
      handleAddTrain() {
        console.log(`handleAddTrain()`);
        this.form_add_train = extend({}, this.tmpl_form_add_train);
        this.dialog_add_training_visible = true;
      },
      cancelForm(formName) {
        console.log(`cancelForm(${formName})`);
        this.$refs[formName].resetFields();
        this.form_add_train = extend({}, this.tmpl_form_add_train);
        this.dialog_add_training_visible = false;
      },
      validateForm(form) {
        console.log('validateForm(form): ', form);
        console.log(this.$refs[form]);

        this.$refs[form].validate((valid) => {
          console.log(`valid: `, valid);
          if (valid) {
            // alert('submit!');
            return this.postForm(this.form_add_train);
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
    components: {ElCard}
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
            width 50%
            margin-right 0
            margin-bottom 0

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

</style>
