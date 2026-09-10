import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth, type AuthUser } from '@workspace/replit-auth-web';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Layout } from '@/components/layout';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

import OpportunitiesList from '@/pages/opportunities-list';
import OpportunityNew from '@/pages/opportunity-new';
import OpportunityDetail from '@/pages/opportunity-detail';
import OpportunityEdit from '@/pages/opportunity-edit';
import OpportunityRuns from '@/pages/opportunity-runs';
import AssetsPage from '@/pages/assets';
import Discovery from '@/pages/discovery';
import Readiness from '@/pages/readiness';
import NeedsYouPage from '@/pages/needs-you';

const queryClient = new QueryClient();

function Router({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  return (
    <Layout user={user} onLogout={onLogout}>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={OpportunitiesList} />
          <Route path="/assets" component={AssetsPage} />
          <Route path="/needs-you" component={NeedsYouPage} />
          <Route path="/opportunities/new" component={OpportunityNew} />
          <Route path="/opportunities/:id/runs" component={OpportunityRuns} />
          <Route path="/opportunities/:id/edit" component={OpportunityEdit} />
          <Route path="/opportunities/:id" component={OpportunityDetail} />
          <Route path="/discovery" component={Discovery} />
          <Route path="/readiness" component={Readiness} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </Layout>
  );
}

function AuthLoading() {
  return (
    <div className="min-h-[100dvh] grid place-items-center bg-muted/30">
      <div className="text-sm text-muted-foreground">Checking your session…</div>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-[100dvh] grid place-items-center bg-muted/30 p-6">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            $
          </div>
          <div>
            <h1 className="text-xl font-semibold">Money Scout</h1>
            <p className="text-sm text-muted-foreground">Private opportunity tracking</p>
          </div>
        </div>
        <p className="mb-6 text-sm leading-6 text-muted-foreground">
          Sign in with your Replit account to access this private workspace.
        </p>
        <button
          type="button"
          onClick={onLogin}
          className="h-10 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}

function AccessDenied({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-[100dvh] grid place-items-center bg-muted/30 p-6">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <h1 className="text-xl font-semibold">Access not approved</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Your account is signed in, but it is not on the Money Scout access list.
        </p>
        <button
          type="button"
          onClick={onLogout}
          className="mt-6 h-10 rounded-md border px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  const auth = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          {auth.isLoading ? (
            <AuthLoading />
          ) : !auth.isAuthenticated ? (
            <LoginScreen onLogin={auth.login} />
          ) : !auth.authorized ? (
            <AccessDenied onLogout={auth.logout} />
          ) : (
            <Router user={auth.user!} onLogout={auth.logout} />
          )}
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;