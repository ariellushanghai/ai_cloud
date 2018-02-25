import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger'
import createPersistedState from 'vuex-persistedstate'
import types from './mutations_types'
import * as actions from './actions';
import {isEmpty, map} from 'lodash'

Vue.use(Vuex);

const state = {
  user: {},
  project_list: [],
  visiable_global_header: true
};
const getters = {
  global_menu: state => {
    if (isEmpty(state.user)) {
      return [];
    }
    return map(state.user.resource, r => {
      return {
        'route': types.MENU_ITEMS[r.resource].route,
        'name': types.MENU_ITEMS[r.resource].menu_name
      }
    });
  },
  user_name: state => {
    return state.user.userName;
  },
  visiable_global_header: state => {
    return state.visiable_global_header;
  }
};

const mutations = {
  [types.SAVE_USER_INFO]: (state, data) => {
    console.log(`SAVE_USER_INFO: `, data)
    state.user = data;
  },
  [types.SET_PROJECTS_LIST]: (state, data) => {
    console.log(`SET_PROJECTS_LIST: `, data)
    state.project_list = data;
  },
  [types.LOGOUT]: state => {
    state.user = {};
  },
  [types.HIDE_GLOBAL_HEADER]: state => {
    state.visiable_global_header = false;
  },
  [types.SHOW_GLOBAL_HEADER]: state => {
    state.visiable_global_header = true;
  }
};

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  // actions,
  mutations,
  state,
  getters,
  plugins: [createLogger(),
    createPersistedState({storage: window.sessionStorage})]
});
