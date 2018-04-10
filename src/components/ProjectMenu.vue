<template lang="pug">
    el-menu.vertical-menu(router='', unique-opened='', @select='handleSelectMenu', :default-active='defaultActive', text-color='#303133', active-text-color='#000')
        el-tooltip(v-for='item in data', :index='String(item.proName)', :key='item.proId', effect='dark', :content='item.proName', placement='right')
            el-menu-item(:index="String('/' + middlePath + '/' +item.proName)", :route="String('/' + middlePath + '/' +item.proName)")
                span(slot='title') {{item.proName}}
</template>

<script>
    export default {
        name: "ProjectMenu",
        props: ['data', 'projectType'],
        data() {
            return {};
        },
        computed: {
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
    .vertical-menu
        width 100%
        overflow-x hidden
        overflow-y auto
        border 1px solid #ebeef5
        background-color #fff
        box-shadow 0 2px 12px 0 rgba(0, 0, 0, .1)
        color #303133

    .vertical-menu /deep/ .el-menu-item
        overflow hidden
        text-overflow ellipsis

    .vertical-menu /deep/ .el-menu-item.is-active
        background-color: #ecf5ff;
        font-weight bolder
</style>
