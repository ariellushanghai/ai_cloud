import Router from 'vue-router'
import {loginURL} from '@/conf/env'


const UserManager = r => require(['@/pages/UserManager'], r);
const Storage = r => require(['@/pages/Storage'], r);
const Training = r => require(['@/pages/Training'], r);
const TFProj = r => require(['@/pages/TFProj'], r);
const Solution = r => require(['@/pages/Solution'], r);
const Deployment = r => require(['@/pages/Deployment'], r);


export default new Router({
  routes: [
    {
      name: 'index',
      redirect: {
        name: 'training'
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
      name: 'training',
      path: '/training',
      component: Training
    },
    {
      name: 'tfproj',
      path: '/proj/:name',
      component: TFProj
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