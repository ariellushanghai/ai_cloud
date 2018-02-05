import Router from 'vue-router'
import {loginURL} from '@/conf/env'


const UserManager = r => require(['@/pages/UserManager'], r);
const Storage = r => require(['@/pages/Storage'], r);
const Project = r => require(['@/pages/Project'], r);
const Solution = r => require(['@/pages/Solution'], r);
const Deployment = r => require(['@/pages/Deployment'], r);


export default new Router({
  routes: [
    {
      name: 'index',
      redirect: {
        name: 'project'
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
    {
      name: 'project',
      path: '/project',
      component: Project
    },
    {
      name: 'solution',
      path: '/solution',
      component: Solution
    },
    {
      name: 'deployment',
      path: '/deployment',
      component: Deployment
    }
  ]
})
