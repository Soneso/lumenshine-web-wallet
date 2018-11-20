<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="12" sm="11" md="10" lg="9" xl="8">
      <b-card class="p-4">
        <b-row>
          <b-col cols="12" sm="6" md="5" lg="4" xlg="3">
            <h1><small class="text-info">Introducing</small> <span class="font-weight-800 text-primary">Lumenshine (beta)</span></h1>
            <p class="lead">Lumenshine is a beautiful, full-featured Wallet for the public Stellar network. It is developed and maintained by Soneso GmbH, Germany. Sign-Up and interact with the Stellar network with ease.</p>
          </b-col>
          <b-col>
            <img src="/static/app-screenshot.png">
          </b-col>
          <b-col cols="12" class="pt-5 text-center">
            <b-button href="/register" size="lg" variant="outline-success" class="btn-rounded text-uppercase mx-3">sign up</b-button>
            <b-button href="/login" size="lg" variant="outline-info" class="btn-rounded text-uppercase mx-3">log in</b-button>
          </b-col>
          <b-col cols="12" class="pt-5 mt-5">
            <h2 class="text-info">Full featured and beautiful</h2>
            <p class="lead">With Lumenshine you can manage your Stellar accounts, send and receive payments, add an manage your assets from the Stellar network. Add short Stellar federation addresses to your accounts, set inflation destination for airdrops, mange contacts, search, filter and view your transactions, receive push notifications on your iPhone and much more. Lumenshine is beautiful, userfreindly and focuesd on security.</p>
          </b-col>
          <b-col cols="12" class="pt-5 my-5">
            <h3 class="text-info">Fast and cheap</h3>
            <p>Transactions settle in seconds and you only have to pay the Stellar network transaction fee. No transaction fee has to be payed to Lumenshine.</p>
          </b-col>
          <b-col cols="12" class="pt-5 my-5">
            <h3 class="text-info">Available for web and soon for mobile</h3>
            <p>Lumenshine is currently available for web and we will soon release our mobile apps for iOS and Android soon.</p>
          </b-col>
          <b-col cols="12" class="pt-5 my-5">
            <h3 class="text-info">Beta version</h3>
            <p>This version of Lumenshine is currently beta.</p>
          </b-col>
          <b-col cols="12" class="pt-5 my-5">
            <h3 class="text-info">Stellar network</h3>
            <p>The Stellar network is hosted by numerous distributed nodes world-wide who are not under the control of any single entity or groups of entities. Lumenshine is only an interface for the Stellar network and does not control the Stellar network.</p>
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
