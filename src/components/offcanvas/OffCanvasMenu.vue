<template>
  <div id="offcanvas-menu">
    <slot/>
    <div v-if="offCanvasMenuOpen" class="offcanvas-close-btn" @click.stop="closeMenu">
      <i class="icon-arrow-left text-white"/>
    </div>
    <div v-else class="offcanvas-open-btn" @click.stop="openMenu">
      <i class="icon-hamburger-menu text-white"/>
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex';

export default {
  name: 'OffCanvasMenu',
  data () {
    return {
      width: 220,
      collapsedWidth: 64
    };
  },
  computed: {
    ...mapGetters(['offCanvasMenuOpen', 'viewportWidth'])
  },
  mounted () {
    document.addEventListener('keyup', this.closeMenuOnEsc);
    document.addEventListener('click', this.closeMenuOnDocumentClick);
  },
  destroyed () {
    document.removeEventListener('keyup', this.closeMenuOnEsc);
    document.removeEventListener('click', this.closeMenuOnDocumentClick);
  },
  methods: {
    openMenu () {
      this.$store.commit('mutateOffCanvasMenuOpen', true);
      this.openMenuAnimation();
    },
    closeMenu () {
      this.$store.commit('mutateOffCanvasMenuOpen', false);
      this.closeMenuAnimation();
    },
    closeMenuOnEsc (e) {
      e = e || window.event;
      if (e.key === 'Escape' || e.keyCode === 27) {
        this.closeMenu();
      }
    },
    closeMenuOnDocumentClick (e) {
      const element = document.getElementById('offcanvas-menu');
      if (this.offCanvasMenuOpen && element !== e.target && !element.contains(e.target)) {
        this.closeMenu();
      }
    },
    openMenuAnimation () {
      document.body.classList.add('offcanvas-overlay');
      this.$nextTick(() => {
        document.getElementById('offcanvas-menu').style.width = `${this.width}px`;
      });

      document.querySelector('#app').style.perspective = `${this.viewportWidth}px`;
      document.querySelector('#app').style.overflow = 'hidden';

      document.querySelector('#page-wrapper').style.transform = `translate3d(${this.width}px, 0px, -400px ) rotateY(-10deg)`;
      document.querySelector('#page-wrapper').style.transformStyle = 'preserve-3d';
      document.querySelector('#page-wrapper').style.overflow = 'hidden';
    },
    closeMenuAnimation () {
      document.body.classList.remove('offcanvas-overlay');
      document.getElementById('offcanvas-menu').style.width = '';

      document.querySelector('#app').style.overflow = '';

      document.querySelector('#page-wrapper').style.transform = '';
      document.querySelector('#page-wrapper').style.transformStyle = '';
      document.querySelector('#page-wrapper').style.transformOrigin = '';
      document.querySelector('#page-wrapper').style.overflow = 'auto';
    }
  }
};
</script>
