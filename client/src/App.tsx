import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/features" component={Features} />
      <Route path="/features/guru">
        <ProtectedRoute>
          <FeaturesGuru />
        </ProtectedRoute>
      </Route>
      <Route path="/features/umf">
        <ProtectedRoute>
          <FeaturesUMF />
        </ProtectedRoute>
      </Route>
      <Route path="/features/calendar">
        <ProtectedRoute>
          <FeaturesCalendar />
        </ProtectedRoute>
      </Route>
      <Route path="/asset/:symbol">
        <ProtectedRoute>
          <AssetPage />
        </ProtectedRoute>
      </Route>
      <Route path="/signin" component={SignIn} />
      <Route path="/signup" component={SignUp} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/learn" component={Learn} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
