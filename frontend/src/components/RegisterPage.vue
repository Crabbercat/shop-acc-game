<template>
  <div class="register-page">
    <div class="wrap-login-form">
      <p class="title"><strong>Đăng ký tài khoản</strong></p>
      <div class="border-b"></div>
      <div class="form">
        <p><strong>Tên tài khoản</strong></p>
        <input
          v-model="username"
          type="text"
          placeholder="Nhập tên tài khoản"
        />
        <p v-if="error.username" class="error-message">
          <strong>{{ error.username }}</strong>
        </p>
        <p><strong>Số điện thoại</strong></p>
        <input
          v-model="phone_number"
          type="number"
          placeholder="Nhập số điện thoại"
        />
        <p v-if="error.phone_number" class="error-message">
          <strong>{{ error.phone_number }}</strong>
        </p>
        <p><strong>Mật khẩu</strong></p>
        <div class="input-wrapper">
          <input
            v-model="password"
            :type="passwordVisibility.password ? 'text' : 'password'"
            placeholder="Nhập mật khẩu"
            autocomplete="new-password"
          />
          <button
            type="button"
            class="toggle-visibility"
            @click="togglePasswordVisibility('password')"
            :aria-label="passwordVisibility.password ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
          >
            <i :class="passwordVisibility.password ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
          </button>
        </div>
        <p v-if="error.password" class="error-message">
          <strong>{{ error.password }}</strong>
        </p>
        <p><strong>Nhập lại mật khẩu</strong></p>
        <div class="input-wrapper">
          <input
            v-model="re_password"
            :type="passwordVisibility.confirm ? 'text' : 'password'"
            placeholder="Nhập lại mật khẩu"
            autocomplete="new-password"
            @paste.prevent
            @keydown.ctrl.v.prevent
            @keydown.meta.v.prevent
          />
          <button
            type="button"
            class="toggle-visibility"
            @click="togglePasswordVisibility('confirm')"
            :aria-label="passwordVisibility.confirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
          >
            <i :class="passwordVisibility.confirm ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
          </button>
        </div>
        <p v-if="error.re_password" class="error-message">
          <strong>{{ error.re_password }}</strong>
        </p>
        <p>
          <strong
            >Lưu ý nhập đúng số điện thoại. Khi quên, mất mật khẩu chúng tôi sẽ
            cung cấp lại mật khẩu cho bạn thông qua số điện thoại</strong
          >
        </p>
      </div>
      <div class="btn-login" @click="send_register_req">Đăng ký</div>
      <router-link class="btn-create-new" :to="{ name: 'Login' }">
        Đăng nhập
      </router-link>
    </div>
  </div>
</template>

<script>
import Vue from "vue";

export default {
  data() {
    return {
      username: null,
      phone_number: null,
      password: null,
      re_password: null,

      error: {
        username: null,
        phone_number: null,
        password: null,
        re_password: null,
      },
      passwordVisibility: {
        password: false,
        confirm: false,
      },
    };
  },

  async mounted() {
    this.$store.commit("set_dark_mode", false);
    this.$store.commit("get_user_data");

    let _this = this;
    setTimeout(() => {
      if (_this.$store.state.user_data && _this.$store.state.user_data.id_account)
        _this.$router.push("/");
    }, 0);
  },

  methods: {
    send_register_req() {
      let username = this.username;
      let phone_number = this.phone_number;
      let password = this.password;
      let re_password = this.re_password;
      let _this = this;

      this.remove_error();

      // Validate required fields
      if (!username || !phone_number || !password || !re_password) {
        if (!username) this.set_error("username", "Vui lòng nhập tên tài khoản");
        if (!phone_number) this.set_error("phone_number", "Vui lòng nhập số điện thoại");
        if (!password) this.set_error("password", "Vui lòng nhập mật khẩu");
        if (!re_password) this.set_error("re_password", "Vui lòng nhập lại mật khẩu");
        return;
      }

      if (password !== re_password) {
        this.set_error("re_password", "Nhập lại mật khẩu không chính xác");
        return;
      }

      const baseUrl = process.env.VUE_APP_URL || '';

      Vue.axios
        .post(`${baseUrl}/user-register`, {
          username: username,
          phone_number: phone_number,
          password: password,
        })
        .then((res) => {
          _this.remove_error();
          // show success message and redirect to login
          alert(res.data);
          this.$router.push({ name: "Login" });
        })
        .catch(function (errors) {
          if (errors.response) {
            const data = errors.response.data;

            // If backend returned array of validation messages
            if (Array.isArray(data) && data.length > 0) {
              data.forEach((item) => {
                if (item && item.param) _this.set_error(item.param, item.msg || item.msg);
              });
            } else if (typeof data === "string") {
              // backend may return a simple string for duplicate error
              // try to map known messages to fields
              if (data.includes("tên tài khoản") || data.toLowerCase().includes("tên tài khoản") || data.toLowerCase().includes("đăng nhập")) {
                _this.set_error("username", data);
              } else if (data.toLowerCase().includes("số điện thoại") || data.toLowerCase().includes("điện thoại")) {
                _this.set_error("phone_number", data);
              } else {
                alert(data);
              }
            } else if (data && data.message) {
              alert(data.message);
            } else {
              alert("Đăng ký thất bại");
            }
          } else {
            alert("Không thể kết nối đến máy chủ");
          }
        });
    },

    set_error(field, error) {
      this.error[field] = error;
    },

    remove_error() {
      Object.keys(this.error).forEach((field) => {
        this.error[field] = null;
      });
    },

    togglePasswordVisibility(field) {
      if (Object.prototype.hasOwnProperty.call(this.passwordVisibility, field)) {
        this.passwordVisibility[field] = !this.passwordVisibility[field];
      }
    },
  },
};
</script>

<style lang="scss">
.register-page {
  width: 100%;
  height: calc(100% - 74px);
  background-color: white;
  margin-top: 74px;
  display: flex;
  justify-content: center;
  align-items: center;

  .wrap-login-form {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    border: 1px solid var(--black-one);
    padding: 20px;
    margin: 10px;
    border-radius: 10px;
    max-width: 420px;

    .border-b {
      width: 150px;
      height: 1px;
      background-color: var(--black-three);
    }

    .title {
      font-size: 1.6rem;
      text-transform: uppercase;
      margin: 5px 60px;
    }

    .form {
      width: 100%;

      input {
        width: 100%;
        padding: 10px;
        border-radius: 5px;
        outline: none;
        border: 1px solid var(--black-one);
        background-color: white !important;
      }

      .input-wrapper {
        position: relative;

        input {
          padding-right: 44px;
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
        }
      }

      p {
        font-size: 0.9rem;
        margin-bottom: 5px;
      }
    }

    .btn-login,
    .btn-create-new {
      width: 100%;
      padding: 10px 0;
      text-align: center;
      border-radius: 5px;
      cursor: pointer;
      color: white;
      font-size: 1.1rem;
    }

    .btn-login {
      background-color: var(--red-btn);
      margin: 25px 0px 10px 0px;
    }

    .btn-create-new {
      border: 1px solid var(--black-one);
      color: var(--black-two);
    }

    .error-message {
      color: red;
      font-size: 0.85rem !important;
    }
  }
}
</style>
