<template>
  <div>
    <div id="offcanvas-menu">
      <slot/>
      <span class="offcanvas-close-btn" @click="closeMenu">&times;</span>
    </div>
    <div class="offcanvas-open-btn" @click="openMenu">
      <i class="icon-hamburger-menu"/>
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex';

export default {
  name: 'Menubar',
  props: {
    width: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapGetters(['offCanvasMenuOpen'])
  },
  mounted () {
    document.addEventListener('keyup', this.closeMenuOnEsc);
    document.addEventListener('click', this.documentClick);
  },
  destroyed () {
    document.removeEventListener('keyup', this.closeMenuOnEsc);
    document.removeEventListener('click', this.documentClick);
  },
  methods: {
    openMenu () {
      this.$emit('openMenu');
      this.$store.commit('mutateOffCanvasMenuOpen', true);
      document.body.classList.add('offcanvas-overlay');
      this.$nextTick(() => {
        document.getElementById('offcanvas-menu').style.width = `${this.width}px`;
      });
    },
    closeMenu () {
      this.$emit('closeMenu');
      this.$store.commit('mutateOffCanvasMenuOpen', false);
      document.body.classList.remove('offcanvas-overlay');
      document.getElementById('offcanvas-menu').style.width = '0px';
    },
    closeMenuOnEsc (e) {
      e = e || window.event;
      if (e.key === 'Escape' || e.keyCode === 27) {
        this.closeMenu();
      }
    },
    documentClick (e) {
      const element = document.querySelector('.offcanvas-open-btn');
      const target = e.target;
      if (element !== target && !element.contains(target) && e.target.className !== 'offcanvas-menu') {
        this.closeMenu();
      }
    }
  }
};
</script>
