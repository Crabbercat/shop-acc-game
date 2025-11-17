<template>
  <div class="recharge-history table-style">
    <div class="title"><strong>lịch sử giao dịch</strong></div>
    <div class="wrap-history">
      <table>
        <thead>
          <tr>
            <th>Loại thẻ/Trạng thái</th>
            <th>M.GIÁ</th>
            <th>T.Nhận</th>
            <th>Mã thẻ</th>
            <th>Serial</th>
            <th>Thời gian</th>
            <th>Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="empty-row">Đang tải dữ liệu...</td>
          </tr>
          <tr v-else-if="!history.length">
            <td colspan="7" class="empty-row">Chưa có giao dịch nạp thẻ</td>
          </tr>
          <tr v-for="item in history" :key="item._id">
            <td>
              <span class="status-pill" :class="statusClass(item.status)">
                {{ formatStatus(item.status) }}
              </span>
            </td>
            <td>{{ formatCurrency(item.amount) }}</td>
            <td>{{ formatCurrency(item.realAmount) }}</td>
            <td>{{ item.code }}</td>
            <td>{{ item.serial }}</td>
            <td>{{ formatDate(item.createdAt) }}</td>
            <td>{{ historyMessage(item) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="description">
      <strong
        >Dùng điện thoại <i class="fa fa-mobile" aria-hidden="true"></i>, hãy
        vuốt bảng từ phải qua trái (
        <i class="fa fa-arrow-circle-left" aria-hidden="true"></i> ) để xem đầy
        đủ thông tin!</strong
      >
    </p>
    <p class="description">
      <strong>M.GIÁ = MỆNH GIÁ, T.NHẬN = THỰC NHẬN</strong>
    </p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      history: [],
      loading: false,
      refreshTimer: null,
    };
  },
  computed: {
    token() {
      return localStorage.getItem("token");
    },
  },
  methods: {
    async fetchHistory() {
      if (!this.token) return;
      this.loading = true;
      try {
        const res = await axios.get("/recharge/history", {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        this.history = (res.data && res.data.data) || [];
        this.schedulePendingRefresh();
      } catch (error) {
        console.error("Không thể lấy lịch sử nạp thẻ", error);
      } finally {
        this.loading = false;
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
          this.fetchHistory();
        }, 4000);
      }
    },
    formatStatus(status) {
      switch (status) {
        case "success":
          return "Thành công";
        case "failed":
          return "Thẻ lỗi";
        case "pending":
          return "Đang chờ";
        case "error":
          return "Lỗi hệ thống";
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
      if (!date) return "--";
      try {
        return new Date(date).toLocaleString("vi-VN");
      } catch (error) {
        return date;
      }
    },
    historyMessage(item) {
      if (!item) return "";
      if (item.message && item.message.trim()) return item.message;
      if (item.status === "success") return "Nạp thẻ thành công.";
      if (item.status === "failed" && item.realAmount > 0)
        return "Sai mệnh giá, phạt 50%.";
      if (item.status === "failed")
        return "Thẻ lỗi, vui lòng kiểm tra lại.";
      if (item.status === "error")
        return "Có lỗi khi xử lý thẻ, vui lòng thử lại.";
      return "";
    },
  },
  mounted() {
    if (this.token) {
      this.fetchHistory();
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
.recharge-history {
  .wrap-history {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      border: 1px solid #444;
      padding: 10px;
      text-align: center;
      white-space: nowrap;
    }

    th {
      background-color: #333;
    }

    .empty-row {
      text-align: center;
      padding: 16px 0;
      color: rgba(255, 255, 255, 0.7);
      white-space: normal;
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
}
</style>
