<template lang="pug">
    .project-menu
        h3 项目列表
        el-menu.vertical-menu(router='', unique-opened='', @select='handleSelectMenu', :default-active='defaultActive', text-color='#303133', active-text-color='#fff')
            el-tooltip(v-for='item in menuData', :key='item.proId', effect='dark', :content='item.proName', placement='right')
                el-menu-item(:index="item.index", :route="item.route")
                    span(slot='title') {{item.proName}}
</template>

<script>
    import {map, extend} from 'lodash'

    export default {
        name: "ProjectMenu",
        props: ['data', 'projectType'],
        computed: {
            menuData() {
                return map(this.data, (item) => {
                    return item = extend(item, {
                        index: `${this.middlePath}_${item.proName}`,
                        route: `/${this.middlePath}/${item.proName}`
                    })
                });
            },
            defaultActive() {
                return this.$route.path;
            },
            middlePath() {
                return this.projectType === 'training' ? 'project' : 'development';
            }
        },
        mounted() {
        },
        methods: {
            handleSelectMenu(key, keyPath) {
                console.log('handleSelectMenu(', key, keyPath, ')');
            }
        }
    }
</script>

<style lang="stylus" scoped>
    ping_an-orange = #EA5505

    .project-menu
        width 100%
        overflow-x hidden
        overflow-y hidden
        background-color #fff
        box-shadow 0 2px 12px 0 rgba(0, 0, 0, .1)
        color #303133
        display flex
        flex-direction column

        h3
            text-align center
            font-size 14px
            height 64px
            line-height 64px
            margin 0
            color #606266

        .vertical-menu
            height calc(100% - 64px)
            width 100%
            overflow-x hidden
            overflow-y auto
            border-right none

            /deep/ .el-menu-item
                overflow hidden
                text-overflow ellipsis
            /*text-transform uppercase*/

            /deep/ .el-menu-item.is-active
                background-color: ping_an-orange;
                font-weight bolder

                &:hover
                    cursor not-allowed
</style>
