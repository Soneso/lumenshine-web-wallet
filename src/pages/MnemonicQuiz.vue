<template>
  <div class="page-box form">
    <h1>Setup Wallet</h1>
    <h2>Step 3 of 3</h2>
    <h3>Prove noting of mnemonic</h3>
    <p>To prove the noting of your mnemonic, please complete following quiz.</p>
    <hr>
    <p>Here are 4 random words from the mnemonic. Please indicate their position within the mnemonic.</p>
    <p>The first word starts at position one.</p>
    <table>
      <tr v-for="(word, key) in mnemonicRandomWords" :key="word">
        <td>{{ word }}</td>
        <td><input :class="{ error: fieldErrors[key] }" :value="fields[key]" type="text" placeholder="Position" @input="e => onChangeInput(e, key)"></td>
      </tr>
    </table>
    <hr>
    <button @click="onVerify">Finish setup</button>
    <button @click="onBack">Go back and show mnemonic</button>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

function getWeakRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export default {
  data () {
    return {
      fields: new Array(4).fill(''),
      fieldErrors: new Array(4).fill(false),
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
    // TODO: Just for test
    const mnemonic = this.mnemonic.split(' ');
    this.fields = this.mnemonicRandomWords.map(w => mnemonic.indexOf(w) + 1);
  },
  methods: {
    ...mapActions(['confirmMnemonic']),
    onChangeInput (e, k) {
      const nFields = this.fields.slice();
      if (e.target.value === '') {
        nFields[k] = '';
        this.fields = nFields;
        return;
      }
      nFields[k] = parseInt(e.target.value, 10);
      if (isNaN(nFields[k])) {
        this.fields = this.fields.slice(); // force update
        return;
      }
      this.fields = nFields;
    },
    async onVerify () {
      const values = this.fields.map(f => f !== '' ? f : null);
      const newErrors = new Array(4).fill(false);
      let hasErrors = false;
      const mnemonic = this.mnemonic.split(' ');
      values.forEach((v, k) => {
        if (v === null || v > 24 || v < 1 || mnemonic[v - 1] !== this.mnemonicRandomWords[k]) {
          newErrors[k] = true;
          hasErrors = true;
        }
      });
      this.fieldErrors = newErrors;
      if (hasErrors) {
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

<style lang="scss" scoped>
input {
  width: 140px;
  display: inline-block;
  border: 1px solid #666;
  padding: 5px;
  &.error {
    background: rgb(255, 229, 229);
    border: 1px solid red;
  }
}
button {
  margin-top: 15px;
  padding: 10px 20px;
}
table {
  width: 100%;
}
</style>
