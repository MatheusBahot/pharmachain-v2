import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import Layout        from "./components/Layout";
import Login         from "./pages/Login";
import About         from "./pages/About";
import Dashboard     from "./pages/Dashboard";
import Batches       from "./pages/Batches";
import Inventory     from "./pages/Inventory";
import Explorer      from "./pages/Explorer";
import Prescriptions from "./pages/Prescriptions";
import Users         from "./pages/Users";
import Terms         from "./pages/Terms";
import Privacy       from "./pages/Privacy";
import Contact       from "./pages/Contact";
import { useAuthStore } from "./store/auth";

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } }
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login"   element={<Login />} />
          <Route path="/terms"   element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/about" replace />} />
            <Route path="about"         element={<About />} />
            <Route path="dashboard"     element={<Dashboard />} />
            <Route path="batches"       element={<Batches />} />
            <Route path="inventory"     element={<Inventory />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="explorer"      element={<Explorer />} />
            <Route path="users"         element={<Users />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right"
        toastOptions={{ style: { borderRadius: 10, fontSize: 14 } }} />
    </QueryClientProvider>
  );
}
