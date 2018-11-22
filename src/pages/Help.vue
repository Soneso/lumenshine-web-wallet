<template>
  <b-row align-h="center" align-v="center">
    <b-col sm="10" md="7">
      <b-card class="p-4">
        <b-row>
          <b-col cols="12">
            <h3 class="form-headline text-uppercase pb-4">Help</h3>
          </b-col>

          <b-col cols="12">
            <hr class="divider light">
            <a href="mailto:support@lumenshine.com?subject=Lumenshine Support">
              <h6>
                <i class="icon-mail"/>
                <span class="pl-2">Support inbox</span>
              </h6>
            </a>

            <hr class="divider light">
            <h5 class="font-weight-600 text-info mt-4 py-3">FAQ</h5>
            <ul id="help-faq" role="tablist">
              <li>
                <hr class="divider light">
                <a v-b-toggle.q1 href="#" class="d-block font-weight-500 mt-1 text-info">How can I fund my wallet?</a>
                <b-collapse id="q1" accordion="accordion1" role="tabpanel">
                  <!--<p class="mt-3"> I start opened because <code>visible</code> is <code>true</code></p>-->
                  <p class="mb-0"><br>In order to prevent people from making a huge number of unnecessary accounts, each account in the Stellar Network must have a minimum balance of 1 XLM (Stellar Lumen). Press the "Fund Wallet" button of your wallet and send Lumens to the displayed Account ID/Public key. At least 1 XLM is needed to fund your wallet in the Stellar Network. We recommend a minimum of 2 XLM.<br><br>Q: I don't have Stellar Lumens. Where can I get Stellar Lumens (XLM)?<br><br>A: You can pay an exchange that sells Stellar Lumens in order to fund your wallet. CoinMarketCap maintains a list of exchanges that sell Stellar Lumens (XML). After purchasing the lumens, withdraw them from the exchange to your wallet by sending them to the displayed Account ID/Public key in order to fund your wallet.<br></p>
                </b-collapse>
              </li>
              <li>
                <hr class="divider light">
                <a v-b-toggle.q2 href="#" class="d-block font-weight-500 mt-1 text-info">How can I setup the inflation destination to receive airdrops?</a>
                <b-collapse id="q2" accordion="accordion1" role="tabpanel">
                  <p class="mt-3 mb-0"><br>You can set the inflation destination in the details section of your wallet. Press the "Details" button and scroll to "Set inflation destination". Then press the set button and choose from the list of known inflation destinations or provide your own data. If you provide your own data, you must insert the Account ID/Public key of the inflation destination account you want to vote for.</p>
                </b-collapse>
              </li>
              <li>
                <hr class="divider light">
                <a v-b-toggle.q3 href="#" class="d-block font-weight-500 mt-1 text-info">How can I receive other assets and currencies than Stellar Lumens?</a>
                <b-collapse id="q3" accordion="accordion1" role="tabpanel">
                  <p class="mt-3 mb-0"><br>You can accept other assets and currencies than Stellar Lumens in the details section of your wallet. Press the "Details" button and scroll to "Currencies". Next, press the "add currency" button and provide the AccountID/Public key of the issuer and the asset code of the currency you would like to accept. Only assets and currencies from the Stellar Network can be added. This will create a trustline to the inserted issuer account and asset code so that you can now accept that asset or currency.<br><br>After adding the trustline, go back to your wallet and press the "Receive" button. You can now select the new currency from the provided dropdown. Insert the data and send it to the person you want to obtain the assets from.<br></p>
                </b-collapse>
              </li>
              <li>
                <hr class="divider light">
                <a v-b-toggle.q4 href="#" class="d-block font-weight-500 mt-1 text-info">How can I send Stellar Lumens and other currencies?</a>
                <b-collapse id="q4" accordion="accordion1" role="tabpanel">
                  <p class="mt-3 mb-0"><br>You can send Stellar Lumens and other assets or currencies by pressing the "Send" button of your wallet. Fill the form, enter your password and submit. You can only send assets that you have in your wallet.<br><br>The recepient must also trust and be able to receive the asset (other then Stellar Lumens) you would like to send. If she did not yet accept the asset you want to send, an error message will be dispayed.<br></p>
                </b-collapse>
              </li>
            </ul>

            <hr class="divider light">
            <h5 class="font-weight-600 text-info mt-4 py-3">Topics</h5>

            <ul id="help-topics">
              <li>
                <hr class="divider light">
                <ul v-b-toggle.basics class="py-3">
                  <li>
                    <i class="icon-bag large text-info"/>
                  </li>
                  <li>
                    <h6 class="mb-0">Basics</h6>
                    <span>Guide to getting started with Lumenshine</span>
                  </li>
                </ul>
                <b-collapse id="basics" accordion="accordion2" role="tabpanel">
                  <span class="pt-3 text-gray-600 pb-2 d-block">Coming soon</span>
                </b-collapse>
              </li>
              <li>
                <hr class="divider light">
                <ul v-b-toggle.security class="py-3">
                  <li>
                    <i class="icon-security large text-info"/>
                  </li>
                  <li>
                    <h6 class="mb-0">Security</h6>
                    <span>Learn how to keep your Wallets safe</span>
                  </li>
                </ul>
                <b-collapse id="security" accordion="accordion2" role="tabpanel">
                  <span class="pt-3 text-gray-600 pb-2 d-block">Coming soon</span>
                </b-collapse>
              </li>
              <li>
                <hr class="divider light">
                <ul v-b-toggle.wallets class="py-3">
                  <li>
                    <i class="icon-wallet large text-info"/>
                  </li>
                  <li>
                    <h6 class="mb-0">Wallets</h6>
                    <span>Learn how to master all Wallet features</span>
                  </li>
                </ul>
                <b-collapse id="wallets" accordion="accordion2" role="tabpanel">
                  <span class="pt-3 text-gray-600 pb-2 d-block">coming soon</span>
                </b-collapse>
              </li>
              <li>
                <hr class="divider light">
                <ul v-b-toggle.stellar class="py-3">
                  <li>
                    <i class="icon-learn-ico large text-info"/>
                  </li>
                  <li>
                    <h6 class="mb-0">Stellar</h6>
                    <span>Learn more about Stellar</span>
                  </li>
                </ul>
                <b-collapse id="stellar" accordion="accordion2" role="tabpanel">
                  <span class="pt-3 text-gray-600 pb-2 d-block">Coming soon</span>
                </b-collapse>
              </li>
            </ul>
          </b-col>
        </b-row>

      </b-card>
    </b-col>
  </b-row>
</template>

<script>
export default {
  name: 'Help',
  data () {
    return {
      text: `
        Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry
        richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor
        brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon
        tempor, sunt aliqua put a bird on it squid single-origin coffee nulla
        assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore
        wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher
        vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic
        synth nesciunt you probably haven't heard of them accusamus labore VHS.
      `
    };
  }
};
</script>
