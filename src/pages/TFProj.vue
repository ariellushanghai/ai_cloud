<template>
    <el-container class="tfproj">
        <el-main class="tfproj-main">
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
                    <el-button @click="dialog_add_proj_visible = false">取 消</el-button>
                    <el-button type="primary" @click="validateForm('form_add_proj')">确 定</el-button>
                </div>
            </el-dialog>
            <el-row type="flex" justify="center">
                <el-col :span="24">
                    <el-card :body-style="{padding:'15px'}" style="margin-bottom: 10px;">
                        <div class="button-group">
                            <el-button size="small" type="primary" icon="el-icon-circle-plus"
                                       style="margin-right: 10px;" @click="handleAddProj">
                                新增项目
                            </el-button>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            <el-row type="flex" justify="center">
                <el-col :span="24">
                    <el-card :body-style="{padding:'15px'}">
                        <el-table
                                :data="tableData2"
                                @row-click="handleRowClick"
                                :show-header=false
                                style="width: 100%"
                                fit
                                stripe>
                            <el-table-column
                                    prop="name"
                                    label="模型名字">
                            </el-table-column>
                            <el-table-column
                                    prop="waiting"
                                    label="等待中">
                                <template slot-scope="scope">
                                    <el-tag type="warning">
                                        <i class="el-icon-time"></i>
                                        等待中: {{ scope.row.waiting }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    prop="training"
                                    label="正在训练">
                                <template slot-scope="scope">
                                    <el-tag>
                                        <i class="el-icon-loading"></i>
                                        正在训练: {{ scope.row.training }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    prop="success"
                                    label="训练成功">
                                <template slot-scope="scope">
                                    <el-tag type="success">
                                        <i class="el-icon-success"></i>
                                        训练成功: {{ scope.row.success }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column label="operations">
                                <template slot-scope="scope">
                                    <el-button
                                            size="mini"
                                            @click="handleEditProj(scope.$index, scope.row)">编辑
                                    </el-button>
                                    <el-button
                                            size="mini"
                                            type="danger"
                                            @click="handleDeleteProj(scope.$index, scope.row)">删除
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-card>
                </el-col>
            </el-row>
        </el-main>
    </el-container>
</template>

<script>
  import API from '@/service/api'
  import router from '@/router'
  import _ from 'lodash'
  import ElCard from "element-ui/packages/card/src/main";

  export default {
    name: 'TFProj',
    metaInfo: {
      titleTemplate: '%s-TensorFlow 模型训练'
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
        tableData2: [{
          name: '项目1',
          waiting: 1,
          training: 2,
          success: 0
        }, {
          name: '项目2',
          waiting: 1,
          training: 2,
          success: 0
        }, {
          name: '项目3',
          waiting: 1,
          training: 2,
          success: 0
        }, {
          name: '项目4',
          waiting: 1,
          training: 2,
          success: 0
        }]
      }
    },
    computed: {},
    beforeRouteEnter(to, from, next) {
      console.log('TFProj beforeRouteEnter()');
      return next();
    },
    mounted: function () {
      console.log('TFProj mounted()');
      // this.refreshAll();
    },
    methods: {
      fetchData(what, param) {
      },
      handleAddProj() {
        console.log(`handleAddProj()`);
        this.form_add_proj = _.extend({}, this.tmpl_form_add_proj);
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
      handleDeleteProj(idx, row) {
        console.log(`handleDeleteProj()`, row);
        this.$confirm(`<p>您确定删除<strong>${row.name}</strong>?</p>`, '提示', {
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
      }
    },
    components: {ElCard}
  }
</script>

<style>
    .tfproj {
        background-color: antiquewhite;
        width: 100%;
        height: 100%;
        position: relative;
    }

    .tfproj-main {
        padding: 10px;
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
    }

    .button-group {
        display: flex;
    }
</style>
