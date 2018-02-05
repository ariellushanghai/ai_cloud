import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger'
import createPersistedState from 'vuex-persistedstate'
import types from './mutations_types'
import * as actions from './actions';
import _ from 'lodash'

Vue.use(Vuex);

const state = {
  user: {}
};
const getters = {
  global_menu: state => {
    if (_.isEmpty(state.user)) {
      return [];
    }
    return _.map(state.user.resource, r => {
      return {
        'route': types.MENU_ITEMS[r.resource].route,
        'name': types.MENU_ITEMS[r.resource].menu_name
      }
    });
  },
  user_name: state => {
    return state.user.userName;
  }
};

const mutations = {
  [types.SAVE_USER_INFO]: (state, data) => {
    console.log(`SAVE_USER_INFO: `,data)
    state.user = data;
  },
  [types.LOGOUT]: state => {
    state.user = {};
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
