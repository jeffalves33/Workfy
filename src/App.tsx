import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "./components/ProtectedRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import SearchPage from "./pages/Search";
import SpaceDetail from "./pages/SpaceDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MySpaces from "./pages/MySpaces";
import EditSpacePage from "./pages/EditSpacePage";
import MyReservations from "./pages/profile/MyReservations";
import MyProfile from "./pages/profile/MyProfile";
import MySettings from "./pages/profile/MySettings";
import ConversationPage from "./pages/ConversationPage";
import MessagesPage from "./pages/MessagesPage";
import AdminDashboard from "./pages/AdminDashboard";
import PaymentPage from "./pages/PaymentPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/buscar" element={<SearchPage />} />
              <Route path="/espaco/:id" element={<SpaceDetail />} />
              <Route path="/meus-espacos" element={<MySpaces />} />
              <Route path="/meus-espacos/:id/editar" element={<EditSpacePage />} />
              <Route path="/perfil/dados" element={<MyProfile />} />
              <Route path="/perfil/reservas" element={<MyReservations />} />
              <Route path="/perfil/configuracoes" element={<MySettings />} />
              <Route path="/mensagens" element={<MessagesPage />} />
              <Route path="/mensagens/:conversationId" element={<ConversationPage />} />
              <Route path="/reserva/:reservationId/pagamento" element={<PaymentPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/entrar" element={<Login />} />
              <Route path="/cadastrar" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
