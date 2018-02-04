<template>
    <div :id="dom_id" :style="{width: '100%', height: height}"></div>
</template>

<script>
  import chart from 'echarts/lib/echarts'
  import 'echarts/lib/chart/gauge'
  import 'echarts/lib/component/tooltip'
  import 'echarts/lib/component/title'

  export default {
    name: 'ChartGauge',
    props: ['title', 'value', 'dom_id', 'height'],
    data: function () {
      return {
        option: {
          title: {
            text: this.title,
            fontFamily: 'Microsoft YaHei',
            fontSize: 16,
            fontWeight: 'bold',
            x: 'center'
          },
          series: [
            {
//            name: '业务指标',
              type: 'gauge',
              radius: '90%',
              splitNumber: 5,
              pointer: {
                length: '90%',
                width: 5
              },
              axisLine: {

                lineStyle: {
                  width: 25,
                  color: [[0.2, '#FA5555'], [0.8, '#EB9E05'], [1, '#67C23A']]
                }
              },
              axisTick: {
                splitNumber: 10
              },
              itemStyle: {
                normal: {
                  // color: '#fff',
                  borderColor: '#fff'
                }
              },
              detail: {
                fontSize: 18,
                fontFamily: 'Microsoft YaHei',
                offsetCenter: [0, '100%'],
                formatter: function (v) {
                  return `完成度: ${v}%`;
                }
              },
              data: [{value: this.value}]
            }
          ]
        }
      }
    },
    mounted: function () {
      this.renderGaugeChart(this.dom_id, this.option);
    },
    methods: {
      renderGaugeChart: (dom_id, option) => {
        console.log('renderGaugeChart(', dom_id, ')');
        let gauge_chart = chart.init(document.getElementById(dom_id));
        gauge_chart.setOption(option);
        return gauge_chart;
      }
    },
    components: {
      chart
    }
  }
</script>

<style scoped>

</style>
