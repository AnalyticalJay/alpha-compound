import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import MobileBottomNav from "./components/MobileBottomNav";
import { shouldShowMobileNav } from "@shared/mobileNav";
import { SeoMeta } from "./components/SeoMeta";

const NotFound = lazy(() => import("@/pages/NotFound"));
const Home = lazy(() => import("./pages/Home"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const Account = lazy(() => import("./pages/Account"));
const Notifications = lazy(() => import("./pages/Notifications"));
const ApprovalPending = lazy(() => import("./pages/ApprovalPending"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const OrderCancelled = lazy(() => import("./pages/OrderCancelled"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminProductEdit = lazy(() => import("./pages/admin/AdminProductEdit"));
const AdminOrderDetail = lazy(() => import("./pages/admin/AdminOrderDetail"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminBulkImport = lazy(() => import("./pages/admin/AdminBulkImport"));
const AdminBulkImages = lazy(() => import("./pages/admin/AdminBulkImages"));

function Router() {
  return (
    <>
      <SeoMeta />
      <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" aria-label="Loading page" />}>
        <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/products" component={Products} />
      <Route path="/products/:slug" component={ProductDetail} />

      {/* Authenticated */}
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-success/:orderId" component={OrderSuccess} />
      <Route path="/account" component={Account} />
      <Route path="/account/:tab" component={Account} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/approval-pending" component={ApprovalPending} />
      <Route path="/orders/:orderId" component={OrderDetail} />
      <Route path="/order-cancelled" component={OrderCancelled} />

      {/* Admin */}
      <Route path="/admin">
        {() => (
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/users">
        {() => (
          <AdminLayout>
            <AdminUsers />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/products">
        {() => (
          <AdminLayout>
            <AdminProducts />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/products/new">
        {() => (
          <AdminLayout>
            <AdminProductEdit />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/products/:id/edit">
        {(params) => (
          <AdminLayout>
            <AdminProductEdit productId={parseInt((params as any).id)} />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/bulk-import">
        {() => (
          <AdminLayout>
            <AdminBulkImport />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/bulk-images">
        {() => (
          <AdminLayout>
            <AdminBulkImages />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/categories">
        {() => (
          <AdminLayout>
            <AdminCategories />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/orders">
        {() => (
          <AdminLayout>
            <AdminOrders />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/payments">
        {() => (
          <AdminLayout>
            <AdminPayments />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/notifications">
        {() => (
          <AdminLayout>
            <AdminNotifications />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/reports">
        {() => (
          <AdminLayout>
            <AdminReports />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/orders/:orderId">
        {() => (
          <AdminLayout>
            <AdminOrderDetail />
          </AdminLayout>
        )}
      </Route>

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
        </Switch>
      </Suspense>
    </>
  );
}

function AppShell() {
  const [location] = useLocation();
  const showMobileNav = shouldShowMobileNav(location);

  return (
    <div className={showMobileNav ? "min-h-screen pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-0" : "min-h-screen"}>
      <Router />
      <MobileBottomNav />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <AppShell />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
