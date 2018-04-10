import Router from 'vue-router'
import store from '@/store/'


const UserManager = r => require(['@/pages/UserManager'], r);
const Storage = r => require(['@/pages/Storage'], r);
const ProjectList = r => require(['@/pages/ProjectList'], r);
const ProjectDetails = r => require(['@/pages/ProjectDetails'], r);
const Login = r => require(['@/pages/Login'], r);


const router = new Router({
    routes: [
        {
            name: 'index',
            redirect: {
                name: 'login'
            },
            path: '/'
        },
        {
            name: 'usermanager',
            path: '/usermanager',
            component: UserManager
        },
        {
            name: 'storage',
            path: '/storage',
            component: Storage
        },
        // 模型训练
        {
            name: 'project',
            path: '/project',
            component: ProjectList,
            props: {projectType: 'training', trainType: 'job'}
        },
        // 模型开发
        {
            name: 'development',
            path: '/development',
            component: ProjectList,
            props: {projectType: 'develop', trainType: 'deployment'}
        },
        // 模型训练->训练
        {
            name: 'project_details',
            path: '/project/:name',
            component: ProjectDetails,
            props: {projectType: 'training', trainType: 'job'}
        },
        // 模型开发->训练
        {
            name: 'development_details',
            path: '/development/:name',
            component: ProjectDetails,
            props: {projectType: 'develop', trainType: 'deployment'}
        },
        {
            name: 'login',
            path: '/login',
            component: Login
        }
    ]
});

router.beforeEach((to, from, next) => {
    // console.log(`router.beforeEach(to: `, to, `from: `, from, `next: `, next);
    if (to.name === 'login') {
        store.commit('HIDE_GLOBAL_HEADER');
    } else {
        store.commit('SHOW_GLOBAL_HEADER');
    }
    if (to.name === 'login' || store.getters.user_name) {
        return next();
    } else {
        return next({
            name: 'login'
        });
    }
});

export default router