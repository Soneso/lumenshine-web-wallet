export default {
  setIsMobile: ({ commit }, payload) => {
    const isMobile = window.matchMedia('only screen and (max-width: 767px)').matches
    commit('mutateIsMobile', isMobile);
  }
};
