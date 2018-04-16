<template lang="pug">
    el-container.TrainingDetails(:v-loading='isLoading')
        el-main
            |
            el-card.card(:body-style="{padding:'15px'}")
                |
                el-breadcrumb(separator-class="el-icon-arrow-right")
                    el-breadcrumb-item(:to="{ path: '/' }") 项目{{train.name}}
                    el-breadcrumb-item 训练{{train.rprojectName}}详情
                |
                el-form.table-expand(label-position='left', inline='', size='mini')
                    el-form-item(label='ID: ')
                        span {{ trainObj.rprojectId }}
                    el-form-item(label='状态: ')
                        span {{ trainObj.status_zh }}
                    el-form-item(label='创建时间: ')
                        span {{ trainObj.display_createDate }}
                    el-form-item(label='修改时间: ')
                        span {{ trainObj.display_modifyDate }}
                    el-form-item(label='基础镜像类型: ')
                        span {{ trainObj.imageType }}
                    el-form-item(label='分布式存储路径: ')
                        el-input(placeholder='无', v-model='trainObj.workdir', :id="'input_workdir_'+ trainObj.rprojectId", readonly='')
                            el-tooltip.item(slot='append', effect='dark', content='点击复制到剪贴板', placement='bottom', :hide-after='1000')
                                el-button(type='primary', :class="'btn-copy-workdir-' + trainObj.rprojectId", @click="copyToClipBoard(train,'workdir')")
                                    img.icon_clippy(:src='icon_clippy')
                    el-form-item(label='运行目标环境: ')
                        span {{ trainObj.target }}
                    //- el-form-item(label='版本号: ')
                        //- span {{ trainObj.revision }}
            |
            |
            el-tabs.tabs(v-model="activeTab" @tab-click="handleTabClick", type='border-card')
                el-tab-pane(label="路由列表" name="routine" :disabled="isLoading")
                    .routine(v-if='trainObj.tensorboard || trainObj.service_base_url')
                        el-button(@click="goTo('tensorboardUrl')", :disabled='!tensorboardUrl', type="primary", size='mini') 跳转去TensorBoard
                            //- a(:href='tensorboardUrl', target='_blank')
                        |
                        //- a(:href='jupyterUrl') 跳转去Jupyter
                |
                el-tab-pane(label="终端" name="console" :disabled="isLoading")
                    .console(v-if='gottyUrl')
                        iframe.gotty-page(:src="gottyUrl")
                |
                el-tab-pane(label="日志" name="log" :disabled="isLoading")
                    .log-container
                        log(:train_status='log_data.train_status' , :podName='log_data.train_pod', :freq='5000', :timestamp='log_data.trainCreateDate', :switch='activeTab === "log"')

</template>

