export default {
  offCanvasMenuOpen: state => state.offCanvasMenuOpen,
  isMobile: state => window.matchMedia('only screen and (max-width: 575px)').matches,
  viewportWidth: state => state.viewportWidth
};
