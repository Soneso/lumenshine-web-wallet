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
                <a v-b-toggle.q1 href="#" class="d-block font-weight-500 mt-1 text-info">Q 1</a>
                <b-collapse id="q1" accordion="accordion1" role="tabpanel">
                  <p class="mt-3"> I start opened because <code>visible</code> is <code>true</code></p>
                  <p class="mb-0"> {{ text }}</p>
                </b-collapse>
              </li>
              <li>
                <hr class="divider light">
                <a v-b-toggle.q2 href="#" class="d-block font-weight-500 mt-1 text-info">Q 2</a>
                <b-collapse id="q2" accordion="accordion1" role="tabpanel">
                  <p class="mt-3 mb-0"> {{ text }} </p>
                </b-collapse>
              </li>
              <li>
                <hr class="divider light">
                <a v-b-toggle.q3 href="#" class="d-block font-weight-500 mt-1 text-info">Q 3</a>
                <b-collapse id="q3" accordion="accordion1" role="tabpanel">
                  <p class="mt-3 mb-0"> {{ text }} </p>
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
                  <span class="pt-3 text-gray-600 pb-2 d-block">Maecenas velit purus, volutpat ut convallis ac, fermentum porttitor eros. Fusce tortor elit, rutrum id quam vitae, luctus ultricies leo.</span>
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
                  <span class="pt-3 text-gray-600 pb-2 d-block">Maecenas velit purus, volutpat ut convallis ac, fermentum porttitor eros. Fusce tortor elit, rutrum id quam vitae, luctus ultricies leo.</span>
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
                  <span class="pt-3 text-gray-600 pb-2 d-block">Maecenas velit purus, volutpat ut convallis ac, fermentum porttitor eros. Fusce tortor elit, rutrum id quam vitae, luctus ultricies leo.</span>
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
                  <span class="pt-3 text-gray-600 pb-2 d-block">Maecenas velit purus, volutpat ut convallis ac, fermentum porttitor eros. Fusce tortor elit, rutrum id quam vitae, luctus ultricies leo.</span>
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
