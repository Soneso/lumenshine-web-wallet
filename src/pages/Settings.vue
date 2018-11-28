<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card text-center">
        <h4 class="page-headline text-uppercase">Settings</h4>
        <ul class="pt-4">
          <li>
            <b-button to="/change-password" variant="outline-info" class="mb-3 btn-rounded">Change Password</b-button>
          </li>
          <li>
            <b-button to="/change-tfa" variant="outline-info" class="mb-3 btn-rounded">Change 2FA Secret</b-button>
          </li>
          <li>
            <b-button to="/backup-mnemonic" variant="outline-info" class="mb-3 btn-rounded">Backup Secret/Mnemonic</b-button>
          </li>
          <li>
            <b-button to="/personal-data" variant="outline-info" class="mb-3 btn-rounded">Personal data</b-button>
          </li>
        </ul>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
export default {
  name: 'Settings'
};
</script>
