<template>
  <div>
    <div id="offcanvas-menu">
      <slot/>
      <span class="offcanvas-close-btn" @click="closeMenu">
        <i class="icon-arrow-left text-white"/>
      </span>
    </div>
    <div class="offcanvas-open-btn" @click="openMenu">
      <i class="icon-hamburger-menu"/>
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex';

export default {
  name: 'OffCanvasMenu',
  props: {
    width: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      viewportWidth: 0
    };
  },
  computed: {
    ...mapGetters(['offCanvasMenuOpen'])
  },
  mounted () {
    document.addEventListener('keyup', this.closeMenuOnEsc);
    document.addEventListener('click', this.documentClick);

    this.viewportWidth = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
    window.addEventListener('resize', () => {
      this.viewportWidth = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
    }, true);
  },
  destroyed () {
    document.removeEventListener('keyup', this.closeMenuOnEsc);
    document.removeEventListener('click', this.documentClick);
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
    documentClick (e) {
      const element = document.getElementById('offcanvas-menu');
      if (element !== e.target && !element.contains(e.target)) {
        this.closeMenu();
      }
    },
    openMenuAnimation () {
      document.body.classList.add('offcanvas-overlay');
      this.$nextTick(() => {
        document.getElementById('offcanvas-menu').style.width = `${this.width}px`;
      });

      document.querySelector('#page-wrapper').style.transform = `translate3d(${this.width}px, 0px, -400px ) rotateY(-10deg)`;
      document.querySelector('#page-wrapper').style.transition = 'all .25s ease 0s';
      document.querySelector('#page-wrapper').style.transformStyle = 'preserve-3d';
      document.querySelector('#page-wrapper').style.overflow = 'hidden';

      document.querySelector('#app').style.perspective = `${this.viewportWidth}px`;
      document.querySelector('#app').style.overflow = 'hidden';
      document.querySelector('#app').style.height = '100%';
    },
    closeMenuAnimation () {
      document.body.classList.remove('offcanvas-overlay');
      document.getElementById('offcanvas-menu').style.width = '0px';

      document.querySelector('#page-wrapper').style.transition = 'all .25s ease 0s';
      document.querySelector('#page-wrapper').style.transform = '';
      document.querySelector('#page-wrapper').style.transformStyle = '';
      document.querySelector('#page-wrapper').style.transformOrigin = '';
      document.querySelector('#page-wrapper').style.overflow = 'auto';

      document.querySelector('#app').style.overflow = '';
      document.querySelector('#app').style.height = '';
    }
  }
};
</script>
