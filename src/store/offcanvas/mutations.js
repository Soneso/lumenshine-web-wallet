export default {
  mutateOffCanvasMenuOpen (state, offCanvasMenuOpen) {
    state.offCanvasMenuOpen = offCanvasMenuOpen;
  },
  mutateMq: (state) => {
    // global/_bootrap-variables.scss at ~#185-191
    // $grid-breakpoints: (
    //   xs: 0,
    //   sm: 576px,
    //   md: 768px,
    //   lg: 992px,
    //   xl: 1200px
    // ) !default;
    const mq = {
      xs: window.matchMedia('only screen and (max-width: 575px)').matches,
      xsp: window.matchMedia('only screen and (max-width: 575px) and (orientation: portrait').matches,
      xsl: window.matchMedia('only screen and (max-width: 575px) and (orientation: landscape').matches,
      sm: window.matchMedia('only screen and (min-width: 576px) and (max-width: 767px)').matches,
      smp: window.matchMedia('only screen and (min-width: 576px) and (max-width: 767px) and (orientation: portrait').matches,
      sml: window.matchMedia('only screen and (min-width: 576px) and (max-width: 767px) and (orientation: landscape').matches,
      md: window.matchMedia('only screen and (min-width: 768px) and (max-width: 991px)').matches,
      mdp: window.matchMedia('only screen and (min-width: 768px) and (max-width: 991px) and (orientation: portrait').matches,
      mdl: window.matchMedia('only screen and (min-width: 768px) and (max-width: 991px) and (orientation: landscape').matches,
      lg: window.matchMedia('only screen and (min-width: 992px) and (max-width: 1199px)').matches,
      xl: window.matchMedia('only screen and (min-width: 1200px)').matches,
    };

    for (let q in mq) {
      if (mq[q]) {
        state.mq = q;
      }
    }
  },
  mutateViewportWidth (state, viewportWidth) {
    state.viewportWidth = viewportWidth;
  }
};
