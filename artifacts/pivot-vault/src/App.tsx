import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { useEffect, useRef } from "react";

import Home from "@/pages/home";
import Explore from "@/pages/explore";
import Submit from "@/pages/submit";
import StartupDetail from "@/pages/startup-detail";
import Insights from "@/pages/insights";
import NotFound from "@/pages/not-found";
import { Nav } from "@/components/layout/nav";

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY');

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#171717",
    colorForeground: "#171717",
    colorMutedForeground: "#888888",
    colorDanger: "hsl(0, 84%, 60%)",
    colorBackground: "#ffffff",
    colorInput: "#ffffff",
    colorInputForeground: "#171717",
    colorNeutral: "#ebebeb",
    fontFamily: "Inter, sans-serif",
    borderRadius: "6px",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-xl w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#171717] font-semibold",
    headerSubtitle: "text-[#888888]",
    socialButtonsBlockButtonText: "text-[#171717]",
    formFieldLabel: "text-[#4d4d4d]",
    footerActionLink: "text-[#0070f3]",
    footerActionText: "text-[#888888]",
    dividerText: "text-[#888888]",
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      {children}
    </div>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/sign-in/*?" component={() => (
              <div className="min-h-screen bg-[#fafafa] flex items-center justify-center py-16">
                <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
              </div>
            )} />
            <Route path="/sign-up/*?" component={() => (
              <div className="min-h-screen bg-[#fafafa] flex items-center justify-center py-16">
                <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
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
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
