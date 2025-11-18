import Vue from "vue";
import VueRouter from "vue-router";

import HomePage from "@/components/HomePage";
import RechargeOnlinePage from "@/components/RechargeOnlinePage";
import AutoAtmRechargePage from "@/components/AutoAtmRechargePage";
import LoginPage from "@/components/LoginPage";
import RegisterPage from "@/components/RegisterPage";
import AccountCategories from "@/components/AccountCategories";
import ListAccountsPage from "@/components/ListAccountsPage";
import DetailAccountPage from "@/components/DetailAccountPage";
import UserAccountPage from "@/components/UserAccountPage";
import store from "@/store";

Vue.use(VueRouter);

const routes = [
  { path: "/", name: "Home", component: HomePage },
  {
    path: "/recharge",
    name: "RechargeOnline",
    component: RechargeOnlinePage,
    meta: { requiresAuth: true },
  },
  {
    path: "/atm-momo",
    name: "AtmMomoRecharge",
    component: AutoAtmRechargePage,
    meta: { requiresAuth: true },
  },
  { path: "/login", name: "Login", component: LoginPage },
  { path: "/register", name: "Register", component: RegisterPage },
  { path: "/account", name: "UserAccountPage", component: UserAccountPage },
  {
    path: "/account-categories/:categoryName",
    name: "AccountCategories",
    component: AccountCategories,
  },
  {
    path: "/account/:typeAccount",
    name: "ListAccountsPage",
    component: ListAccountsPage,
  },
  {
    path: "/detail/:accountID",
    name: "DetailAccountPage",
    component: DetailAccountPage,
  },
  { path: "*", component: HomePage },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta && record.meta.requiresAuth);
  if (!requiresAuth) {
    next();
    return;
  }

  const user = store.state.user_data || {};
  const isLoggedIn = !!user.id_account;

  if (!isLoggedIn) {
    next({ name: "Login", query: { redirect: to.fullPath } });
    return;
  }

  next();
});

export default router;
