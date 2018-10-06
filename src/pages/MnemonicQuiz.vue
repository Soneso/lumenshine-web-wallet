<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 text-center">
        <h4 class="form-headline text-uppercase pl-2">Setup Wallet</h4>
        <small class="text-secondary">Step 3 of 3</small>
        <h6 class="text-danger pt-3">Prove noting of mnemonic</h6>
        <p>To prove the noting of your mnemonic, please complete following quiz.</p>
        <hr class="divider light">
        <p>Here are 4 random words from the mnemonic. Please indicate their position within the mnemonic.</p>
        <p>The first word starts at position one.</p>

        <b-row v-for="(word, index) in mnemonicRandomWords" :key="word" class="w-50 m-auto">
          <b-col cols="6" class="text-right px-2">
            <div class="pt-2">{{ word }}</div>
          </b-col>
          <b-col cols="6" class="px-2">
            <b-form-group>
              <b-form-input
                id="login-email"
                :class="['default-placeholders', { error: hasErrors }]"
                :value="fields[index]"
                type="text"
                placeholder="position"
                @input="value => onChangeInput(value, index)"/>
            </b-form-group>
          </b-col>
        </b-row>
        <b-button type="submit" variant="info" size="lg" class="btn-rounded mb-4" @click="onVerify">Finish</b-button>
        <br>
        <b-button type="submit" variant="warning" size="lg" class="btn-rounded" @click="onBack">Go back and show mnemonic</b-button>
        <div v-if="hasErrors" class="text-danger py-2">Invalid input!<br></div>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

// import config from '@/config';

function getWeakRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export default {
  data () {
    return {
      fields: new Array(4).fill(''),
      hasErrors: false,
    };
  },
  computed: {
    ...mapGetters(['confirmMnemonicStatus', 'userStatus', 'mnemonic']),
    mnemonicRandomWords () {
      if (!this.mnemonic) {
        return [];
      }
      const words = [];
      let numberOfWords = 4;
      const remainingWords = this.mnemonic.split(' ');
      while (numberOfWords-- > 0) {
        const index = getWeakRandomInt(0, remainingWords.length - 1);
        words.push(remainingWords[index]);
        remainingWords.splice(index, 1);
      }
      return words;
    }
  },
  created () {
    // if (config.IS_TEST_NETWORK) {
    //   const mnemonic = this.mnemonic.split(' ');
    //   this.fields = this.mnemonicRandomWords.map(w => mnemonic.indexOf(w) + 1);
    // }
  },
  methods: {
    ...mapActions(['confirmMnemonic']),
    onChangeInput (value, k) {
      this.hasErrors = false;
      const nFields = this.fields.slice();
      if (value === '') {
        nFields[k] = '';
        this.fields = nFields;
        return;
      }
      nFields[k] = parseInt(value, 10);
      if (isNaN(nFields[k])) {
        this.fields = this.fields.slice(); // force update
        return;
      }
      this.fields = nFields;
    },
    async onVerify () {
      const values = this.fields.map(f => f !== '' ? f : null);
      this.hasErrors = false;
      const mnemonic = this.mnemonic.split(' ');
      values.forEach((v, k) => {
        if (v === null || v > 24 || v < 1 || mnemonic[v - 1] !== this.mnemonicRandomWords[k]) {
          this.hasErrors = true;
        }
      });
      if (this.hasErrors) {
        return;
      }

      await this.confirmMnemonic();
      this.$router.push({ name: 'Dashboard' });
    },
    onBack () {
      this.$router.push({ name: 'ShowMnemonic' });
    }
  },
};
</script>
