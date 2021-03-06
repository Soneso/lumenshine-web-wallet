<template>
  <form class="form">
    <b-row align-h="center">
      <b-col v-if="!showOwnAssetsDescription" cols="9">
        <div v-if="!result">
          <b-form-group v-if="creatingTemplate" :label-for="`templateNameInput_${uuid}`" label="Template name">
            <b-form-input
              :id="`templateNameInput_${uuid}`"
              v-model="templateName"
              type="text"
              placeholder="Template name"
              required/>
          </b-form-group>

          <hr v-if="creatingTemplate" class="divider">

          <template v-if="availableWallets.length > 1">
            <b-form-group :label-for="`walletInput_${uuid}`" label="Wallet:">
              <b-form-select :id="`walletInput_${uuid}`" v-model="selectedWallet" :options="walletOptions" required/>
            </b-form-group>

            <hr class="divider">
          </template>

          <b-form-group :label-for="`assetCodeInput_${uuid}`" label="Currency:">
            <b-form-select :id="`assetCodeInput_${uuid}`" v-model="assetCode" :options="assetCodeOptions" required/>
            <small v-if="availableAmountToSend !== null">You have {{ availableAmountToSend }} {{ assetCode }} available</small>
          </b-form-group>

          <b-form-group v-if="assetCode === '_other'">
            <b-form-checkbox
              v-model="ownAssetAccepted"
              :aria-describedby="`inputOwnAssetAcceptedFeedback_${uuid}`"
              :class="{ error: $v.ownAssetAccepted.$error }"
              :state="$v.ownAssetAccepted.$error ? 'invalid' : null"
              class="mr-0">
              I understand what <a href="" @click.prevent="showOwnAssetsDescription = true">own assets</a> are and <br>I take full responsibility for my own assets. Lumenshine is not responsible for any asset on the Stellar Network
            </b-form-checkbox>
            <b-form-invalid-feedback :id="`inputOwnAssetAcceptedFeedback_${uuid}`">
              <template v-if="$v.ownAssetAccepted.$error" class="field__errors">
                <template v-if="!$v.ownAssetAccepted.accepted">This message should be accepted.</template>
              </template>
            </b-form-invalid-feedback>
          </b-form-group>

          <a v-if="!creatingTemplate && !contact" href="#" class="text-right d-block my-0 py-0" @click.prevent="$emit('template')">use template</a>
          <hr class="divider mt-1">

          <b-form-group v-if="assetCode === '_other'" :label-for="`customAssetCodeInput_${uuid}`" label="Asset code">
            <b-form-input
              :id="`customAssetCodeInput_${uuid}`"
              :class="{ error: $v.customAssetCode.$error }"
              :aria-describedby="`inputAssetCodeFeedback_${uuid}`"
              :value="customAssetCode"
              :state="!$v.customAssetCode.$error"
              type="text"
              placeholder="Asset code"
              required
              @input.prevent.native="onCustomCodeInput"
              @blur.native="$v.customAssetCode.$touch()"/>
            <b-form-invalid-feedback :id="`inputAssetCodeFeedback_${uuid}`">
              <template v-if="$v.customAssetCode.$error" class="field__errors">
                <template v-if="!$v.customAssetCode.required">Asset code is required!</template>
                <template v-if="!$v.customAssetCode.validAssetCode">Not valid asset code!</template>
              </template>
            </b-form-invalid-feedback>
          </b-form-group>

          <b-form-group v-if="assetCode === '_other'" label="Issuer public key (this stellar account)">
            <public-key :text="data.public_key" color="text-info"/>
          </b-form-group>

          <b-form-group v-if="currentAssetCodeBalances.length > 1" :label-for="`issuerInput_${uuid}`" label="Issuer:">
            <b-form-select :id="`issuerInput_${uuid}`" v-model="issuer" :options="issuerOptions" required/>
          </b-form-group>

          <b-form-group :label-for="`recipientInput_${uuid}`" label="Send to">
            <b-form-input
              :id="`recipientInput_${uuid}`"
              :class="{ error: $v.recipient.$error }"
              :aria-describedby="`inputLiveRecipientFeedback_${uuid}`"
              v-model="recipient"
              :state="!$v.recipient.$error"
              type="text"
              placeholder="Recepient's public key or address"
              required
              @blur.native="$v.recipient.$touch()"/>
            <b-form-invalid-feedback :id="`inputLiveRecipientFeedback_${uuid}`">
              <template v-if="$v.recipient.$error" class="field__errors">
                <template v-if="!$v.recipient.required">Recipient is required!</template>
                <template v-if="!$v.recipient.validRecipient">Not valid recipient!</template>
                <template v-if="!$v.recipient.isTrusted">Not trusted asset!</template>
                <template v-if="!$v.recipient.canFund">Cannot fund user with other asset than XLM!</template>
                <template v-if="!$v.recipient.noDestination">Invalid destination!</template>
              </template>
            </b-form-invalid-feedback>
          </b-form-group>

          <hr class="divider">

          <b-form-group :label-for="`amountInput_${uuid}`">
            <b-row>
              <b-col cols="10" class="pb-3">
                <b-button-group size="sm">
                  <b-button :class="!sendItAll ? 'text-info': 'text-gray-500'" variant="outline-secondary" @click.prevent="sendItAll = false">Amount</b-button>
                  <b-button :disabled="assetCode === '_other'" :class="sendItAll ? 'text-info': 'text-gray-500'" variant="outline-secondary" @click.prevent="sendItAll = true">Send it all</b-button>
                </b-button-group>
              </b-col>
            </b-row>
            <b-row align-v="center">
              <b-col>
                <b-form-input
                  :id="`amountInput_${uuid}`"
                  :class="{ error: $v.amount.$error }"
                  :aria-describedby="`inputLiveAmountHelp_${uuid} inputLiveAmountFeedback_${uuid}`"
                  v-model="amount"
                  :state="!$v.amount.$error"
                  type="text"
                  placeholder="Amount to send"
                  required
                  @blur.native="$v.amount.$touch()"/>
                <b-form-invalid-feedback :id="`inputLiveAmountFeedback_${uuid}`">
                  <template v-if="$v.amount.$error" class="field__errors">
                    <template v-if="!$v.amount.required">Amount is required!</template>
                    <template v-else-if="!$v.amount.decimal">Not valid amount!</template>
                    <template v-else-if="!$v.amount.isNotTooSmall">Too small!</template>
                    <template v-else-if="!$v.amount.isNotTooPrecise">Too many digits after the decimal point!</template>
                    <template v-else-if="!$v.amount.isNotTooLarge">Too large!</template>
                    <template v-else-if="!$v.amount.hasEnoughFunds">Not enough funds!</template>
                  </template>
                </b-form-invalid-feedback>
              </b-col>
              <b-col cols="auto">
                <small>{{ currentAssetCode }}</small>
              </b-col>
            </b-row>
            <b-form-text :id="`inputLiveAmountHelp_${uuid}`">
              Stellar transaction fee: {{ config.STELLAR_BASE_FEE }} XLM
            </b-form-text>
          </b-form-group>

          <hr class="divider">

          <b-form-group :label-for="`memoTypeInput_${uuid}`" label="Memo (optional)">
            <b-form-select :id="`memoTypeInput_${uuid}`" v-model="memoType" :options="memoTypeOptions" :disabled="memoReadOnly"/>
          </b-form-group>

          <b-form-group :label-for="`memoInput_${uuid}`">
            <b-form-input
              :id="`memoInput_${uuid}`"
              :class="{ error: $v.memo.$error }"
              :placeholder="memoPlaceholder"
              :state="!$v.memo.$error"
              :disabled="memoReadOnly"
              :aria-describedby="`inputLiveMemoFeedback_${uuid}`"
              v-model="memo"
              type="text"
              required
              @blur.native="$v.memo.$touch()"/>
            <b-form-invalid-feedback :id="`inputLiveMemoFeedback_${uuid}`">
              <template v-if="$v.memo.$error" class="field__errors">
                <template v-if="$v.memo.required === false">Memo is required when sending payments to exchanges.</template>
                <template v-else-if="$v.memo.maxLength === false">Max length is 28 characters!</template>
                <template v-else-if="$v.memo.validLength === false">Memo should have a length of 64 characters.</template>
                <template v-else-if="$v.memo.validMemo === false">Invalid memo.</template>
              </template>
            </b-form-invalid-feedback>
          </b-form-group>

          <p v-if="memoReadOnly"><strong>Note: </strong>The specified federation address requires this transaction's memo to be a certain value.</p>

          <hr class="divider">

          <template v-if="!creatingTemplate">
            <b-form-group v-if="canSignWithPassword" :label-for="`passwordInput_${uuid}`" label="Password">
              <b-form-input
                :id="`passwordInput_${uuid}`"
                :class="{ error: $v.password.$error }"
                :aria-describedby="`inputLivePasswordFeedback_${uuid}`"
                :state="!$v.password.$error"
                :type="passwordIsHidden ? 'password' : 'text'"
                v-model="password"
                placeholder="Your password"
                autocomplete="new-password"
                required
                @blur.native="$v.password.$touch()"/>

              <password-assets :password="['passwordIsHidden', passwordIsHidden]" class="has-label" @passwordUpdated="updatePasswordState($event)"/>

              <b-form-invalid-feedback :id="`inputLivePasswordFeedback_${uuid}`">
                <template v-if="$v.password.$error" class="field__errors">
                  <template v-if="!$v.password.required">Password is required!</template>
                  <template v-if="!$v.password.decryptValid">Wrong password!</template>
                </template>
              </b-form-invalid-feedback>
            </b-form-group>

            <b-form-group v-if="!canSignWithPassword" :label-for="`signerInput_${uuid}`" label="Select signer for payment">
              <b-form-select :id="`signerInput_${uuid}`" v-model="signer" :options="signers.map(signer => signer.public_key)" placeholder="Signers"/>
              <b-form-input
                :class="{ error: $v.signerSeed.$error }"
                :aria-describedby="`inputLiveSignerSeedHelp_${uuid} inputLiveSignerSeedFeedback_${uuid}`"
                v-model="signerSeed"
                :state="!$v.signerSeed.$error"
                type="text"
                placeholder="Seed for selected signer"
                required
                @blur.native="$v.signerSeed.$touch()"/>
              <b-form-invalid-feedback :id="`inputLiveSignerSeedFeedback_${uuid}`">
                <template v-if="$v.signerSeed.$error" class="field__errors">
                  <template v-if="!$v.signerSeed.required">Secret seed is required!</template>
                  <template v-if="!$v.signerSeed.secretSeed">Invalid secret seed!</template>
                </template>
              </b-form-invalid-feedback>
              <b-form-text :id="`inputLiveSignerSeedHelp_${uuid}`">
                Your secret seed for selected signer.
              </b-form-text>
            </b-form-group>

            <hr class="divider">

            <div class="text-center">
              <div v-if="errors.find(err => err.error_code === 'BAD_SEQUENCE')">
                <small class="text-danger mb-3 d-inline-block">Could not send payment. Wrong sequence number.</small>
              </div>
              <div v-else-if="hasUnknownError">
                <small class="text-danger mb-3 d-inline-block">An error occured, please try again</small>
              </div>

              <b-button variant="info" class="btn-rounded" @click.prevent="onSendClick">
                <spinner v-if="loading" :size="21" :message="`Sending ${currentAssetCode }...`" variant="white" width="130"/>
                <span v-else>Send {{ currentAssetCode }}</span>
              </b-button>
            </div>
          </template>
          <template v-else> <!-- when creating payment template -->
            <div class="text-center">
              <b-button variant="info" class="btn-rounded" @click.prevent="onSendClick">Save</b-button>
            </div>
          </template>
        </div>

        <div v-else-if="result">
          <p><strong>Transaction result</strong></p>
          <p class="small">
            <strong>Status: </strong><strong class="text-success text-uppercase">success</strong><br>
          </p>
          <p class="small">
            <span v-if="currentAssetCodeBalances.length > 1"><strong>Issuer: </strong><small>{{ issuer }}</small><br></span>
            <strong>Amount: {{ amount }} {{ currentAssetCode }}</strong><br>
            <strong>Currency: {{ assetCode === 'XLM' ? 'Stellar Lumens (XLM)' : customAssetCode || assetCode }}</strong>
          </p>
          <p class="small">
            <strong>Recipient: </strong>
            <span v-if="recipient.match(/\*/g)"><strong>{{ recipient }}</strong></span> <!-- federation address -->
            <strong v-else> <!-- public key -->
              <public-key :text="recipient" color="text-info" size="40"/>
            </strong>
          </p>
          <p v-if="memo" class="small">
            <strong>Memo: {{ memo }}</strong><br>
            <strong>Memo Type: {{ memoType }}</strong>
          </p>
          <p class="small">
            <strong>Operation ID: {{ transaction ? transaction.operation.id : '' }}</strong><br>
            <strong>Transaction fee: {{ transactionFee.format() }} XLM</strong>
          </p>
          <div class="text-center py-4">
            <b-button variant="success" class="text-uppercase btn-rounded" @click.prevent="reset">Send other</b-button>
          </div>
        </div>
      </b-col>
      <b-col v-if="showOwnAssetsDescription" cols="11">
        <div>
          <p>
            In the Stellar Network you can send any type of asset. This is a native feature of the decentralized Stellar Network.
            If you want to send own assets with Lumenshine you agree to take full responsibility for your own assets.
            Lumenshine has no control of any asset in the Stellar Network and is not responsible for any asset in the decentralized Stellar Network.
          </p>

          <p>
            Read more about assets <a href="https://www.stellar.org/developers/guides/concepts/assets.html" target="_blank" rel="noopener">here</a><br>
            Read more about issuing assets <a href="https://www.stellar.org/developers/guides/issuing-assets.html" target="_blank" rel="noopener">here</a>
          </p>

          <p>
            Each wallet in the Lumenshine app represents a stellar account. For the receivers of your own asset, to be able to receive your asset,
            they must add a trustline from their stellar account to the stellar account that you use to issue your own asset (issuer account).
          </p>

          <p>
            They can do this in the details section of their wallet by adding a "new currency". They need the
            asset code and the (issuer) public key of the stellar account you are using to issue your asset.
          </p>

          <p>
            Because an asset represents a credit, it disappears when it is sent back to the account that issued it.<br>
            To better track and control the amount of your asset in circulation, you can pay a fixed amount
            of the asset from the issuing account to the working account that you use for normal transactions.
          </p>

          <p>
            Read more about best practices <a href="https://www.stellar.org/developers/guides/issuing-assets.html#best-practices" target="_blank" rel="noopener">here</a>
          </p>

          <p>
            Lumenshine currently does not provide functionality to set the flags of a stellar account. This feature may be added later.
            In the meantime you can use <a href="https://www.stellar.org/laboratory/" target="_blank" rel="noopener">Stellar Laboratory</a> to do that if needed.
            Use the stellar public network to do that for accounts shown in Lumenshine.
          </p>
          <b-button variant="info" class="btn-rounded my-3" @click.prevent="showOwnAssetsDescription = false">Back</b-button>
        </div>
      </b-col>
    </b-row>
  </form>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import _ from 'lodash';
