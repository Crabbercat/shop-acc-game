import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const cachedUser = () => {
  try {
    const raw = localStorage.getItem("user_data");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

const persistUser = (data) => {
  if (!data || !Object.keys(data).length) {
    localStorage.removeItem("user_data");
    return;
  }
  localStorage.setItem("user_data", JSON.stringify(data));
};

export default new Vuex.Store({
  state: {
    darkMode: true,
    user_data: cachedUser(),
  },
  mutations: {
    get_user_data(state) {
      Vue.axios
        .get(`${process.env.VUE_APP_URL}/get-home-page-user-data`)
        .then((res) => {
          if (res.data) {
            state.user_data = { ...res.data };
            persistUser(state.user_data);
          } else {
            state.user_data = {};
            persistUser(state.user_data);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    set_user_data(state, payload) {
      state.user_data = payload || {};
      persistUser(state.user_data);
    },
    clear_user_data(state) {
      state.user_data = {};
      persistUser(state.user_data);
    },
  },
  actions: {},
  modules: {},
});
