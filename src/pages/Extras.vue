<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card text-center">
        <h4 class="page-headline text-uppercase">Extras</h4>
        <ul class="pt-4">
          <li>
            <b-button to="/merge-external-account" variant="outline-info" class="mb-3 btn-rounded">Merge external account</b-button>
          </li>
          <!-- <li>
            <b-button to="/merge-close-wallet" variant="outline-info" class="mb-3 btn-rounded">Merge / close wallet</b-button>
          </li> -->
        </ul>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
export default {
  name: 'Extras'
};
</script>
