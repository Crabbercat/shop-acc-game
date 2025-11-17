<template>
  <div class="recharge-online-container">
    <div class="recharge-online">
      <div class="left">
        <div class="form-title">
          <div
            class="charge-title"
            :class="{ active: activeTab === 'charge' }"
            @click="activeTab = 'charge'"
          >
            <strong>NẠP THẺ</strong>
          </div>
          <div
            class="top-charge-title"
            :class="{ active: activeTab === 'top' }"
            @click="activeTab = 'top'"
          >
            <strong>TOP NẠP {{ currentMonthLabel.toUpperCase() }}</strong>
          </div>
        </div>

        <div class="charge-form" v-if="activeTab === 'charge'">
          <select v-model="telco">
            <option value="">Chọn nhà mạng</option>
            <option value="VIETTEL">VIETTEL</option>
            <option value="VINAPHONE">VINAPHONE</option>
            <option value="MOBILEPHONE">MOBILEPHONE</option>
          </select>
          <select v-model="amount">
            <option value="">Chọn mệnh giá</option>
            <option value="10000">10.000 VNĐ</option>
            <option value="20000">20.000 VNĐ</option>
            <option value="30000">30.000 VNĐ</option>
            <option value="50000">50.000 VNĐ</option>
            <option value="100000">100.000 VNĐ</option>
            <option value="200000">200.000 VNĐ</option>
            <option value="300000">300.000 VNĐ</option>
            <option value="500000">500.000 VNĐ</option>
            <option value="1000000">1.000.000 VNĐ</option>
          </select>
          <input type="text" placeholder="Mã thẻ" v-model="code" />
          <input type="text" placeholder="Mã seri" v-model="serial" />

          <button @click="recharge"><strong>NẠP THẺ</strong></button>
          <strong class="charge-notice"
            >Hãy chọn đúng mệnh giá. Sai sẽ mất thẻ</strong
          >
        </div>

        <div class="top-charge-form" v-else>
          <div
            class="rank"
            v-for="(item, index) in leaderboardToDisplay"
            :key="index"
          >
            <div class="rank-left">
              <div class="num-rank" :class="{ first: index === 0 }">
                <strong>{{ index + 1 }}</strong>
              </div>
              <strong>{{ item.name }}</strong>
            </div>
            <div class="rank-right">
              <strong>{{ formatCurrency(item.amount) }} <span>VND</span></strong>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <img src="@/assets/images/recharge-banner.gif" alt="Recharge" />
      </div>
    </div>

    <div v-if="showHistory" class="recharge-history">
      <h3>Lịch sử đổi thẻ</h3>
      <div class="filters">
        <input type="text" placeholder="Mã nạp" v-model="filterForm.code" />
        <input type="text" placeholder="Serial" v-model="filterForm.serial" />
        <input
          type="text"
          placeholder="Request ID"
          v-model="filterForm.requestId"
        />
        <select v-model="filterForm.telco">
          <option value="">Chọn mạng</option>
          <option value="VIETTEL">VIETTEL</option>
          <option value="VINAPHONE">VINAPHONE</option>
          <option value="MOBILEPHONE">MOBILEPHONE</option>
        </select>
        <select v-model="filterForm.status">
          <option value="">Trạng thái</option>
          <option value="pending">Đang chờ</option>
          <option value="success">Thẻ đúng</option>
          <option value="failed">Thẻ lỗi</option>
          <option value="error">Thẻ sai/đã dùng</option>
        </select>
        <div class="date-range">
          <label>Từ</label>
          <input type="date" v-model="filterForm.startDate" />
          <span class="date-sep">→</span>
          <label>Đến</label>
          <input type="date" v-model="filterForm.endDate" />
        </div>
        <button class="btn-filter" @click="applyFilters">Lọc</button>
        <button class="btn-export" @click="exportHistory">
          <i class="fa fa-save" aria-hidden="true"></i>
        </button>
        <button class="btn-clear-filter" @click="clearFilters">Bỏ lọc</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Trạng thái</th>
            <th>Mã thẻ</th>
            <th>Seri</th>
            <th>Nhà mạng</th>
            <th>Khai</th>
            <th>Nhận</th>
            <th>Ngày</th>
            <th>Request ID</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredHistory" :key="item._id">
            <td>
              <span class="status-pill" :class="statusClass(item.status)">{{
                formatStatus(item.status)
              }}</span>
            </td>
            <td>{{ item.code }}</td>
            <td>{{ item.serial }}</td>
            <td>{{ item.telco }}</td>
            <td>{{ formatCurrency(item.amount) }}</td>
            <td>{{ formatCurrency(item.realAmount) }}</td>
            <td>{{ formatDate(item.createdAt) }}</td>
            <td>{{ item.request_id }}</td>
          </tr>
          <tr v-if="!filteredHistory.length">
            <td colspan="8" class="empty-row">Không có dữ liệu phù hợp</td>
          </tr>
        </tbody>
      </table>
      <div class="summary">
        Tổng gửi: {{ formatCurrency(totalSent) }} | Tổng thực:
        {{ formatCurrency(totalReal) }} | Số tiền:
        {{ formatCurrency(totalReceived) }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";

const defaultFilters = () => ({
  code: "",
  serial: "",
  requestId: "",
  telco: "",
  status: "",
  startDate: "",
  endDate: "",
});

export default {
  props: {
    showHistory: {
      type: Boolean,
      default: false,
    },
    redirectAfterSubmit: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      telco: "",
      amount: "",
      code: "",
      serial: "",
      history: [],
      activeTab: "charge",
      filterForm: defaultFilters(),
      activeFilters: defaultFilters(),
      refreshTimer: null,
      fallbackLeaderboard: [
        { name: "crabbercac", amount: 50000 },
        { name: "nguyene", amount: 30000 },
        { name: "longng", amount: 20000 },
        { name: "kaka", amount: 15000 },
        { name: "player01", amount: 10000 },
      ],
    };
  },
  computed: {
    ...mapState({
      user: (state) => state.user_data,
    }),
    isLoggedIn() {
      return !!(this.user && this.user.id_account);
    },
    totalSent() {
      return this.history.reduce((sum, item) => sum + item.amount, 0);
    },
    totalReal() {
      return this.history
        .filter((item) => item.status === "success")
        .reduce((sum, item) => sum + item.amount, 0);
    },
    totalReceived() {
      return this.history
        .filter((item) => item.status === "success")
        .reduce((sum, item) => sum + item.realAmount, 0);
    },
    filteredHistory() {
      const filters = this.activeFilters;
      return this.history.filter((item) => {
        if (filters.code && !item.code.includes(filters.code.trim())) return false;
        if (filters.serial && !item.serial.includes(filters.serial.trim()))
          return false;
        if (
          filters.requestId &&
          !item.request_id.toLowerCase().includes(filters.requestId.toLowerCase().trim())
        )
          return false;
        if (filters.telco && item.telco !== filters.telco) return false;
        if (filters.status && item.status !== filters.status) return false;
        if (filters.startDate) {
          const start = new Date(filters.startDate);
          if (new Date(item.createdAt) < start) return false;
        }
        if (filters.endDate) {
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          if (new Date(item.createdAt) > end) return false;
        }
        return true;
      });
    },
    leaderboardEntries() {
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();
      const totals = new Map();
      this.history
        .filter((item) => item.status === "success")
        .forEach((item) => {
          const created = new Date(item.createdAt);
          if (created.getMonth() !== month || created.getFullYear() !== year) return;
          const name =
            (item.user && (item.user.username || item.user.name_account)) ||
            "Ẩn danh";
          const current = totals.get(name) || 0;
          totals.set(name, current + item.realAmount);
        });
      const ranked = Array.from(totals.entries())
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
      return ranked;
    },
    leaderboardToDisplay() {
      return this.leaderboardEntries.length
        ? this.leaderboardEntries
        : this.fallbackLeaderboard;
    },
    currentMonthLabel() {
      return new Date().toLocaleString("vi-VN", { month: "long", year: "numeric" });
    },
  },
  methods: {
    async recharge() {
      if (!this.isLoggedIn) {
        alert("Vui lòng đăng nhập để nạp thẻ");
        this.$router.push("/login");
        return;
      }
      if (!this.telco || !this.amount || !this.code || !this.serial) {
        alert("Vui lòng điền đầy đủ thông tin");
        return;
      }
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          this.$router.push("/login");
          return;
        }
        const response = await axios.post(
          "/recharge",
          {
            telco: this.telco,
            serial: this.serial,
            code: this.code,
            amount: parseInt(this.amount, 10),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert(response.data.message);
        this.$store.commit("get_user_data");
        if (this.redirectAfterSubmit) {
          this.$router.push("/recharge");
          return;
        }
        if (this.showHistory) {
          this.getHistory();
        }
      } catch (error) {
        console.error("Recharge failed:", error);
        if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message);
        } else {
          alert("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.");
        }
      }
    },
    async getHistory() {
      if (!this.showHistory || !this.isLoggedIn) return;
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await axios.get("/recharge/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.history = response.data.data || [];
        this.schedulePendingRefresh();
      } catch (error) {
        console.error(error);
      }
    },
    schedulePendingRefresh() {
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }
      const hasPending = this.history.some((item) => item.status === "pending");
      if (hasPending) {
        this.refreshTimer = setTimeout(() => {
          this.getHistory();
        }, 4000);
      }
    },
    formatStatus(status) {
      switch (status) {
        case "success":
          return "Thẻ đúng";
        case "failed":
          return "Thẻ lỗi";
        case "pending":
          return "Đang chờ";
        case "error":
          return "Thẻ sai/đã dùng";
        default:
          return "Không xác định";
      }
    },
    statusClass(status) {
      return {
        "status-success": status === "success",
        "status-failed": status === "failed",
        "status-error": status === "error",
        "status-pending": status === "pending",
      };
    },
    formatCurrency(value) {
      return new Intl.NumberFormat("vi-VN").format(value || 0);
    },
    formatDate(date) {
      return new Date(date).toLocaleString("vi-VN");
    },
    applyFilters() {
      this.activeFilters = { ...this.filterForm };
    },
    clearFilters() {
      this.filterForm = defaultFilters();
      this.activeFilters = defaultFilters();
    },
    exportHistory() {
      const rows = this.filteredHistory;
      if (!rows.length) {
        alert("Không có dữ liệu để xuất");
        return;
      }
      const headers = [
        "Trạng thái",
        "Mã thẻ",
        "Seri",
        "Nhà mạng",
        "Khai",
        "Nhận",
        "Ngày",
        "Request ID",
      ];
      const csvRows = rows.map((item) => [
        this.formatStatus(item.status),
        item.code,
        item.serial,
        item.telco,
        this.formatCurrency(item.amount),
        this.formatCurrency(item.realAmount),
        this.formatDate(item.createdAt),
        item.request_id,
      ]);
      const csvContent = [headers, ...csvRows]
        .map((row) => row.join(","))
        .join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `recharge-history-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
  },
  watch: {
    user: {
      deep: false,
      handler(newVal) {
        if (this.showHistory && newVal && newVal.id_account) {
          this.getHistory();
        }
      },
    },
  },
  mounted() {
    if (!this.isLoggedIn) {
      this.$store.commit("get_user_data");
    } else if (this.showHistory) {
      this.getHistory();
    }
  },
  beforeDestroy() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
  },
};
</script>

<style lang="scss">
.recharge-online-container {
  max-width: var(--max-width);
  margin: 40px auto;
  padding: 0 12px;
}
.recharge-online {
  display: flex;
  gap: 24px;
  align-items: stretch;
  margin-bottom: 40px;

  .left {
    width: 35%;
    background-color: var(--black-two);
    padding: 18px;
    border-radius: 10px;
    box-shadow: 0 8px 26px rgba(0, 0, 0, 0.5);
    color: #ffffff;

    .form-title {
      display: flex;
      gap: 10px;
      cursor: pointer;

      div {
        flex: 1 1 50%;
        text-align: center;
        font-size: 1rem;
        font-weight: 700;
        padding: 12px 8px;
        color: var(--yellow-text);
        border-bottom: 2px solid transparent;
      }

      .active {
        color: var(--yellow-active);
        border-bottom: 2px solid var(--yellow-active);
      }
    }

    .charge-form,
    .top-charge-form {
      padding: 12px 6px 6px 6px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    input,
    select {
      padding: 10px 12px;
      font-size: 0.98rem;
      border-radius: 6px;
      outline: none;
      background-color: rgba(0, 0, 0, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #ffffff;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    input::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    input:focus,
    select:focus {
      border: 1px solid rgba(245, 158, 11, 1);
      box-shadow: 0 4px 18px rgba(245, 158, 11, 0.08);
    }

    button {
      width: 100%;
      font-size: 1.1rem;
      background: linear-gradient(180deg, #ffe900, #f2ac00);
      border-radius: 6px;
      padding: 12px 16px;
      cursor: pointer;
      margin-top: 6px;
      color: rgba(0, 0, 0, 0.85);
      font-weight: 700;
      letter-spacing: 0.6px;
      border: none;
      text-shadow: 0 1px 0 rgba(0, 0, 0, 0.12);
      font-family: inherit;
    }

    .charge-notice {
      padding-top: 8px;
      text-align: center;
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
    }

    .top-charge-form {
      .rank {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .rank-left {
          display: flex;
          align-items: center;

          .num-rank {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background-color: rgba(20, 184, 166, 1);
            margin-right: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #ffffff;
          }

          .first {
            background-color: var(--red-btn);
          }
        }

        .rank-right {
          padding: 6px 18px;
          background-color: var(--red-btn);
          border-radius: 6px;

          strong {
            font-weight: 700;
            color: #ffffff;
            font-size: 1rem;
          }
          span {
            font-size: 0.75rem;
          }
        }
      }
    }
  }

  .right {
    width: 65%;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 8px 26px rgba(0, 0, 0, 0.45);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }
}

.recharge-history {
  background-color: var(--black-two);
  padding: 18px;
  border-radius: 10px;
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.5);
  color: #ffffff;

  h3 {
    font-size: 1.5rem;
    margin-bottom: 20px;
    text-align: center;
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin-bottom: 20px;

    input,
    select {
      padding: 8px 10px;
      border-radius: 5px;
      border: 1px solid #444;
      background-color: #1f1f1f;
      color: #fff;
      min-width: 140px;
    }

    button {
      padding: 10px 18px;
      border-radius: 5px;
      border: none;
      cursor: pointer;
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 60px;
    }

    .date-range {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border: 1px solid #444;
      border-radius: 5px;
      background-color: #1f1f1f;
      white-space: nowrap;

      label {
        font-size: 0.8rem;
        color: rgba(226, 232, 240, 0.9);
      }

      .date-sep {
        color: rgba(255, 255, 255, 0.6);
      }

      input {
        border: none;
        background: transparent;
        padding: 0;
        min-width: 0;
        color: #fff;
      }
    }

    .btn-filter {
      background-color: #007bff;
    }
    .btn-export {
      background-color: #28a745;
    }
    .btn-clear-filter {
      background-color: #dc3545;
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      border: 1px solid #444;
      padding: 10px;
      text-align: center;
    }

    th {
      background-color: #333;
    }

    .empty-row {
      text-align: center;
      padding: 16px 0;
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 12px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 0.85rem;
    white-space: nowrap;
  }

  .status-success {
    background-color: #28a745;
    color: white;
  }
  .status-failed {
    background-color: #dc3545;
    color: white;
  }
  .status-error {
    background-color: #8b5cf6;
    color: white;
  }
  .status-pending {
    background-color: #ffc107;
    color: #1f1f1f;
  }

  .summary {
    margin-top: 20px;
    text-align: right;
    font-weight: bold;
  }
}

@media (max-width: 1000px) {
  .recharge-online {
    flex-direction: column-reverse;
    margin: 40px 12px;

    .left,
    .right {
      width: 100%;
    }
  }
  .recharge-history .filters {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .recharge-online {
    margin: 30px 8px !important;
  }
}
</style>
