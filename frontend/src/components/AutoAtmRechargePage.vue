<template>
  <div class="auto-atm-page">
    <div class="auto-atm-wrap">
      <header class="page-headline">
        <p class="eyebrow">Dịch vụ nạp tự động</p>
        <h1>NẠP ATM/MOMO TẶNG 25% TỰ ĐỘNG 24/24</h1>
        <p class="sub">
          Nạp tiền qua BIDV hoặc ví Momo, tiền sẽ cộng vào ví sau 5 − 30
          giây. Chú ý nhập đúng nội dung chuyển khoản để hệ thống tự nhận diện.
        </p>
      </header>
      <AutoAtmRecharge />
    </div>
  </div>
</template>

<script>
import AutoAtmRecharge from "@/components/UserAccountComponents/AutoAtmRecharge";

export default {
  components: { AutoAtmRecharge },
  mounted() {
    this.$store.commit("set_dark_mode", true);
    if (!this.$store.state.user_data || !this.$store.state.user_data.id_account) {
      this.$store.commit("get_user_data");
    }
  },
};
</script>

<style scoped>
.auto-atm-page {
  width: 100%;
  min-height: calc(100% - 74px);
  margin-top: 74px;
  padding-top: 1px;
}

.auto-atm-wrap {
  max-width: var(--max-width);
  margin: 30px auto 60px auto;
  padding: 24px 12px 60px 12px;
  position: relative;
  overflow: hidden;
  z-index: 0;
}

.auto-atm-wrap::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.75) 0%,
    rgba(15, 23, 42, 0.85) 60%,
    rgba(0, 0, 0, 0.9) 100%
  );
  pointer-events: none;
  z-index: -1;
}

.page-headline {
  text-align: center;
  margin-bottom: 30px;
}

.page-headline .eyebrow {
  text-transform: uppercase;
  color: var(--yellow-active);
  margin-bottom: 6px;
  font-weight: 700;
}

.page-headline h1 {
  font-size: 2rem;
  margin: 0 0 10px 0;
  color: #ffffff;
}

.page-headline .sub {
  color: rgba(226, 232, 240, 0.9);
  max-width: 720px;
  margin: 0 auto;
  line-height: 1.4;
}

.auto-atm-page ::v-deep .auto-atm-recharge {
  color: rgba(248, 250, 252, 0.94);
}

.auto-atm-page ::v-deep .auto-atm-recharge .guide-block {
  border: 1px solid rgba(226, 232, 240, 0.2);
  background-color: rgba(15, 23, 42, 0.65);
  border-radius: 8px;
}

.auto-atm-page ::v-deep .auto-atm-recharge > .title,
.auto-atm-page ::v-deep .auto-atm-recharge > .red-text {
  display: none;
}

.auto-atm-page ::v-deep .auto-atm-recharge .guide-block .left h2,
.auto-atm-page ::v-deep .auto-atm-recharge .guide-block .left p {
  color: rgba(248, 250, 252, 0.94);
}

.auto-atm-page ::v-deep .auto-atm-recharge .guide-block .detail p {
  color: rgba(226, 232, 240, 0.92);
}

.auto-atm-page ::v-deep .auto-atm-recharge .border-dashed {
  border-color: rgba(248, 113, 113, 0.9);
}

.auto-atm-page ::v-deep .auto-atm-recharge .btn-copy span {
  background-color: rgba(148, 163, 184, 0.35);
}

.auto-atm-page ::v-deep .auto-atm-recharge .border-grey {
  border-color: rgba(148, 163, 184, 0.35);
}

.auto-atm-page ::v-deep .auto-atm-recharge .transfer-confirm-block input {
  border-color: rgba(148, 163, 184, 0.5);
  background: rgba(15, 23, 42, 0.8);
  color: #e2e8f0;
}

@media (max-width: 768px) {
  .page-headline h1 {
    font-size: 1.5rem;
  }
  .page-headline .sub {
    font-size: 0.95rem;
  }
}
</style>
