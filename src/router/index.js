import Router from 'vue-router'
import {loginURL} from '@/conf/env'


const UserManager = r => require(['@/pages/UserManager'], r);
const Storage = r => require(['@/pages/Storage'], r);
const ProjectList = r => require(['@/pages/ProjectList'], r);
const ProjectDetails = r => require(['@/pages/ProjectDetails'], r);
const Inference = r => require(['@/pages/Inference'], r);


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
      component: ProjectList
    },
    {
      name: 'project_details',
      path: '/project/:id',
      component: ProjectDetails
    },
    {
      name: 'inference',
      path: '/inference',
      component: Inference
    }
  ]
})
