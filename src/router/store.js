import { createStore } from 'vuex';  // Importiere createStore aus vuex für Vue 3

export default createStore({
  state: {
    data: ""  // Initialer Zustand
  },

  mutations: {
    setData(state, newData) {
      state.data = newData;  // Mutation zum Setzen von Daten
    }
  }
});