import StellarSdk from 'stellar-sdk';

import Amount from '@/util/Amount';

import config from '@/config';

import formMixin from '@/mixins/form';
import balanceMixin from '@/mixins/balance';
import updatePasswordVisibilityState from '@/mixins/updatePasswordVisibilityState';
import validators from '@/validators';

import spinner from '@/components/ui/spinner';
import truncateInTheMiddle from '@/components/ui/truncateInTheMiddle';
import passwordAssets from '@/components/ui/passwordAssets';
import publicKey from '@/components/ui/publicKey';

export default {
  name: 'SendPaymentForm',
  components: { spinner, truncateInTheMiddle, passwordAssets, publicKey },
  mixins: [ formMixin, balanceMixin, updatePasswordVisibilityState ],

  props: {
    data: {
      type: Object,
      default: null,
    },
    result: {
      type: Object,
      default: null,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    exchanges: {
      type: Object,
      required: true,
    },
    transaction: {
      type: Object,
      default: null,
    },
    availableWallets: { // used in contacts form when users needs to select one wallet
      type: Array,
      default: () => [],
    },
    contact: { // used to prefill forms with contact data
      type: Object,
      default: null,
    },
    creatingTemplate: {
      type: Boolean,
      default: false,
    },
    defaultValues: {
      type: Object,
      default: null,
    },
  },

  data () {
    let recipient = '';
    if (this.defaultValues) {
      recipient = this.defaultValues.recipient_stellar_address || this.defaultValues.recipient_pk;
    } else if (this.contact) {
      recipient = this.contact.stellar_address || this.contact.public_key;
    }

    let assetCode = this.defaultValues ? this.defaultValues.asset_code : 'XLM';
    let customAssetCode = '';
    if (this.defaultValues && this.defaultValues.issuer_pk === this.data.public_key) {
      assetCode = '_other';
      customAssetCode = this.defaultValues.asset_code;
    }

    return {
      templateName: '',
      showOwnAssetsDescription: false,
      ownAssetAccepted: false,
      assetCode,
      customAssetCode,
      recipient: recipient,

      memoReadOnly: false,
      memo: this.defaultValues ? this.defaultValues.memo : '',
      memoType: this.defaultValues ? this.defaultValues.memo_type : 'MEMO_TEXT',

      amount: this.defaultValues ? this.defaultValues.amount : '',

      signer: null,
      signerSeed: '',

      issuer: this.defaultValues ? this.defaultValues.issuer_pk : '',
      password: '',
      passwordIsHidden: true,

      sendItAll: false,

      selectedWallet: 0, // used for contacts, where wallet should be selected on this form
    };
  },

  computed: {
    currentWallet () {
      return this.data || this.availableWallets[this.selectedWallet];
    },
    memoPlaceholder () {
      switch (this.memoType) {
        case 'MEMO_TEXT':
          return 'Up to 28 characters';
        case 'MEMO_ID':
          return 'Enter memo ID number';
        case 'MEMO_HASH':
        case 'MEMO_RETURN':
          return 'Enter 64 characters encoded string';
      }
      return '';
    },
    transactionFee () {
      if (!this.transaction) return new Amount('0');
      return new Amount(`${this.transaction.fee_paid}`).divide('10000000');
    },
    currentAssetCode () {
      return this.assetCode === '_other' ? this.customAssetCode : this.assetCode;
    },
    uniqueCurrencies () {
      if (!this.currentWallet.stellar_data) return [];
      const obj = {};
      this.currentWallet.stellar_data.balances.forEach(bal => {
        obj[bal.asset_code || 'XLM'] = true;
      });
      return Object.keys(obj);
    },
    currentAssetCodeBalances () {
      if (!this.balances) return [];
      return this.balances.filter(b => b.type === this.assetCode);
    },
    signers () {
      if (!this.currentWallet.stellar_data) return [];
      const stellarData = this.currentWallet.stellar_data;
      const threshold = stellarData.thresholds.med_threshold;
      return stellarData.signers.filter(signer => signer.weight >= threshold);
    },
    canSignWithPassword () {
      return true;
      // !!this.signers.find(signer => signer.public_key === this.currentWallet.public_key);
    },
    assetCodeOptions () {
      return [
        ...this.uniqueCurrencies.map(assetCode => ({ text: assetCode === 'XLM' ? 'Stellar Lumens (XLM)' : assetCode, value: assetCode })),
        { text: 'Own asset', value: '_other' },
      ];
    },
    issuerOptions () {
      return this.currentAssetCodeBalances.map(bal => bal.asset_issuer);
    },
    walletOptions () {
      return this.availableWallets.map((wallet, key) => ({ value: key, text: wallet.wallet_name }));
    },
    availableAmountToSend () {
      if (this.currentAssetCodeBalances.length === 0) {
        return null;
      }
      if (this.currentAssetCodeBalances.length > 2) {
        const bal = this.currentAssetCodeBalances.find(bal => bal.issuer === this.issuer);
        return bal ? bal.available : null;
      }
      return this.currentAssetCodeBalances[0].available;
    },
    sendItAllAmount () {
      let amount = new Amount(this.availableAmountToSend);
      if (this.assetCode === 'XLM') {
        amount = amount.minus(config.STELLAR_BASE_FEE);
      }
      return amount.toStellarAmount();
    }
  },

  watch: {
    assetCode (val) {
      if (!this.currentWallet.stellar_data) return;
      const balance = this.currentWallet.stellar_data.balances.find(b => b.asset_code === val);
      this.issuer = balance ? balance.asset_issuer : '';
    },
    selectedWallet () {
      this.assetCode = 'XLM';
    },
    recipient (recipient) {
      if (this.exchanges[recipient] && this.exchanges[recipient].memo) {
        const memo = this.exchanges[recipient].memo;
        this.memoType = memo;
        return;
      }
      this.debouncedMemoFiller();
    },
    memo (val) {
      if (this.memoType === 'MEMO_ID' && val.match(/[a-z]/ig)) {
        this.memoType = 'MEMO_TEXT';
      }
    },
    data () {
      if (!this.canSignWithPassword) {
        this.signer = this.signers[0] ? this.signers[0].public_key : null;
      }
    },
    sendItAll (sendItAll) {
      if (sendItAll) {
        this.amount = this.sendItAllAmount;
      }
    },
    amount (amount) {
      if (this.sendItAll && amount !== this.sendItAllAmount) {
        this.sendItAll = false;
      }
    },
  },

  created () {
    this.memoTypeOptions = [
      'MEMO_TEXT', 'MEMO_ID', 'MEMO_HASH', 'MEMO_RETURN'
    ];
    this.config = config;
    if (!this.canSignWithPassword) {
      this.signer = this.signers[0] ? this.signers[0].public_key : null;
    }
    this.debouncedMemoFiller = _.debounce(async () => {
      const hasValidFederationAddress = validators.federationAddress().federationAddress(this.recipient);
      if (!hasValidFederationAddress) {
        this.memoReadOnly = false;
        return;
      }

      try {
        const federationRecord = await StellarSdk.FederationServer.resolve(this.recipient);
        if (federationRecord.memo && federationRecord.memo_type) {
          this.memoReadOnly = true;
          this.memo = federationRecord.memo;
          const typeMap = { text: 'MEMO_TEXT', id: 'MEMO_ID', hash: 'MEMO_HASH' };
          if (typeMap[federationRecord.memo_type] === undefined) {
            throw new Error('');
          }
          this.memoType = typeMap[federationRecord.memo_type];
        } else {
          this.memoReadOnly = false;
        }
      } catch (err) {
        this.memoReadOnly = false;
      }
    }, 250);
  },

  methods: {
    async reset () {
      this.$v.$reset();
      this.$emit('reset');
      const data = {
        templateName: '',
        showOwnAssetsDescription: false,
        assetCode: 'XLM',
        customAssetCode: '',
        ownAssetAccepted: false,
        recipient: '',
        memoReadOnly: false,
        memo: '',
        memoType: 'MEMO_TEXT',
        amount: '',
        issuer: '',
        password: '',
        signer: null,
        signerSeed: '',
        sendItAll: false,
      };
      Object.keys(data).forEach(d => { this[d] = data[d]; });
    },
    onSendClick () {
      this.$v.$touch();
      if (this.$v.$invalid || this.loading) {
        return;
      }
      const data = {
        templateName: this.templateName,
        recipient: this.recipient,
        assetCode: this.assetCode,
        customAssetCode: this.customAssetCode,
        issuer: this.assetCode === '_other' ? this.data.public_key : this.issuer,
        memo: this.memo,
        memoType: this.memoType,
        amount: this.sendItAll ? this.sendItAllAmount : this.amount,
        ...(this.canSignWithPassword ? {
          password: this.password,
        } : {
          signer: this.signer,
          signerSeed: this.signerSeed,
        }),
        publicKey: this.currentWallet.public_key,
      };
      this.backendQuery = data;

      this.$emit('submit', data);
    },
    onCustomCodeInput (e) {
      if (e.target.value.length > 12) {
        e.target.value = this.customAssetCode;
      }
      this.customAssetCode = e.target.value;
    }
  },

  validations () {
    const isExchange = !!this.exchanges[this.recipient];
    const memoValidators = {
      ...(isExchange ? { required } : {}),
      ...validators.memo.call(this, this.memoType),
    };

    const customAssetCodeValidators = this.assetCode === '_other' ? { required, ...validators.assetCode.call(this) } : {};

    const signerValidators = this.canSignWithPassword ? {
      password: {
        required,
        decryptValid: value => this.backendQuery.password !== value || !this.errors.find(err => err.error_code === 'WRONG_PASSWORD'),
      },
    } : {
      signerSeed: {
        required,
        ...validators.secretSeed.call(this),
      },
    };

    return {
      recipient: {
        required,
        validRecipient: value => validators.publicKey.call(this).publicKey(value) || validators.federationAddress.call(this).federationAddress(value),
        isTrusted: value => this.backendQuery.recipient !== value || this.backendQuery.assetCode !== this.assetCode || !this.errors.find(err => err.error_code === 'NOT_TRUSTED'),
        canFund: value => this.backendQuery.recipient !== value || !this.errors.find(err => err.error_code === 'CANNOT_FUND'),
        noDestination: value => this.backendQuery.recipient !== value || !this.errors.find(err => err.error_code === 'NO_DESTINATION'),
      },
      customAssetCode: {
        ...customAssetCodeValidators,
      },
      memo: {
        ...memoValidators
      },
      ownAssetAccepted: {
        ...(this.assetCode === '_other' ? { accepted: val => !!val } : {}),
      },
      ...(this.creatingTemplate ? {} : signerValidators),
      amount: {
        required,
        ...validators.amount.call(this),
        hasEnoughFunds: value => this.backendQuery.amount !== value || !this.errors.find(err => err.error_code === 'UNDERFUNDED'),
      }
    };
  }
};
</script>
