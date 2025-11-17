<template>
  <div class="standalone-recharge">
    <RechargeOnline :show-history="true" />
  </div>
  <!-- Render the full recharge UI (reuses the component shown on the home page) -->
</template>

<script>
import RechargeOnline from "./HomeComponents/RechargeOnline";

export default {
  components: { RechargeOnline },
  mounted() {
    this.$store.commit("set_dark_mode", true);
    if (!this.$store.state.user_data || !this.$store.state.user_data.id_account) {
      this.$store.commit("get_user_data");
    }
  },
};
</script>

<style scoped>
.standalone-recharge {
  margin-top: 53px;
  padding-top: 1px;
}
</style>
