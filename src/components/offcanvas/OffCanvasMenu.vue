<template>
  <div id="offcanvas-menu" :class="[{'expanded': offCanvasMenuOpen, 'collapsed': !offCanvasMenuOpen}]">
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
import { mapGetters } from 'vuex';
import offcanvasNavigation from '../../mixins/offcanvasNavigation.js';

export default {
  name: 'OffCanvasMenu',
  mixins: [offcanvasNavigation],
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
    }
  }
};
</script>
