<template>
  <div class="change-password">
    <div class="title"><strong>đổi mật khẩu</strong></div>
    <form class="form" @submit.prevent="handleSubmit">
          <label>
            <span>Mật khẩu hiện tại</span>
            <div class="input-wrapper">
              <input
                v-model="form.current_password"
                :type="visibility.current ? 'text' : 'password'"
                autocomplete="current-password"
                :disabled="isSubmitting"
              />
              <button
                type="button"
                class="toggle-visibility"
                @click="toggleVisibility('current')"
                :aria-label="visibility.current ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
              >
                <i :class="visibility.current ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
              </button>
            </div>
          </label>
      <div v-if="errors.current_password" class="error">{{ errors.current_password }}</div>

      <label>
        <span>Mật khẩu mới</span>
        <div class="input-wrapper">
          <input
            v-model="form.new_password"
            :type="visibility.new ? 'text' : 'password'"
            autocomplete="new-password"
            :disabled="isSubmitting"
          />
          <button
            type="button"
            class="toggle-visibility"
            @click="toggleVisibility('new')"
            :aria-label="visibility.new ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
          >
            <i :class="visibility.new ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
          </button>
        </div>
      </label>
      <div v-if="errors.new_password" class="error">{{ errors.new_password }}</div>

      <label>
        <span>Xác nhận mật khẩu mới</span>
        <div class="input-wrapper">
          <input
            v-model="form.confirm_password"
            :type="visibility.confirm ? 'text' : 'password'"
            autocomplete="new-password"
            @paste.prevent
            @keydown.ctrl.v.prevent
            @keydown.meta.v.prevent
            :disabled="isSubmitting"
          />
          <button
            type="button"
            class="toggle-visibility"
            @click="toggleVisibility('confirm')"
            :aria-label="visibility.confirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
          >
            <i :class="visibility.confirm ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
          </button>
        </div>
      </label>
      <div v-if="errors.confirm_password" class="error">{{ errors.confirm_password }}</div>

      <button type="submit" :disabled="isSubmitting">
        <strong>{{ isSubmitting ? "Đang xử lý..." : "Đổi mật khẩu" }}</strong>
      </button>

      <div v-if="successMessage" class="success">{{ successMessage }}</div>
      <div v-if="generalError" class="error">{{ generalError }}</div>
    </form>
  </div>
</template>

<script>
import Vue from "vue";

const DEFAULT_STATE = () => ({
  current_password: "",
  new_password: "",
  confirm_password: "",
});

export default {
  data() {
    return {
      form: DEFAULT_STATE(),
      errors: {
        current_password: "",
        new_password: "",
        confirm_password: "",
      },
      generalError: "",
      successMessage: "",
      isSubmitting: false,
      redirectTimer: null,
      visibility: {
        current: false,
        new: false,
        confirm: false,
      },
    };
  },
  methods: {
    resetForm() {
      this.form = DEFAULT_STATE();
    },
    resetErrors() {
      this.errors.current_password = "";
      this.errors.new_password = "";
      this.errors.confirm_password = "";
    },
    setFieldError(field, message) {
      if (Object.prototype.hasOwnProperty.call(this.errors, field)) {
        this.errors[field] = message;
      }
    },
    handleServerErrors(payload, fallbackMessage) {
      if (Array.isArray(payload) && payload.length) {
        payload.forEach((item) => {
          if (item && item.param) {
            this.setFieldError(item.param, item.msg || fallbackMessage);
          }
        });
        const hasError = Object.values(this.errors).some((msg) => msg);
        if (!hasError) {
          this.generalError = payload[0].msg || fallbackMessage;
        }
      } else if (typeof payload === "string") {
        this.generalError = payload;
      } else if (payload && payload.message) {
        this.generalError = payload.message;
      } else {
        this.generalError = fallbackMessage;
      }
    },
    clearMessages() {
      this.resetErrors();
      this.generalError = "";
      this.successMessage = "";
    },
    async handleSubmit() {
      if (this.isSubmitting) return;
      this.clearMessages();

      if (!this.form.current_password || !this.form.new_password || !this.form.confirm_password) {
        if (!this.form.current_password) this.setFieldError("current_password", "Vui lòng nhập mật khẩu hiện tại");
        if (!this.form.new_password) this.setFieldError("new_password", "Vui lòng nhập mật khẩu mới");
        if (!this.form.confirm_password) this.setFieldError("confirm_password", "Vui lòng xác nhận mật khẩu");
        return;
      }

      this.isSubmitting = true;
      try {
        const response = await Vue.axios.post(`${process.env.VUE_APP_URL}/user-change-password`, {
          current_password: this.form.current_password,
          new_password: this.form.new_password,
          confirm_password: this.form.confirm_password,
        });

        const message = (response && response.data && response.data.message) || "Đổi mật khẩu thành công";
        const requireReLogin = response && response.data && response.data.requireReLogin;
        this.successMessage = message;
        this.resetForm();

        if (requireReLogin) {
          localStorage.removeItem("token");
          this.$store.commit("clear_user_data");

          if (this.redirectTimer) {
            clearTimeout(this.redirectTimer);
          }
          this.redirectTimer = setTimeout(() => {
            this.$router.replace({ name: "Login", query: { redirect: "/account" } });
          }, 3000);
        }
      } catch (error) {
        if (error && error.response && error.response.data) {
          this.handleServerErrors(error.response.data, "Đổi mật khẩu thất bại");
        } else {
          this.generalError = "Không thể kết nối đến máy chủ";
        }
      } finally {
        this.isSubmitting = false;
      }
    },
    toggleVisibility(field) {
      if (Object.prototype.hasOwnProperty.call(this.visibility, field)) {
        this.visibility[field] = !this.visibility[field];
      }
    },
  },
  beforeDestroy() {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
      this.redirectTimer = null;
    }
  },
};
</script>

<style lang="scss">
.change-password {
  .form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 14px;

    label {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 0.9rem;
      color: var(--grey-text);

      span {
        text-transform: uppercase;
        font-weight: 700;
      }
    }

    .input-wrapper {
      position: relative;

      input {
        outline: none;
        border: 1px solid var(--grey-text);
        padding: 10px 44px 10px 10px;
        border-radius: 5px;
        font-size: 0.95rem;
        color: var(--black-two);
        background-color: #fff;
        width: 100%;
      }

      .toggle-visibility {
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        width: 28px;
        height: 28px;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--grey-text);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        padding: 0;

        &:hover,
        &:focus {
          color: var(--black-two);
        }

        &:disabled {
          cursor: not-allowed;
        }
      }
    }

    button {
      background-color: var(--red-btn);
      border: none;
      outline: none;
      padding: 10px 16px;
      color: #ffffff;
      font-size: 1rem;
      border-radius: 4px;
      cursor: pointer;
      align-self: flex-start;
      min-width: 180px;
      transition: opacity 0.2s ease;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .error {
      color: #ef4444;
      font-size: 0.85rem;
    }

    .success {
      color: #22c55e;
      font-size: 0.9rem;
      font-weight: 600;
    }
  }
}
</style>
