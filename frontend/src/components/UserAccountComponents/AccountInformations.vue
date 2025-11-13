<template>
  <div class="account-informations">
    <div class="title"><strong>thông tin tài khoản</strong></div>

    <table>
      <tr>
        <td><p>id tài khoản</p></td>
        <td>
          <p class="red-background">
            <span>{{ user.id_account }}</span>
          </p>
        </td>
      </tr>

      <tr>
        <td><p>tên hiển thị</p></td>
        <td>
          <div v-if="editingField !== 'username'">
            {{ user.username }}
            <button class="edit-btn" @click="startEdit('username')" title="Sửa">✎</button>
          </div>

          <div v-else>
            <input v-model="editValues.username" />
            <button class="save-btn" @click="saveEdit('username')">Lưu</button>
            <button class="cancel-btn" @click="cancelEdit">Hủy</button>
            <div v-if="errors.username" class="error">{{ errors.username }}</div>
          </div>
        </td>
      </tr>

      <tr>
        <td><p>tên tài khoản</p></td>
        <td>
          <div v-if="editingField !== 'name_account'">
            {{ user.name_account }}
            <button class="edit-btn" @click="startEdit('name_account')" title="Sửa">✎</button>
          </div>

          <div v-else>
            <input v-model="editValues.name_account" />
            <button class="save-btn" @click="saveEdit('name_account')">Lưu</button>
            <button class="cancel-btn" @click="cancelEdit">Hủy</button>
            <div v-if="errors.name_account" class="error">{{ errors.name_account }}</div>
          </div>
        </td>
      </tr>

      <tr>
        <td><p>số điện thoại</p></td>
        <td>
          <div v-if="editingField !== 'phone_number'">
            {{ user.phone_number }}
            <button class="edit-btn" @click="startEdit('phone_number')" title="Sửa">✎</button>
          </div>

          <div v-else>
            <input v-model="editValues.phone_number" />
            <button class="save-btn" @click="saveEdit('phone_number')">Lưu</button>
            <button class="cancel-btn" @click="cancelEdit">Hủy</button>
            <div v-if="errors.phone_number" class="error">{{ errors.phone_number }}</div>
          </div>
        </td>
      </tr>

      <tr>
        <td><p>số dư</p></td>
        <td>
          <p class="red-background"><span>{{ formattedBalance }}</span></p>
        </td>
      </tr>

      <tr>
        <td><p>ngày tham gia</p></td>
        <td>03/06/2021</td>
      </tr>
    </table>
  </div>
</template>

<script>
import Vue from "vue";

export default {
  data: () => ({
    editingField: null,
    editValues: {
      username: "",
      name_account: "",
      phone_number: "",
    },
    errors: {},
    loading: false,
  }),

  computed: {
    user() {
      return this.$store.state.user_data || {};
    },

    formattedBalance() {
      const val = this.user.balance || 0;
      try {
        return new Intl.NumberFormat("vi-VN").format(val) + " VNĐ";
      } catch (e) {
        return val + " VNĐ";
      }
    },
  },

  methods: {
    startEdit(field) {
      this.editingField = field;
      this.errors = {};
      this.editValues[field] = this.user[field] || "";
    },

    cancelEdit() {
      this.editingField = null;
      this.errors = {};
    },

    async saveEdit(field) {
      this.errors = {};
      const payload = {};
      payload[field] = this.editValues[field];

      // Basic client-side presence check
      if (!payload[field] || payload[field].toString().trim() === "") {
        this.errors[field] = "Không được để trống";
        return;
      }

      this.loading = true;
      try {
        await Vue.axios.post(`${process.env.VUE_APP_URL}/user-update`, payload);
        // refresh store user data
        this.$store.commit("get_user_data");
        this.editingField = null;
      } catch (err) {
        if (err && err.response && err.response.data) {
          const d = err.response.data;
          if (Array.isArray(d) && d.length > 0 && d[0].param) {
            this.errors[d[0].param] = d[0].msg || "Lỗi";
          } else if (typeof d === "string") {
            this.errors[field] = d;
          } else if (d && d[0] && d[0].msg) {
            this.errors[field] = d[0].msg;
          } else {
            this.errors[field] = "Lỗi server";
          }
        } else {
          this.errors[field] = "Lỗi kết nối";
        }
      } finally {
        this.loading = false;
      }
    },
  },

  mounted() {
    // ensure user data is loaded
    if (!this.user || !this.user.id_account) this.$store.commit("get_user_data");
  },
};
</script>

<style lang="scss">
.account-informations {
  table {
    border-collapse: collapse;
    width: 100%;

    td {
      border-bottom: 1px solid #dddddd;
      text-align: left;
      font-size: 0.9rem;

      .red-background span {
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 3px;
        background-color: var(--red-btn);
        color: #ffffff;
      }
    }

    td:nth-child(1) {
      font-weight: 700;
      text-transform: uppercase;
    }
  }
}

.edit-btn,
.save-btn,
.cancel-btn {
  margin-left: 8px;
  padding: 3px 8px;
  border-radius: 3px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}

.save-btn {
  background: var(--green-btn, #28a745);
  color: white;
  border-color: var(--green-btn, #28a745);
}

.cancel-btn {
  background: #f5f5f5;
}

.error {
  color: red;
  margin-top: 6px;
}
</style>
