export default {
  methods: {
    openMenuAnimation () {
      this.$nextTick(() => {
        if (document.getElementById('offcanvas-menu')) {
          document.getElementById('offcanvas-menu').style.width = `${this.width}px`;
        }
      });

      document.querySelector('#app').style.perspective = `${this.viewportWidth}px`;
      document.querySelector('#app').style.overflow = 'hidden';

      document.querySelector('#page-wrapper').style.transform = `translate3d(${this.width}px, 0px, -400px ) rotateY(-10deg)`;
      document.querySelector('#page-wrapper').style.transformStyle = 'preserve-3d';
      document.querySelector('#page-wrapper').style.overflow = 'hidden';
    },
    closeMenuAnimation () {
      if (document.getElementById('offcanvas-menu')) {
        document.getElementById('offcanvas-menu').style.width = '';
        document.getElementById('offcanvas-menu').style.overflowX = 'hidden';
        setTimeout(() => {
          document.getElementById('offcanvas-menu').style.overflowX = '';
        }, 1e3);
      }

      document.querySelector('#app').style.overflow = '';

      document.querySelector('#page-wrapper').style.transform = '';
      document.querySelector('#page-wrapper').style.transformStyle = '';
      document.querySelector('#page-wrapper').style.transformOrigin = '';
      document.querySelector('#page-wrapper').style.overflow = 'auto';
    }
  }
};
