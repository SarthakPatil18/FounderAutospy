import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { SignInForm, SignUpForm } from "@/components/auth-forms";

import Home from "@/pages/home";
import Explore from "@/pages/explore";
import Submit from "@/pages/submit";
import StartupDetail from "@/pages/startup-detail";
import Insights from "@/pages/insights";
import NotFound from "@/pages/not-found";
import { Nav } from "@/components/layout/nav";

const queryClient = new QueryClient();

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      {children}
    </div>
  );
}

function Routes() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          <Route path="/sign-in" component={() => (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center py-16">
              <SignInForm />
            </div>
          )} />
          <Route path="/sign-up" component={() => (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center py-16">
              <SignUpForm />
            </div>
          )} />
          
          <Route>
            <Layout>
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/explore" component={Explore} />
                <Route path="/submit" component={Submit} />
                <Route path="/startups/:id" component={StartupDetail} />
                <Route path="/insights" component={Insights} />
                <Route component={NotFound} />
              </Switch>
            </Layout>
          </Route>
        </Switch>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </WouterRouter>
  );
}

export default App;
