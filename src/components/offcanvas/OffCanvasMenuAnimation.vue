<template>
  <div>
    <Menu :width="width" @openMenu="push" @closeMenu="pull">
      <slot/>
    </Menu>
  </div>
</template>

<script>
import Menu from './OffCanvasMenu';
export default {
  name: 'PushRotate',
  components: { Menu },
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
  mounted () {
    this.viewportWidth = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
    window.addEventListener('resize', () => {
      this.viewportWidth = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
    }, true);
  },
  methods: {
    push () {
      document.querySelector('#page-wrapper').style.transform = `translate3d(${this.width}px, 0px, ${-2 * this.width}px ) `;
      document.querySelector('#page-wrapper').style.transition = 'all .25s ease 0s';
      document.querySelector('#page-wrapper').style.transformStyle = 'preserve-3d';
      document.querySelector('#page-wrapper').style.overflow = 'hidden';
      document.querySelector('#app').style.perspective = `${this.viewportWidth}px`;
      document.querySelector('#app').style.overflow = 'hidden';
      document.querySelector('#app').style.height = '100%';
    },
    pull () {
      document.querySelector('#page-wrapper').style.transform = '';
      document.querySelector('#page-wrapper').style.transition = 'all .25s ease 0s';
      document.querySelector('#page-wrapper').style.transformStyle = '';
      document.querySelector('#page-wrapper').style.transformOrigin = '';
      document.querySelector('#page-wrapper').style.overflow = 'auto';
      document.querySelector('#app').style.perspective = '';
      document.querySelector('#app').style.overflow = '';
      document.querySelector('#app').style.height = '';
    }
  }
};
</script>