<script>
    // @flow
    import API from '@/service/api'
    import {webConsoleURLPrefix} from '@/conf/env'
    import ProjectMenu from '@/components/ProjectMenu'
    import Log from '@/components/Log'
    import {isEmpty, extend} from 'lodash'
    import Clipboard from 'clipboard'
    import icon_clippy from '@/assets/images/clippy.svg'
    import format from 'date-fns/format'

    const zh_cn = require('date-fns/locale/zh-CN');

    export default {
        name: 'TrainingDetails',
        metaInfo: {
            titleTemplate: '%s-训练详情'
        },
        props: ["projectType", "trainType"],
        data() {
            return {
                webConsoleURLPrefix, // 跳转外链URL前缀
                icon_clippy: icon_clippy,
                isLoading: false,
                activeTab: 'routine',
                train: {},
                log_data: { // <log/> 所需props
                    train_pod: '',
                    trainCreateDate: null,
                    train_status: ''
                }
            }
        },
        computed: {
            id: function () {
                return this.$route.params.id;
            },
            trainObj: function () {
                if (isEmpty(this.train)) {
                    return {}
                } else {
                    console.log(`this.train.tensorboard: `, typeof this.train.tensorboard);
                    console.log(`this.train.containers: `, typeof this.train.containers);
                    return extend(this.train, {
                        status_zh: `${this.transProjStatus(this.train.status).zh}`,
                        tensorboard: JSON.parse(this.train.tensorboard),
                        containers: JSON.parse(this.train.containers),
                        display_createDate: format(
                            new Date(this.train.createDate),
                            'YYYY[年]MMMD[日] Ah[点]mm[分]ss[秒]',
                            {locale: zh_cn}
                        ),
                        display_modifyDate: format(
                            new Date(this.train.modifyDate),
                            'YYYY[年]MMMD[日] Ah[点]mm[分]ss[秒]',
                            {locale: zh_cn}
                        )
                    })
                }
            },
            gottyUrl: function () {
                if (typeof this.train.containers === 'string' && this.train.containers.trim().length !== 0) {
                    let containers = JSON.parse(this.train.containers);
                    return this.webConsoleURLPrefix + containers[0].base_url;
                } else if (typeof this.train.containers === 'object') {
                    return this.webConsoleURLPrefix + this.train.containers[0].base_url;
                } else {
                    return '';
                }
            },
            tensorboardUrl: function () {
                if (typeof this.train.tensorboard === 'string' && this.train.tensorboard.trim().length !== 0) {
                    let tensorboard = JSON.parse(this.train.tensorboard);
                    return this.webConsoleURLPrefix + tensorboard.service_base_url;
                } else if (typeof this.train.tensorboard === 'object') {
                    return this.webConsoleURLPrefix + this.train.tensorboard.service_base_url;
                } else {
                    return false;
                }
            },
            jupyterUrl: function () {
                if (this.trainObj.service_base_url) {
                    return this.webConsoleURLPrefix + this.trainObj.service_base_url
                } else {
                    return '';
                }
            }
        },
        mounted() {
            console.log(`<TrainingDetails/> mounted: this.projectType: ${this.projectType}, this.trainType: ${this.trainType}`)
            this.fetchTrainData(this.id)
        },
        methods: {
            fetchTrainData() {
                this.isLoading = true;
                API.getTrainById(this.id).then(res => {
                    console.log(`res: `, res)
                    this.train = res;
                    this.isLoading = false;
                }, err => {
                    console.log(`err: `, err);
                    this.isLoading = false;
                    this.$notify({
                        message: `${err.message}`,
                        type: 'error',
                        duration: 0
                    });
                });
            },
            handleTabClick(tab) {
                console.log(`handleTabClick()`, tab);
                switch (tab.name) {
                    case 'routine':
                        return 'routine';
                    case 'console':
                        return 'console';
                    case 'log':
                        return this.handleOpenLog();
                }
            },
            copyToClipBoard(data, prop) {
                console.log(`copyToClipBoard()`, arguments)
                const input = document.getElementById(`input_${prop}_${data.rprojectId}`)
                const clipboard = new Clipboard(`.btn-copy-${prop}-${data.rprojectId}`, {
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
            goTo(url) {
                return window.open(`${this.tensorboardUrl}`, '_blank');
            },
            handleOpenLog() {
                this.log_data.train_pod = this.trainObj.containers[0].name;
                this.log_data.trainCreateDate = this.train.createDate;
                this.log_data.train_status = this.train.status;
                console.log(`this.train: `, this.train);
                console.log(`this.log_data: `, this.log_data);
            },
            transProjStatus(value) {
                switch (value) {
                    case '00':
                        return {
                            zh: '未部署镜像',
                            en: 'waiting'
                        };

                    case '10':
                        return {
                            zh: '正在训练',
                            en: 'training'
                        };

                    case '20':
                        return {
                            zh: '训练成功',
                            en: 'success'
                        };

                    case '30':
                        return {
                            zh: '训练失败',
                            en: 'error'
                        };

                    case '50':
                        return {
                            zh: '创建中',
                            en: 'waiting'
                        };
                    default:
                        break;
                }
            }
        },
        components: {
            ProjectMenu,
            Log
        }
    }
</script>

<style lang="stylus" scoped>
    .TrainingDetails
        background-color antiquewhite
        min-height 100%
        height 100%
        position relative

        > .el-main
            height 100%
            overflow hidden
            padding 0
            display flex
            flex-direction column
            justify-content space-between

            .card
                flex-grow 0
                flex-shrink 0

            .tabs
                height calc(100% - 180px)

                /deep/ .el-tabs__header
                    height 40px

                /deep/ .el-tabs__content
                    height calc(100% - 40px)
                    padding 0
                    width 100%

                    > .el-tab-pane
                        width 100%
                        height 100%

                        > div
                            width 100%
                            height 100%
                            overflow hidden

                .routine
                    padding 15px

    .table-expand
        margin-top 10px
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

    .icon_clippy
        width 12px
        height auto
        max-height 100%
        vertical-align middle

    .text-selected
        color #fff
        background-color #EA5505

    .gotty-page
        width 100%
        height 100%
        overflow hidden

    .log-container
        background-color black
        position relative
        width 1000%
        max-width 100%
        height 100%


</style>
