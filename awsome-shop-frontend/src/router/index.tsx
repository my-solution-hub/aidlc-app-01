import { createBrowserRouter } from "react-router";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import EmployeeLayout from "../components/Layout/EmployeeLayout";
import AdminLayout from "../components/Layout/AdminLayout";
import ShopHome from "../pages/ShopHome";
import ProductDetail from "../pages/ProductDetail";
import ConfirmRedemption from "../pages/ConfirmRedemption";
import RedemptionSuccess from "../pages/RedemptionSuccess";
import OrderDetail from "../pages/OrderDetail";
import MyOrders from "../pages/MyOrders";
import MyPoints from "../pages/MyPoints";
import Dashboard from "../pages/Dashboard";
import ProductList from "../pages/Products";
import CreateProduct from "../pages/Products/CreateProduct";
import ProductDetailAdmin from "../pages/Products/ProductDetailAdmin";
import CategoryList from "../pages/Categories";
import PointRuleList from "../pages/PointRules";
import UserPoints from "../pages/UserPoints";
import ExchangeRecordList from "../pages/ExchangeRecords";
import ExchangeDetail from "../pages/ExchangeRecords/ExchangeDetail";
import Users from "../pages/Users";
import AuthGuard from "./AuthGuard";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  // Employee routes
  {
    path: "/",
    element: (
      <AuthGuard requiredRole="employee">
        <EmployeeLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <ShopHome /> },
      { path: "products/:id", element: <ProductDetail /> },
      { path: "orders/confirm/:productId", element: <ConfirmRedemption /> },
      { path: "orders/success", element: <RedemptionSuccess /> },
      { path: "orders/:id", element: <OrderDetail /> },
      { path: "orders", element: <MyOrders /> },
      { path: "points", element: <MyPoints /> },
    ],
  },
  // Admin routes
  {
    path: "/admin",
    element: (
      <AuthGuard requiredRole="admin">
        <AdminLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "products", element: <ProductList /> },
      { path: "products/create", element: <CreateProduct /> },
      { path: "products/:id/edit", element: <CreateProduct /> },
      { path: "products/:id", element: <ProductDetailAdmin /> },
      { path: "categories", element: <CategoryList /> },
      { path: "points", element: <PointRuleList /> },
      { path: "user-points", element: <UserPoints /> },
      { path: "orders", element: <ExchangeRecordList /> },
      { path: "orders/:id", element: <ExchangeDetail /> },
      { path: "users", element: <Users /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
