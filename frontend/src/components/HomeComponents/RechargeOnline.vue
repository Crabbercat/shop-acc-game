<template>
  <div class="recharge-online">
    <div class="left">
      <div class="form-title">
        <div
          @click="toggleForm"
          :class="{ active: showChargeForm }"
          class="charge-title"
        >
          <strong>NẠP THẺ</strong>
        </div>
        <div
          @click="toggleForm"
          :class="{ active: showTopChargeForm }"
          class="top-charge-title"
        >
          <strong>TOP NẠP THÁNG 6</strong>
        </div>
      </div>
      <div class="charge-form" v-show="showChargeForm">
        <select name="card-seri" id="card-seri">
          <option value="">Chọn nhà mạng</option>
          <option value="viettel">VIETTEL</option>
          <option value="vinaphone">VINAPHONE</option>
          <option value="mobilephone">MOBILEPHONE</option>
        </select>
        <select name="card-value" id="card-value">
          <option value="">Chọn mệnh giá</option>
          <option value="10000">10.000 VNĐ - (nhận 100%)</option>
          <option value="20000">20.000 VNĐ - (nhận 100%)</option>
          <option value="30000">30.000 VNĐ - (nhận 100%)</option>
          <option value="50000">50.000 VNĐ - (nhận 100%)</option>
          <option value="100000">100.000 VNĐ - (nhận 100%)</option>
          <option value="200000">200.000 VNĐ - (nhận 100%)</option>
          <option value="300000">300.000 VNĐ - (nhận 100%)</option>
          <option value="500000">500.000 VNĐ - (nhận 100%)</option>
          <option value="1000000">1.000.000 VNĐ - (nhận 100%)</option>
        </select>
        <input type="text" placeholder=" Mã thẻ" />
        <input type="text" placeholder=" Mã seri" />

        <button><strong>NẠP THẺ</strong></button>
        <strong class="charge-notice"
          >Hãy chọn đúng mệnh giá. Sai sẽ mất thẻ</strong
        >
      </div>
      <div class="top-charge-form" v-show="showTopChargeForm">
        <div class="rank">
          <div class="rank-left">
            <i class="fa fa-star" aria-hidden="true"></i>
            <strong>crabbercac</strong>
          </div>
          <div class="rank-right">
            <strong>50,000 <span>VND</span></strong>
          </div>
        </div>
        <div class="rank">
          <div class="rank-left">
            <div class="num-rank"><strong>2</strong></div>
            <strong>crabbercac</strong>
          </div>
          <div class="rank-right">
            <strong>50,000 <span>VND</span></strong>
          </div>
        </div>
        <div class="rank">
          <div class="rank-left">
            <div class="num-rank"><strong>3</strong></div>
            <strong>crabbercac</strong>
          </div>
          <div class="rank-right">
            <strong>50,000 <span>VND</span></strong>
          </div>
        </div>
        <div class="rank">
          <div class="rank-left">
            <div class="num-rank"><strong>4</strong></div>
            <strong>crabbercac</strong>
          </div>
          <div class="rank-right">
            <strong>50,000 <span>VND</span></strong>
          </div>
        </div>
        <div class="rank">
          <div class="rank-left">
            <div class="num-rank"><strong>5</strong></div>
            <strong>crabbercac</strong>
          </div>
          <div class="rank-right">
            <strong>50,000 <span>VND</span></strong>
          </div>
        </div>
      </div>
    </div>
    <div class="right">
      <img src="@/assets/images/recharge-banner.gif" alt="" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showChargeForm: true,
      showTopChargeForm: false,
    };
  },

  methods: {
    toggleForm() {
      this.showChargeForm = !this.showChargeForm;
      this.showTopChargeForm = !this.showTopChargeForm;
    },
  },
};
</script>

<style lang="scss">
.recharge-online {
  max-width: var(--max-width);
  margin: 80px auto;
  display: flex;
  gap: 24px;
  padding: 0 12px;
  align-items: center;

  .left {
    width: 35%;
    background-color: var(--black-two);
    padding: 18px;
    border-radius: 10px;
    box-shadow: 0 8px 26px rgba(0, 0, 0, 0.5);
    color: #ffffff;

    .form-title {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      cursor: pointer;

      div {
        flex: 1 1 50%;
        text-align: center;
        font-size: 1.15rem;
        font-weight: 700;
        padding: 12px 8px;
        color: var(--yellow-text);
        border-bottom: 2px solid transparent;
      }

      .active {
        color: var(--yellow-active) !important;
        border-bottom: 2px solid var(--yellow-active);
      }
    }

    .charge-form,
    .top-charge-form {
      padding: 12px 6px 6px 6px;
      display: flex;
      flex-direction: column;
      gap: 10px;

      input,
      select {
        padding: 10px 12px;
        font-size: 0.98rem;
        border-radius: 6px;
        margin: 0;
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
        font-weight: 700; /* use a weight available in Roboto Condensed */
        letter-spacing: 0.6px;
        border: none;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
        text-shadow: 0 1px 0 rgba(0, 0, 0, 0.12);
        font-family: inherit;
      }

      .charge-notice {
        padding-top: 8px;
        text-align: center;
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.9rem;
      }
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
            font-weight: 700;
          }
          i {
            padding-right: 10px;
            font-size: 1.6rem;
            color: var(--red-btn);
            position: relative;
          }
          strong {
            color: #ffffff;
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
      height: auto;
      display: block;
    }
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
}

@media (max-width: 480px) {
  .recharge-online {
    margin: 30px 8px !important;
  }
}
</style>
