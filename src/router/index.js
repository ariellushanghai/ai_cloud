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
    {
      name: 'project',
      path: '/project',
      component: ProjectList
    },
    {
      name: 'project_details',
      path: '/project/:name',
      component: ProjectDetails
    },
    {
      name: 'login',
      path: '/login',
      component: Login
    }
  ]
});

router.beforeEach((to, from, next) => {
  console.log(`router.beforeEach(to: `, to, `from: `, from, `next: `, next);
  if (to.name === 'login' && store.getters.visiable_global_header) {
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