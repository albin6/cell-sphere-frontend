import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

// Import components that are used in the router directly
import RequireNoAuthentication from "./private/user/RequireNoAuthentication";
import RequireAuth from "./private/admin/RequireAuth";
import RequireAuthentication from "./private/user/RequireAuthentication";
import Chat from "./services/Chat";
import LoadingFallback from "./components/lazy/LoadingFallback";

// Lazy load all other components
const LoginPage = lazy(() => import("./pages/user/LoginPage"));
const SignupPage = lazy(() => import("./pages/user/SignupPage"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const Homepage = lazy(() => import("./pages/user/Homepage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const UsersList = lazy(() => import("./pages/admin/UsersList"));
const Category = lazy(() => import("./pages/admin/Category"));
const ProductList = lazy(() => import("./pages/admin/ProductList"));
const Brand = lazy(() => import("./pages/admin/Brand"));
const AddProduct = lazy(() => import("./pages/admin/AddProduct"));
const EditProduct = lazy(() => import("./pages/admin/EditProduct"));
const NewPassword = lazy(() => import("./components/user/NewPassword"));
const ForgotPassword = lazy(() => import("./components/user/ForgotPassword"));
const ProductDetailsPage = lazy(() =>
  import("./pages/user/ProductDetailsPage")
);
const ProductListingPage = lazy(() =>
  import("./pages/user/ProductListingPage")
);
const CategoryListingPage = lazy(() =>
  import("./pages/user/CategoryListingPage")
);
const BrandListingPage = lazy(() => import("./pages/user/BrandListingPage"));
const WishlistPage = lazy(() => import("./pages/user/WishlistPage"));
const UserProfile = lazy(() => import("./pages/user/UserProfile"));
const OrderDetailsPage = lazy(() => import("./pages/user/OrderDetailsPage"));
const ResetPassword = lazy(() => import("./pages/user/ResetPassword"));
const CartPage = lazy(() => import("./pages/user/CartPage"));
const CheckoutPage = lazy(() => import("./pages/user/CheckoutPage"));
const OrderManagementPage = lazy(() =>
  import("./pages/admin/OrderManagementPage")
);
const CouponManagementPage = lazy(() =>
  import("./pages/admin/CouponManagementPage")
);
const ContactPage = lazy(() => import("./pages/user/ContactPage"));
const AboutPage = lazy(() => import("./pages/user/AboutPage"));
const SalesReport = lazy(() => import("./components/admin/SalesReport"));
const OfferModulePage = lazy(() => import("./pages/admin/OfferModulePage"));
const SalesReportPage = lazy(() => import("./pages/admin/SalesReportPage"));
const BannerManagementPage = lazy(() =>
  import("./pages/admin/BannerManagementPage")
);
const ReferralCode = lazy(() => import("./components/user/ReferralCode"));

function AppLayout() {
  const admin = useSelector((state) => state.admin.adminInfo);
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* --------------------------------------------------- */}
        {/* --------------------  users     ------------------- */}
        {/* --------------------------------------------------- */}
        <Route
          path="/referral"
          element={
            <RequireAuthentication>
              <ReferralCode />
            </RequireAuthentication>
          }
        />
        <Route path="/" element={<Homepage />} />
        <Route
          path="/login"
          element={
            <RequireNoAuthentication>
              <LoginPage />
            </RequireNoAuthentication>
          }
        />
        <Route
          path="/signup"
          element={
            <RequireNoAuthentication>
              <SignupPage />
            </RequireNoAuthentication>
          }
        />
        <Route path="/users/forgot-password" element={<ForgotPassword />} />
        <Route path="/users/reset-password/:id" element={<NewPassword />} />
        <Route
          path="/product/:id"
          element={
            <RequireAuthentication>
              <ProductDetailsPage />
            </RequireAuthentication>
          }
        />
        <Route
          path="/products/categories/:categoryId"
          element={
            <RequireAuthentication>
              <CategoryListingPage />
            </RequireAuthentication>
          }
        />
        <Route
          path="/products/brands/:brandId"
          element={
            <RequireAuthentication>
              <BrandListingPage />
            </RequireAuthentication>
          }
        />
        <Route
          path="/products/list"
          element={
            <RequireAuthentication>
              <ProductListingPage />
            </RequireAuthentication>
          }
        />
        <Route
          path="/wishlist"
          element={
            <RequireAuthentication>
              <WishlistPage />
            </RequireAuthentication>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuthentication>
              <UserProfile />
            </RequireAuthentication>
          }
        />
        <Route
          path="/profile/orders/:orderId"
          element={
            <RequireAuthentication>
              <OrderDetailsPage />
            </RequireAuthentication>
          }
        />
        <Route
          path="/profile/reset-password"
          element={
            <RequireAuthentication>
              <ResetPassword />
            </RequireAuthentication>
          }
        />
        <Route
          path="/cart"
          element={
            <RequireAuthentication>
              <CartPage />
            </RequireAuthentication>
          }
        />
        <Route
          path="/checkout"
          element={
            <RequireAuthentication>
              <CheckoutPage />
            </RequireAuthentication>
          }
        />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* test route */}
        <Route path="/test" element={<SalesReport />} />
        {/* test route */}

        {/* --------------------------------------------------- */}
        {/* --------------------   admin    ------------------- */}
        {/* --------------------------------------------------- */}
        <Route
          path="/admin"
          element={admin ? <AdminDashboard /> : <AdminLogin />}
        />
        <Route
          path="/admin/users"
          element={
            <RequireAuth>
              <UsersList />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/category"
          element={
            <RequireAuth>
              <Category />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/products"
          element={
            <RequireAuth>
              <ProductList />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/products/add-product"
          element={
            <RequireAuth>
              <AddProduct />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/products/edit-product/:productId"
          element={
            <RequireAuth>
              <EditProduct />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/brand"
          element={
            <RequireAuth>
              <Brand />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <RequireAuth>
              <OrderManagementPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/coupons"
          element={
            <RequireAuth>
              <CouponManagementPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/offers"
          element={
            <RequireAuth>
              <OfferModulePage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/sales"
          element={
            <RequireAuth>
              <SalesReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/banner"
          element={
            <RequireAuth>
              <BannerManagementPage />
            </RequireAuth>
          }
        />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <>
      <Router>
        <Chat />
        <ToastContainer />
        <AppLayout />
      </Router>
    </>
  );
}

export default App;
