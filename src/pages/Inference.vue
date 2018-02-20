<template lang="pug">
    el-container.inference(v-loading="isLoading")
        el-main.inference-main
            el-row(type="flex" justify="center")
                el-col
                    el-card(:body-style="{padding:'15px'}" style={'margin-bottom': '10px'})
                        .inference-charts
                            #inference_chart_0
                            div
                                el-progress(:text-inside="true" ":stroke-width"="18" ":percentage"="100")
                                el-progress(:text-inside="true" ":stroke-width"="18" ":percentage"="70")
                            #inference_chart_1

                    el-card(:body-style="{padding:'15px'}")
                        el-table(:data="tableData2" style={'width': '100%'} border)
                            el-table-column(prop="date" label="最近一次使用模型训练" width="180")
                            el-table-column(prop="name" label="总训练时间" width="180")
                            el-table-column(prop="address" label="模型训练次数")
</template>

<script lang="coffeescript">
    import ElCard from "element-ui/packages/card/src/main";

    export default {
        name: 'Inference'

        metaInfo:
            titleTemplate: '%s-算法库'

        data: ->
            {
                isLoading: false
                tableData2: [{
                    date: '2017-11-21 12:12:24'
                    name: '351 小时 51 分 31 秒'
                    address: '1'
                }, {
                    date: '2017-04-01 16:20:36'
                    name: '1 分 8 秒'
                    address: '2'
                }, {
                    date: '2017-04-01 16:20:36'
                    name: '0 秒'
                    address: '333'
                }, {
                    date: '2017-11-21 12:12:24'
                    name: '0 秒'
                    address: '4444'
                }]
            }

        mounted: ->
            @fetchData()
            @drawChart()

        methods:
            fetchData: ->
                loading = this.$loading {
                                            target: '.inference'
                                            lock: true
                                            text: '正在获取数据。。。'
                                            background: 'rgba(250,235,215,0.5)'
                                        }

                window.setTimeout (()-> loading.close()), 500

                API.getUsers().then ((res) -> console.log "res: #{res}"),
                                    ((err) ->
                                        console.log "err: #{err}"
                                        loading.close()
                                        this.$notify {
                                                         message: "#{err}"
                                                         type: 'error'
                                                         duration: 0
                                                     }
                                    )


        components: { ElCard }
    }
</script>

<style scoped>
    .inference {
        background-color: antiquewhite;
        min-height: 100%;
        position: relative;
    }

    .inference-main {
        padding: 10px;
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
    }
</style>
