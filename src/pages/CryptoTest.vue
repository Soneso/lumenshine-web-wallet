<template>
  <div class="page-box">

    <p>Password: <input v-model="password" type="text"></p>
    <p>kdf salt: {{ kdfSalt }} <input type="button" value="Regenerate salt" @click="onRegenerateSalt"></p>
    <p>kdf password: {{ kdfPass }} <input type="button" value="Rederive password" @click="onDerivePassword"></p>
    <br><br>

    <p>master key: {{ masterKey }} <input type="button" value="Regenerate master key" @click="onRegenerateMasterKey"></p>
    <p>master key iv: {{ masterKeyIV }} <input type="button" value="Regenerate master key iv" @click="onRegenerateMasterKeyIV"></p>
    <p>encrypted master key: {{ encryptedMasterKey }}</p>
    <p>decrypted master key: {{ decryptedMasterKey }}</p>
    <br><br>

    <p>Mnemonic: {{ mnemonic }} {{ mnemonic.split(' ').length }} <input type="button" value="Regenerate Mnemonic" @click="onGenerateMnemonic"></p>
    <p>Public key 0: {{ publicKey0 }}</p>
    <p>Public key 188: {{ publicKey188 }}</p>
    <p>Mnemonic iv: {{ mnemonicIV }} <input type="button" value="Regenerate mnemonic iv" @click="onRegenerateMnemonicIV"></p>
    <p>Encrypted Mnemonic: {{ encryptedMnemonic }}</p>
    <p>Decrypted Mnemonic: {{ decryptedMnemonic }}</p>
    <br><br>

    <input type="button" value="Compute" @click="compute">

  </div>
</template>

<script>
import workerCaller from '@/util/workerCaller';

export default {
  data () {
    return {
      mnemonic: 'raccoon satoshi fog bubble reward cute master reunion hat jaguar quiz uncover rail one congress uphold inspire leg bench proud net tank leave agree',
      mnemonicIV: 'A1nyzM5aoukgq/g2jiJj4A==',
      password: 't3stPassword',
      kdfSalt: 'exA5syEa9wRBEU8ty/IA9HBFqzo/0qtzIAlNLIYS8xY=',
      kdfPass: 'CKhgVBXbu/Qq3gxV/4naiXm3WAfkpDd+bOHH2dNXqe8=',
      masterKey: '0X46Q4MVpC5gXz/DsWg4GYTWI41SziFnz8+sg+SDrTk=',
      masterKeyIV: '77rrl7raJoFjaeb0X9GCfw==',
      encryptedMasterKey: '',
      decryptedMasterKey: '',
      encryptedMnemonic: '',
      decryptedMnemonic: '',
      publicKey0: '',
      publicKey188: ''
    };
  },
  watch: {
    password () {
      this.kdfPass = '';
      this.encryptedMasterKey = '';
      this.decryptedMasterKey = '';
    }
  },
  methods: {
    async onGenerateMnemonic () {
      this.mnemonic = '';
      this.mnemonic = await workerCaller('generateMnemonic');
    },
    async onDerivePassword () {
      this.kdfPass = '';
      this.kdfPass = await workerCaller('derivePassword', this.password, this.kdfSalt);
    },
    async onRegenerateSalt () {
      this.kdfSalt = await workerCaller('generateSalt');
    },
    async onRegenerateMasterKey () {
      this.masterKey = await workerCaller('generateMasterKey');
    },
    async onRegenerateMasterKeyIV () {
      this.masterKeyIV = await workerCaller('generateIV');
    },
    async onRegenerateMnemonicIV () {
      this.mnemonicIV = await workerCaller('generateIV');
    },
    async compute () {
      this.publicKey0 = '';
      this.publicKey188 = '';
      this.encryptedMasterKey = '';
      this.decryptedMasterKey = '';
      this.encryptedMnemonic = '';
      this.decryptedMnemonic = '';

      this.publicKey0 = await workerCaller('getPublicKey', this.mnemonic, 0);
      this.publicKey188 = await workerCaller('getPublicKey', this.mnemonic, 188);
      this.encryptedMasterKey = await workerCaller('cryptMasterKey', this.kdfPass, this.masterKeyIV, this.masterKey);
      this.decryptedMasterKey = await workerCaller('decryptMasterKey', this.kdfPass, this.masterKeyIV, this.encryptedMasterKey);
      this.encryptedMnemonic = await workerCaller('cryptMnemonic', this.masterKey, this.mnemonicIV, this.mnemonic);
      this.decryptedMnemonic = await workerCaller('decryptMnemonic', this.masterKey, this.mnemonicIV, this.encryptedMnemonic);
    }
  },
};
</script>

<style scoped>

</style>
