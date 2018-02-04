<template>
  <el-container class="admin" v-loading="isLoading">
    <el-main class="admin-main">
      <el-row type="flex" justify="center">
        <el-col>
          <el-card :body-style="{padding:'15px'}" style="margin-bottom: 10px;">
            <div class="admin-charts">
              <div id="admin_chart_0"></div>
              <div>
                <el-progress :text-inside="true" :stroke-width="18" :percentage="0"></el-progress>
                <el-progress :text-inside="true" :stroke-width="18" :percentage="70"></el-progress>
                <el-progress :text-inside="true" :stroke-width="18" :percentage="100" status="success"></el-progress>
                <el-progress :text-inside="true" :stroke-width="18" :percentage="50" status="exception"></el-progress>
              </div>
              <div id="admin_chart_1"></div>
              <div></div>
            </div>
          </el-card>
          <el-card :body-style="{padding:'15px'}">
            <el-table
              :data="tableData2"
              style="width: 100%"
              border>
              <el-table-column
                prop="date"
                label="最近一次使用模型训练"
                width="180">
              </el-table-column>
              <el-table-column
                prop="name"
                label="总训练时间"
                width="180">
              </el-table-column>
              <el-table-column
                prop="address"
                label="模型训练次数">
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
  import echarts from 'echarts/lib/echarts'
  import 'echarts/lib/chart/pie'
  import 'echarts/lib/chart/line'
  import 'echarts/lib/component/tooltip'
  import 'echarts/lib/component/title'
  import ElCard from "element-ui/packages/card/src/main";

  export default {
    name: 'Admin',
    metaInfo: {
      titleTemplate: '%s-管理'
    },
    data() {
      return {
        isLoading: false,
        tableData2: [{
          date: '2017-11-21 12:12:24',
          name: '351 小时 51 分 31 秒',
          address: '1',
        }, {
          date: '2017-04-01 16:20:36',
          name: '1 分 8 秒',
          address: '2'
        }, {
          date: '2017-04-01 16:20:36',
          name: '0 秒',
          address: '333',
        }, {
          date: '2017-11-21 12:12:24',
          name: '0 秒',
          address: '4444'
        }]
      }
    },
    computed: {},
    mounted() {
      this.fetchData();
      this.drawChart();
    },
    methods: {
      fetchData() {
        let loading = this.$loading({
          target: '.admin',
          lock: true,
          text: '正在获取数据。。。',
          background: 'rgba(250,235,215,0.5)'
        });
        setTimeout(() => {
          loading.close();
        }, 500);
        // API.getAll().then(res => {
        //   this.$store.dispatch('buildTree', res);
        //   loading.close();
        // }, err => {
        //   console.log(`err: `, err);
        //   loading.close();
        //   this.$notify({
        //     message: `${err}`,
        //     type: 'error',
        //     duration: 0
        //   });
        // });
      },
      drawChart() {
        let chart0 = echarts.init(document.getElementById('admin_chart_0'));
        let chart1 = echarts.init(document.getElementById('admin_chart_1'));
        chart0.setOption({
          title: {
            text: 'Tensorflow 模型类型（692）',
            subtext: '',
            x: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            data: ['样例', '非样例']
          },
          series: [
            {
              name: '模型类型',
              type: 'pie',
              radius: '55%',
              center: ['50%', '60%'],
              data: [
                {value: 335, name: '样例'},
                {value: 310, name: '非样例'}
              ],
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        });
        chart1.setOption({
          title: {
            text: '堆叠区域图'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#6a7985'
              }
            }
          },
          legend: {
            data: ['邮件营销', '联盟广告', '视频广告', '直接访问', '搜索引擎']
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              boundaryGap: false,
              data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: [
            {
              name: '邮件营销',
              type: 'line',
              stack: '总量',
              areaStyle: {normal: {}},
              data: [120, 132, 101, 134, 90, 230, 210]
            },
            {
              name: '联盟广告',
              type: 'line',
              stack: '总量',
              areaStyle: {normal: {}},
              data: [220, 182, 191, 234, 290, 330, 310]
            },
            {
              name: '视频广告',
              type: 'line',
              stack: '总量',
              areaStyle: {normal: {}},
              data: [150, 232, 201, 154, 190, 330, 410]
            },
            {
              name: '直接访问',
              type: 'line',
              stack: '总量',
              areaStyle: {normal: {}},
              data: [320, 332, 301, 334, 390, 330, 320]
            },
            {
              name: '搜索引擎',
              type: 'line',
              stack: '总量',
              label: {
                normal: {
                  show: true,
                  position: 'top'
                }
              },
              areaStyle: {normal: {}},
              data: [820, 932, 901, 934, 1290, 1330, 1320]
            }
          ]
        });
      }
    },
    components: {ElCard}
  }
</script>

<style scoped>
  .admin {
    background-color: antiquewhite;
    min-height: 100%;
    position: relative;
  }

  .admin-main {
    padding: 10px;
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }

  .admin-charts {
    width: 100%;
    height: 250px;
    display: flex;
  }

  .admin-charts > div {
    width: 25%;
    height: 100%;
  }

  .el-progress--line {
    margin-bottom: 15px;
  }
</style>
