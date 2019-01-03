export default {
  methods: {
    openMenuAnimation () {
      this.$nextTick(() => {
        const offcanvasMenu = document.getElementById('offcanvas-menu');
        if (offcanvasMenu) {
          offcanvasMenu.style.width = `${this.width}px`;
        }
      });

      const appEl = document.getElementById('app');
      if (appEl) {
        appEl.style.perspective = `${this.viewportWidth}px`;
        appEl.style.perspectiveOrigin = 'center 200px';
        appEl.style.overflow = 'hidden';
      }

      const pageWrapperEl = document.getElementById('page-wrapper');
      if (pageWrapperEl) {
        pageWrapperEl.style.transformOrigin = 'center top';
        pageWrapperEl.style.transformStyle = 'preserve-3d';
        pageWrapperEl.style.transform = `translate3d(${this.width}px, 0, -400px) rotateY(-10deg)`;
        pageWrapperEl.style.overflow = 'hidden';
      }
    },

    closeMenuAnimation () {
      const offcanvasMenu = document.getElementById('offcanvas-menu');
      if (offcanvasMenu) {
        offcanvasMenu.style.width = '';
        offcanvasMenu.style.overflowX = 'hidden';
        setTimeout(() => {
          const offcanvasMenu = document.getElementById('offcanvas-menu');
          if (offcanvasMenu) {
            offcanvasMenu.style.overflowX = '';
          }
        }, 1e3);
      }

      document.getElementById('app').style.overflow = '';

      const pageWrapperEl = document.getElementById('page-wrapper');
      if (pageWrapperEl) {
        pageWrapperEl.style.transform = '';
        pageWrapperEl.style.transformStyle = '';
        pageWrapperEl.style.transformOrigin = '';
        pageWrapperEl.style.overflow = 'auto';
      }
    }
  }
};
