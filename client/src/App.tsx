import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";
import { WelcomeAnimation } from "@/components/WelcomeAnimation";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import Landing from "@/pages/Landing";
import Features from "@/pages/Features";
import FeaturesGuru from "@/pages/FeaturesGuru";
import FeaturesUMF from "@/pages/FeaturesUMF";
import FeaturesCalendar from "@/pages/FeaturesCalendar";
import AssetPage from "@/pages/AssetPage";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Learn from "@/pages/Learn";
import AboutUs from "@/pages/AboutUs";
import AdminGuruDigest from "@/pages/AdminGuruDigest";
import AdminHealth from "@/pages/AdminHealth";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/features" component={Features} />
      <Route path="/features/guru" component={FeaturesGuru} />
      <Route path="/features/umf" component={FeaturesUMF} />
      <Route path="/features/calendar" component={FeaturesCalendar} />
      <Route path="/asset/:symbol" component={AssetPage} />
      <Route path="/signin" component={SignIn} />
      <Route path="/signup" component={SignUp} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/learn" component={Learn} />
      <Route path="/about" component={AboutUs} />
      <Route path="/admin/guru-digest">
        <ProtectedAdminRoute>
          <AdminGuruDigest />
        </ProtectedAdminRoute>
      </Route>
      <Route path="/admin/health">
        <ProtectedAdminRoute>
          <AdminHealth />
        </ProtectedAdminRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WelcomeAnimation />
          <ExitIntentModal />
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
