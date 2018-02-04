<template>
    <el-table
            class="layer-table"
            style="width: 100%;"
            :data="table"
            size="small"
            fit
            stripe
            @row-click="handleRowClick">
        <el-table-column
                prop="id"
                label="ID"
                width="100">
        </el-table-column>
        <el-table-column
                prop="name"
                label="JOB名字">
        </el-table-column>
        <el-table-column
                prop="status"
                label="状态"
                width="100"
                align="center"
                sortable>
            <template slot-scope="scope">
                <el-tag :type="scope.row.status| transStatusToTag">{{scope.row.status}}</el-tag>
            </template>
        </el-table-column>
    </el-table>
</template>

<script>
  export default {
    name: 'LayerTable',
    props: ['layer'],
    data() {
      return {}
    },
    // mounted() {},
    computed: {
      table() {
        console.log('layer: ', this.layer);
        return this.layer.sort((a, b) => {
          if (a.status === 'ERROR') {
            return -1;
          }
          if (b.status === 'ERROR') {
            return 1;
          }
          if (a.status < b.status) {
            return -1
          }
          if (a.status > b.status) {
            return 1
          }
          return 0;
        });
      }
    },
    methods: {
      handleRowClick(row, event, column) {
        console.log('handleRowClick(', row, event, column, ')');
        this.$emit('rowClick', row);
      }
    }
  }
</script>

<style>
    .layer-table {
        /*width: 100%;*/
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto !important;
    }

    .el-table tr:hover {
        cursor: pointer;
    }

    /*.layer-table.el-table tr.el-table__row.done-row {*/
    /*background-color: #28a745;*/
    /*}*/

    /*.layer-table.el-table tr.el-table__row.running-row {*/
    /*background-color: #007bff;*/
    /*}*/

    /*.layer-table.el-table tr.el-table__row.error-row {*/
    /*background-color: #dc3545;*/
    /*}*/

    /*.layer-table.el-table tr.el-table__row.pending-row {*/
    /*background-color: #ffc107;*/
    /*}*/
</style>
