<template>
  <div>
    <br>
    <h5>Currency details</h5>
    Currency: {{ assetCode }}<br>
    Issuer public key: <public-key :text="issuer" color="text-secondary"/><br>
    Home domain: {{ homeDomain }}<br>
    <br>
    <h6>Organisation details</h6>

    Name: {{ details.DOCUMENTATION.ORG_NAME || 'not found' }}<br>

    <span v-if="details.DOCUMENTATION.ORG_DBA">Doing business as: {{ details.DOCUMENTATION.ORG_DBA }}<br></span>

    URL:
    <a v-if="details.DOCUMENTATION.ORG_URL" :href="details.DOCUMENTATION.ORG_URL" target="_blank" rel="noopener noreferer">{{ details.DOCUMENTATION.ORG_URL }} <span v-if="!details.DOCUMENTATION.ORG_URL.startsWith('https://')" class="text-danger">(not secure)</span></a>
    <template v-else>not found</template>
    <br>

    <span v-if="details.DOCUMENTATION.ORG_LOGO">Logo: <img :src="details.DOCUMENTATION.ORG_LOGO" style="max-width: 60px"><br></span>

    Description: {{ details.DOCUMENTATION.ORG_DESCRIPTION || 'not found' }}<br>

    Official Email address:
    <a v-if="details.DOCUMENTATION.ORG_TWITTER" :href="`mailto:${details.DOCUMENTATION.ORG_OFFICIAL_EMAIL}`" target="_blank" rel="noopener noreferer">{{ details.DOCUMENTATION.ORG_OFFICIAL_EMAIL }} <span v-if="!details.DOCUMENTATION.ORG_OFFICIAL_EMAIL.endsWith('@' + homeDomain)" class="text-danger">(incompatible domain)</span></a>
    <template v-else>not found</template>
    <br>

    Physical address: {{ details.DOCUMENTATION.ORG_PHYSICAL_ADDRESS || 'not found' }}<br>

    Physical address attestation:
    <a v-if="details.DOCUMENTATION.ORG_PHYSICAL_ADDRESS_ATTESTATION" :href="details.DOCUMENTATION.ORG_PHYSICAL_ADDRESS_ATTESTATION" target="_blank" rel="noopener noreferer">
      {{ details.DOCUMENTATION.ORG_PHYSICAL_ADDRESS_ATTESTATION }}
      <span v-if="!details.DOCUMENTATION.ORG_PHYSICAL_ADDRESS_ATTESTATION.startsWith('https://')" class="text-danger">(not secure) </span>
      <span v-if="!details.DOCUMENTATION.ORG_PHYSICAL_ADDRESS_ATTESTATION.endsWith('@' + homeDomain)" class="text-danger">(incompatible domain)</span>
    </a>
    <template v-else>not found</template>
    <br>

    Phone number: {{ details.DOCUMENTATION.ORG_PHONE_NUMBER || 'not found' }}<br>

    Phone number attestation:
    <a v-if="details.DOCUMENTATION.ORG_PHONE_NUMBER_ATTESTATION" :href="details.DOCUMENTATION.ORG_PHONE_NUMBER_ATTESTATION" target="_blank" rel="noopener noreferer">
      {{ details.DOCUMENTATION.ORG_PHONE_NUMBER_ATTESTATION }}
      <span v-if="!details.DOCUMENTATION.ORG_PHONE_NUMBER_ATTESTATION.startsWith('https://')" class="text-danger">(not secure) </span>
      <span v-if="!details.DOCUMENTATION.ORG_PHONE_NUMBER_ATTESTATION.endsWith('@' + homeDomain)" class="text-danger">(incompatible domain)</span>
    </a>
    <template v-else>not found</template>
    <br>

    Keybase: {{ details.DOCUMENTATION.ORG_KEYBASE || 'not found' }}<br>

    Twitter:
    <a v-if="details.DOCUMENTATION.ORG_TWITTER && validURL(details.DOCUMENTATION.ORG_TWITTER)" :href="`${details.DOCUMENTATION.ORG_TWITTER}`" target="_blank" rel="noopener noreferer">{{ details.DOCUMENTATION.ORG_TWITTER }}</a>
    <a v-if="details.DOCUMENTATION.ORG_TWITTER" :href="`https://twitter.com/${details.DOCUMENTATION.ORG_TWITTER}`" target="_blank" rel="noopener noreferer">{{ details.DOCUMENTATION.ORG_TWITTER }}</a>
    <template v-else>not found</template>
    <br>

    Github:
    <a v-if="details.DOCUMENTATION.ORG_GITHUB && validURL(details.DOCUMENTATION.ORG_GITHUB)" :href="details.DOCUMENTATION.ORG_GITHUB" target="_blank" rel="noopener noreferer">{{ details.DOCUMENTATION.ORG_GITHUB }}</a>
    <a v-if="details.DOCUMENTATION.ORG_GITHUB" :href="`https://github.com/${details.DOCUMENTATION.ORG_GITHUB}`" target="_blank" rel="noopener noreferer">{{ details.DOCUMENTATION.ORG_GITHUB }}</a>
    <template v-else>not found</template>
    <br>

    <span v-if="details.DOCUMENTATION.ORG_LICENSING_AUTHORITY">Licensing authority: {{ details.DOCUMENTATION.ORG_LICENSING_AUTHORITY }}<br></span>
    <span v-if="details.DOCUMENTATION.ORG_LICENSE_TYPE">Licensing type: {{ details.DOCUMENTATION.ORG_LICENSE_TYPE }}<br></span>
    <span v-if="details.DOCUMENTATION.ORG_LICENSE_NUMBER">Licensing number: {{ details.DOCUMENTATION.ORG_LICENSE_NUMBER }}<br></span>

    <template v-if="currencyDetails">
      <br>
      <h6>Currency details</h6>
      <span v-if="currencyDetails.name">Name: {{ currencyDetails.name }}<br></span>
      <span v-if="currencyDetails.desc">Description: {{ currencyDetails.desc }}<br></span>
      <span v-if="currencyDetails.conditions">Conditions: {{ currencyDetails.conditions }}<br></span>
      <span v-if="currencyDetails.image">Image: <img :src="currencyDetails.image" style="max-width: 60px"><br></span>
      <span v-if="currencyDetails.code">Code: {{ currencyDetails.code }}<br></span>
      <span v-if="currencyDetails.code_template">Code template: {{ currencyDetails.code_template }}<br></span>
      <span v-if="currencyDetails.issuer">Issuer: {{ currencyDetails.issuer }}<br></span>
      <span v-if="currencyDetails.status">Status: {{ currencyDetails.status }}<br></span>
      <span v-if="currencyDetails.display_decimals">Number of decimals to show: {{ currencyDetails.display_decimals }}<br></span>
      <span v-if="currencyDetails.fixed_number">Fixes number of tokens: {{ currencyDetails.fixed_number }}<br></span>
      <span v-if="currencyDetails.max_number">Max number of tokens: {{ currencyDetails.max_number }}<br></span>
      <span v-if="currencyDetails.is_unlimited !== undefined">Is unlimited: {{ currencyDetails.is_unlimited ? 'true' : 'false' }}<br></span>
      <span v-if="currencyDetails.is_asset_anchored !== undefined">Is asset anchored: {{ currencyDetails.is_asset_anchored ? 'true' : 'false' }}<br></span>
      <span v-if="currencyDetails.anchor_asset_type">Type of asset anchored: {{ currencyDetails.anchor_asset_type }}<br></span>
      <span v-if="currencyDetails.anchor_asset">Anchor asset: {{ currencyDetails.anchor_asset }}<br></span>
      <span v-if="currencyDetails.redemption_instructions">Redemption instructions: {{ currencyDetails.redemption_instructions }}<br></span>
      <span v-if="currencyDetails.collateral_addresses">Collateral addresses: <span v-for="addr in currencyDetails.collateral_addresses" :key="addr">{{ addr }} </span><br></span>
      <span v-if="currencyDetails.collateral_address_messages">Collateral address messages: <span v-for="msg in currencyDetails.collateral_address_messages" :key="msg">{{ msg }} </span><br></span>
      <span v-if="currencyDetails.collateral_address_messages">Collateral address signitures: <span v-for="signiture in currencyDetails.collateral_address_messages" :key="signiture">{{ signiture }} </span><br></span>
      <span v-if="currencyDetails.regulated !== undefined">Regulated: {{ currencyDetails.regulated ? 'true' : 'false' }}<br></span>
      <span v-if="currencyDetails.approval_server">Approval server: {{ currencyDetails.approval_server }}<br></span>
      <span v-if="currencyDetails.approval_criteria">Approval criteria: {{ currencyDetails.approval_criteria }}<br></span>
    </template>

    <template v-if="details.PRINCIPALS && details.PRINCIPALS.length > 0">
      <br>
      <h6>Principals</h6>
      <ul>
        <li v-for="principal in details.PRINCIPALS" :key="principal.name + principal.email">
          <span v-if="principal.name">Name: {{ principal.name }}<br></span>
          <span v-if="principal.email">Email: <a :href="`mailto:${principal.emailL}`" target="_blank" rel="noopener noreferer">{{ principal.email }}</a><br></span>
          <span v-if="principal.github">Github: <a :href="`https://github.com/${principal.github}`" target="_blank" rel="noopener noreferer">{{ principal.github }}}</a><br></span>
          <span v-if="principal.keybase">Keybase: {{ principal.keybase }}<br></span>
          <span v-if="principal.telegram">Telegram: {{ principal.telegram }}<br></span>
          <span v-if="principal.twitter">Twitter: <a :href="`https://twitter.com/${principal.twitter}`" target="_blank" rel="noopener noreferer">{{ principal.twitter }}</a><br></span>
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
import publicKey from '@/components/ui/publicKey';
export default {
  name: 'IssuerDetails',
  components: { publicKey },
  props: {
    details: {
      type: Object,
      required: true
    },
    issuer: {
      type: String,
      required: true
    },
    assetCode: {
      type: String,
      required: true
    },
    homeDomain: {
      type: String,
      required: true
    },
  },
  computed: {
    currencyDetails () {
      if (!this.details || !this.details.CURRENCIES) return null;
      return this.details.CURRENCIES.find(curr => curr.code === this.assetCode && curr.issuer === this.issuer);
    },
  },
  methods: {
    validURL (str) {
      if (str.startsWith('http://') || str.startsWith('https://')) return true;
      return false;
    }
  }
};
</script>
