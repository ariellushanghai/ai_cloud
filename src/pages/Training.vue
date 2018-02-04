<template>
    <el-container class="training">
        <el-main class="training-main">
            <el-dialog title="新增项目" :visible.sync="dialog_add_proj_visible" width="25%" append-to-body center>
                <el-form :model="form_add_proj">
                    <el-form-item label="项目名称">
                        <el-input v-model="form_add_proj.name" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="训练日志存储目录">
                        <el-input v-model="form_add_proj.dir" auto-complete="off"></el-input>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialog_add_proj_visible = false">取消</el-button>
                    <el-button type="primary" @click="validateForm('form_add_proj')">确定</el-button>
                </div>
            </el-dialog>

            <el-card :body-style="{padding:'15px'}" style="margin-bottom: 10px;" class="card operations">
                <div class="button-group">
                    <el-button size="small" type="primary" icon="el-icon-circle-plus"
                               style="margin-right: 10px;" @click="handleAddProj">
                        新增项目
                    </el-button>

                    <el-input
                            placeholder="过滤项目名"
                            suffix-icon="el-icon-search"
                            size="small"
                            clearable
                            v-model="input_proj_filter">
                    </el-input>
                </div>
            </el-card>

            <el-row type="flex"
                    :style="{height: proj_container_height + 'px','overflow': 'hidden','margin-bottom': '10px'}">
                <el-col :span="24" :style="{'overflow-y': 'auto','overflow-x': 'hidden'}">
                    <el-row class="proj-container" type="flex" :gutter="10">
                        <el-col v-for="(proj, index) in proj_list" :xs="12" :sm="8" :md="8" :lg="6" :xl="4"
                                :key="proj.proId"
                                :style="{height: '250px','margin-bottom': '10px'}">
                            <el-card :body-style="{padding:'15px'}" :class="proj.css_class">
                                <div slot="header" class="card-header">
                                    <span>{{proj.proName}}</span>
                                </div>
                                <div style="font-size: 13px;line-height: 30px;">
                                    <div>状态：
                                        <el-tag v-if="proj.status === '00'" type="warning">
                                            <i class="el-icon-time"></i>
                                            {{proj.status_zh}}
                                        </el-tag>
                                        <el-tag v-if="proj.status === '10'">
                                            <i class="el-icon-loading"></i>
                                            {{proj.status_zh}}
                                        </el-tag>
                                        <el-tag v-if="proj.status === '20'" type="success">
                                            <i class="el-icon-success"></i>
                                            {{proj.status_zh}}
                                        </el-tag>
                                    </div>
                                    <p>创建时间： {{proj.createDate_converted}}</p>
                                </div>
                                <div class="button-group">
                                    <el-button
                                            size="mini"
                                            plain
                                            @click="handleEditProj(proj)">详情
                                    </el-button>
                                    <el-button
                                            size="mini"
                                            plain
                                            @click="handleEditProj(proj)">编辑
                                    </el-button>
                                    <el-button
                                            size="mini"
                                            plain
                                            type="danger"
                                            @click="handleDeleteProj(proj)">删除
                                    </el-button>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
        </el-main>
    </el-container>
</template>

<script>
  import API from '@/service/api'
  import router from '@/router'
  import {map, extend, assign, debounce, sortBy} from 'lodash'
  import * as moment from 'moment'
  import 'moment/locale/zh-cn'
  import ElCard from "element-ui/packages/card/src/main";

  moment.locale('zh-cn');

  export default {
    name: 'Training',
    metaInfo: {
      titleTemplate: '%s-模型训练'
    },
    data: function () {
      return {
        isLoading: false,
        dialog_add_proj_visible: false,
        tmpl_form_add_proj: {
          name: '',
          dir: '/'
        },
        form_add_proj: {
          name: '',
          dir: '/'
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
            createDate_converted: moment(new Date(v.createDate)).format('LL LTS'),
            css_class: `proj-card ${this.transProjStatus(v.status).en}`,
            status_en: `${this.transProjStatus(v.status).en}`,
            status_zh: `${this.transProjStatus(v.status).zh}`,
          })
        }), ['status_en', 'createDate']).filter((proj) => proj.proName.toLowerCase().includes(String(this.input_proj_filter).toLowerCase()))
      }
    },
    // beforeRouteEnter(to, from, next) {
    //   console.log('Training beforeRouteEnter()');
    //   return next();
    // },
    mounted: function () {
      console.log('Training mounted()');
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
        let loading = this.$loading({
          target: '.proj-container',
          lock: true,
          text: '正在获取数据。。。',
          background: 'rgba(250,235,215,0.5)'
        });
        setTimeout(() => {
          loading.close();
          return API.getProjects(`${this.$store.getters.userName}`).then(res => {
            this.projects_data = res;
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
      handleAddProj() {
        console.log(`handleAddProj()`);
        this.form_add_proj = extend({}, this.tmpl_form_add_proj);
        this.dialog_add_proj_visible = true;
      },
      validateForm(form) {
        console.log('validateForm(form): ', form);
        this.$refs[form].validate((valid) => {
          console.log(`valid: `, valid);
          if (valid) {
            alert('submit!');
            // return this.postForm(self.form);
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      handleRowClick(row, event, column) {
        event.stopPropagation();
        if (column.label === 'operations') {
          return false;
        }
        console.log('handleRowClick(', row, column, ')');
        return router.push({name: 'tfproj', params: {name: row.name}})
        // this.$emit('rowClick', row);
      },
      handleEditProj() {

      },
      handleDeleteProj(proj) {
        console.log(`handleDeleteProj()`, proj);
        this.$confirm(`<p>您确定删除<strong>${proj.proName}</strong>?</p>`, '提示', {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      refreshAll() {
        console.log('refreshAll()');
        this.isLoading = true;
        // this.fetchData('all').then(res => {
        //   this.$store.dispatch('buildTree', res);
        //   this.$notify({
        //     message: `数据已更新`,
        //     type: 'success',
        //     duration: 2000
        //   });
        //   this.isLoading = false;
        //   this.timestamp_data_fetched = (new Date()).toLocaleString();
        // }, err => {
        //   console.log(`err: `, err);
        //   this.$notify({
        //     message: `${err}`,
        //     type: 'error',
        //     duration: 0
        //   });
        //   this.isLoading = false;
        // });
      },
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
        return document.querySelector('#router_view').getBoundingClientRect().height - (20 + 64 + 20);
      }
    },
    components: {ElCard}
  }
</script>

<style scoped>
    .training {
        background-color: antiquewhite;
        width: 100%;
        height: 100%;
        position: relative;
    }

    .training-main {
        padding: 10px;
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
    }

    .card.operations .el-input {
        width: 200px;
    }

    .proj-container {
        /*padding: 0 10px;*/
        flex-wrap: wrap;

    }

    .proj-card {
        height: 100%;
        margin-bottom: 10px;
        background-color: #fff;
        transition: transform .2s ease-in-out;
    }

    .proj-card:hover {
        cursor: pointer;
        transform: scale(1.05);
    }

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

    .card-header {
        line-height: 20px;
        font-size: 18px;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .proj-card /deep/ .el-card__body {
        height: calc(100% - 57px);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .button-group {
        display: flex;
        justify-content: space-between;
    }

    .proj-card .button-group {
        justify-content: flex-end;
    }

</style>
