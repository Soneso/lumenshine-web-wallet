<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="12" sm="11" md="10" lg="9" xl="8">
      <b-card class="p-4">
        <b-row>
          <b-col cols="12" sm="6" md="5" lg="4" xlg="3">
            <h1><small class="text-info">Introducing</small> <span class="font-weight-800 text-primary">Lumenshine</span></h1>
            <p class="lead">Lumenshine is a Wallet for the public Stellar network. Lumenshine is developed and maintained by Soneso GmbH, Germany. The Stellar network is hosted by numerous distributed nodes world-wide who are not under the control of any single entity or groups of entities. Lumenshine does not control the Stellar network.</p>
          </b-col>
          <b-col>
            <img src="/static/app-screenshot.png">
          </b-col>
          <b-col cols="12" class="pt-5 text-center">
            <b-button size="lg" variant="outline-success" class="btn-rounded text-uppercase mx-3">sign up</b-button>
            <b-button size="lg" variant="outline-info" class="btn-rounded text-uppercase mx-3">log in</b-button>
          </b-col>
          <b-col cols="12" class="pt-5 mt-5">
            <h2 class="text-info">All assets, peer-to-peer</h2>
            <p class="lead">StellarX is built on Stellar’s universal order book. Trades happen directly between traders. No middlemen, no miners. You trade from your own wallet and keep total control of your keys.</p>
          </b-col>
          <b-col cols="12" class="pt-5 my-5">
            <h3 class="text-info">Fast and actually free</h3>
            <p>Transactions settle in seconds, and trading on StellarX costs nothing. We refund your network fees and we even return Stellar’s automatic 1% APR inflation to our users, keeping none of the weekly airdrops for ourselves.</p>
          </b-col>
        </b-row>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
export default {
  name: 'LandingPage'
};
</script>
