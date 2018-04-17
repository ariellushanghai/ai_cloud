<template lang="pug">
    .bg
        span 页面没找到，即将返回首页。。。
</template>

<script>

    export default {
        name: 'NotFound',
        metaInfo: {
            titleTemplate: '%s-404'
        },
        mounted() {
            return setTimeout(_ => {
                this.$router.replace({name: 'index'});
            }, 3000);
        }
    }
</script>

<style lang="stylus" scoped>
    ping_an-orange = #EA5505
    .bg
        background-color ping_an-orange
        color white
        width 100%
        height 100%
        display flex
        justify-content center
        align-items center

        span
            font-size 20px
</style>
