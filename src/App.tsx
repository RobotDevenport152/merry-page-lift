import React, { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";
import Index from "./pages/Index";

// Lazy-loaded routes for performance
const Shop = React.lazy(() => import("./pages/Shop"));
const ProductDetail = React.lazy(() => import("./pages/ProductDetail"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const OrderSuccess = React.lazy(() => import("./pages/OrderSuccess"));
const Traceability = React.lazy(() => import("./pages/Traceability"));
const Admin = React.lazy(() => import("./pages/Admin"));
const Contact = React.lazy(() => import("./pages/Contact"));
const GrowersInfo = React.lazy(() => import("./pages/GrowersInfo"));
const Wholesale = React.lazy(() => import("./pages/Wholesale"));
const ChinaLanding = React.lazy(() => import("./pages/ChinaLanding"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const MyOrders = React.lazy(() => import("./pages/MyOrders"));
const Compare = React.lazy(() => import("./pages/Compare"));
const Returns = React.lazy(() => import("./pages/Returns"));
const GrowerBatches = React.lazy(() => import("./pages/GrowerBatches"));
const GrowerCredits = React.lazy(() => import("./pages/GrowerCredits"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="font-body text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/traceability" element={<Traceability />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/growers-info" element={<GrowersInfo />} />
              <Route path="/wholesale" element={<Wholesale />} />
              <Route path="/china" element={<ChinaLanding />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/grower/batches" element={<GrowerBatches />} />
              <Route path="/grower/credits" element={<GrowerCredits />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
