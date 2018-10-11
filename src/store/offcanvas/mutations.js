export default {
  mutateOffCanvasMenuOpen (state, offCanvasMenuOpen) {
    state.offCanvasMenuOpen = offCanvasMenuOpen;
  },
  mutateIsMobile: (state, isMobile) => {
    state.isMobile = !!isMobile;
  }
};
