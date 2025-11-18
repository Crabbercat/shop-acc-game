<template>
  <div class="login-page">
    <div v-on:keyup.enter="user_login" class="wrap-login-form">
      <p class="title"><strong>Đăng nhập tài khoản</strong></p>
      <div class="border-b"></div>
      <div class="form">
        <p><strong>Tên tài khoản</strong></p>
        <input
          v-model="username"
          type="text"
          placeholder="Nhập tên tài khoản"
        />
        <p><strong>Mật khẩu</strong></p>
        <input v-model="password" type="password" placeholder="Nhập mật khẩu" />
        <p v-if="error" class="error-message">
          <strong>{{ error }}</strong>
        </p>
      </div>
      <div v-on:click="user_login" class="btn-login">Đăng nhập</div>
      <div class="btn-login-facebook">
        <i class="fa fa-facebook-official" aria-hidden="true"></i> Đăng nhập qua
        Facebook
      </div>
      <router-link class="btn-create-new" :to="{ name: 'Register' }">
        <i class="fa fa-user-plus" aria-hidden="true"></i> Tạo tài khoản
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
      password: null,
      error: null,
    };
  },

  mounted() {
    this.$store.commit("set_dark_mode", false);
    this.$store.commit("get_user_data");

    let _this = this;
    setTimeout(() => {
      if (_this.$store.state.user_data && _this.$store.state.user_data.id_account)
        _this.$router.push("/");
    }, 0);
  },

  methods: {
    user_login() {
      let _this = this;
      // username must be alphanumeric between 5 and 50 chars
      let re = /^[a-zA-Z0-9]+$/i;

      this.remove_error();

      if (!this.username || !this.password) {
        this.error = "Vui lòng nhập tên tài khoản và mật khẩu";
        return false;
      }

      // Keep username checks, but allow passwords to contain special characters
      // and require at least 8 characters (same as registration policy)
        if (this.username.length < 5 || this.username.length > 50 || !re.test(this.username) || this.password.length < 8 || this.password.length > 50) {
          const msg = (this.$t ? this.$t("login_invalid") : "Tên tài khoản hoặc mật khẩu không hợp lệ");
          this.error = msg;
          return false;
        }

      const baseUrl = process.env.VUE_APP_URL || '';

      Vue.axios
        .post(`${baseUrl}/user-login`, {
          username: this.username,
          password: this.password,
        })
        .then((res) => {
          if (res.data && res.data.token) {
            localStorage.setItem("token", res.data.token);
          }
          this.$store.commit("set_user_data", res.data);
          this.$router.push("/");
        })
        .catch((errors) => {
          if (errors.response) {
            const data = errors.response.data;
            let message = "Lỗi đăng nhập";

            if (typeof data === "string") {
              message = data;
            } else if (Array.isArray(data) && data.length > 0) {
              const first = data[0];
              message = first.msg || first.message || JSON.stringify(first);
            } else if (data && data.message) {
              message = data.message;
            } else {
              try {
                message = JSON.stringify(data);
              } catch (e) {
                message = "Lỗi không xác định";
              }
            }

            _this.error = message;
          } else {
            _this.error = "Không thể kết nối đến máy chủ";
          }
        });
    },

    remove_error() {
      this.error = null;
    },
  },
};
</script>

<style lang="scss">
.login-page,
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
    max-width: 380px;

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
      p {
        font-size: 0.9rem;
        margin-bottom: 5px;
      }
    }

    .btn-login,
    .btn-login-facebook,
    .btn-create-new {
      width: 100%;
      padding: 10px 0;
      text-align: center;
      border-radius: 5px;
      cursor: pointer;
      color: white;
      font-size: 1.2rem;
    }
    .btn-login {
      background-color: var(--red-btn);
      margin: 25px 0px 10px 0px;
    }
    .btn-login-facebook {
      background-color: #3b5998;
      margin: 10px 0px;
    }
    .btn-create-new {
      border: 1px solid var(--black-one);
      color: var(--black-two);
    }
    .btn-login-facebook,
    .btn-create-new {
      position: relative;

      i {
        position: absolute;
        top: 50%;
        left: 16px;
        transform: translateY(-50%);
      }
    }

    .error-message {
      color: red;
      font-size: 0.8rem !important;
      text-align: center;
    }
  }
}
</style>
