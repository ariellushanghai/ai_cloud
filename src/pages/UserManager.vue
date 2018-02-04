<template>
    <el-container class="UserManager" v-loading="isLoading">
        <el-main class="user-manager-main">
            <el-dialog title="新增用户" :visible.sync="dialog_add_user_visible" width="20%" append-to-body>
                <el-form :model="form_add_user" label-position="top" size="small">
                    <el-form-item label="用户名">
                        <el-input v-model="form_add_user.userName"></el-input>
                    </el-form-item>
                    <el-form-item label="角色">
                        <el-select v-model="form_add_user.role" placeholder="请选择用户角色" style="width: 100%;">
                            <el-option v-for="role in roles" :label="role.name" :key="role.v"
                                       :value="role.v"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialog_add_user_visible = false">取消</el-button>
                    <!--<el-button type="primary" @click="validateForm('form_add_user')">确定</el-button>-->
                </div>
            </el-dialog>

            <el-card :body-style="{padding:'15px',display: 'flex','justify-content': 'space-between'}"
                     class="card operations">
                <div class="button-group">
                    <el-button size="small" type="primary" icon="el-icon-circle-plus-outline"
                               style="margin-right: 10px;" @click="handleAddUser">
                        新增用户
                    </el-button>
                </div>
                <el-input
                        placeholder="过滤用户名"
                        suffix-icon="el-icon-search"
                        size="small"
                        clearable
                        v-model="input_users_filter">
                </el-input>
            </el-card>
            <el-card :body-style="{padding:'15px'}" class="card">
                <el-table
                        :data="tableUsers"
                        :height="table_height"
                        class="user-table"
                        stripe
                        border>
                    <el-table-column
                            prop="userName"
                            label="用户名"
                            sortable>
                        <template slot-scope="scope">
                            <el-popover trigger="hover" placement="right">
                                <span>ID: {{ scope.row.userId }}</span>
                                <div slot="reference">
                                    {{ scope.row.userName }}
                                </div>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="role"
                            label="角色"
                            align="center"
                            width="120px"
                            sortable>
                        <template slot-scope="scope">
                            <el-tag v-if="scope.row.role === 'admin'" type="warning">
                                <img class="user-avatar super" :src="icon_super_user"/>
                                管理员
                            </el-tag>
                            <el-tag v-if="scope.row.role === 'normal'" type="info">
                                <img class="user-avatar average" :src="icon_average_user"/>
                                普通用户
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="createDate_converted"
                            label="创建时间"
                            width="220"
                            :sort-method="sortCreateDate"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="parentDir"
                            label="主目录">
                    </el-table-column>
                    <el-table-column
                            prop="training"
                            label="训练目录">
                    </el-table-column>
                    <el-table-column
                            prop="inference"
                            label="部署目录">
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
  import icon_average_user from 'material-design-icons/action/2x_web/ic_face_black_48dp.png'
  import icon_super_user from 'material-design-icons/action/2x_web/ic_supervisor_account_black_48dp.png'

  moment.locale('zh-cn');

  export default {
    name: 'UserManager',
    metaInfo: {
      titleTemplate: '%s-用户管理'
    },
    data() {
      return {
        isLoading: false,
        icon_average_user: icon_average_user,
        icon_super_user: icon_super_user,
        users_data: [],
        dialog_add_user_visible: false,
        roles: [{'v': 'admin', 'name': '管理员'}, {'v': 'normal', 'name': '普通用户'}],
        tmpl_form_add_user: {
          userName: '',
          role: ''
        },
        form_add_user: {
          userName: '',
          role: ''
        },
        input_users_filter: '',
        table_height: this.resizeHandler()
      }
    },
    computed: {
      tableUsers: function () {
        return map(this.users_data, (v) => {
          return assign(v, {'createDate_converted': moment(new Date(v.createDate)).format('LLL')})
        }).filter((user) => user.userName.toLowerCase().includes(String(this.input_users_filter).toLowerCase()))
      }
    },
    mounted() {
      this.fetchData();
      this.table_height = this.resizeHandler();
      console.log(this.resizeHandler());
      window.onresize = debounce(() => {
        this.table_height = this.resizeHandler();
      }, 300);
    },
    beforeDestroy: function () {
      window.onresize = undefined;
    },
    methods: {
      resizeHandler() {
        return document.querySelector('#router_view').getBoundingClientRect().height - (20 + 64 + 10 + 30);
      },
      fetchData() {
        let loading = this.$loading({
          target: '.UserManager',
          lock: true,
          text: '正在获取数据。。。',
          background: 'rgba(250,235,215,0.5)'
        });
        setTimeout(() => {
          loading.close();
          return API.getUsers().then(res => {
            this.users_data = res;
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
      handleAddUser() {
        console.log(`handleAddUser()`);
        this.form_add_user = extend({}, this.tmpl_form_add_user);
        this.dialog_add_user_visible = true;
      }
    },
    components: {ElCard}
  }
</script>

<style scoped>
    .UserManager {
        background-color: antiquewhite;
        min-height: 100%;
        position: relative;
    }

    .user-manager-main {
        display: flex;
        flex-direction: column;
        /*justify-content: space-between;*/
        padding: 10px;
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
    }

    .card {
        margin-bottom: 10px;
        flex-shrink: 0;
    }

    .card:last-of-type {
        margin-bottom: 0px;
        flex-shrink: 1;
        height: calc(100% - 74px);
    }

    .card.operations .el-input {
        width: 200px;
    }

    .user-table {
        padding: 0;
        width: 100%;
    }

    .user-avatar {
        width: 23px;
        height: 23px;
        vertical-align: middle;
    }

    .user-avatar.average {

    }

    .user-avatar.super {
        /*background-color: #F56C6C;*/
    }
</style>
