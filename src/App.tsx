import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Onboarding, hasCompletedOnboarding } from "@/components/Onboarding";
import Home from "./pages/Home";
import Prayers from "./pages/Prayers";
import Qadha from "./pages/Qadha";
import Habits from "./pages/Habits";
import Insights from "./pages/Insights";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Missions from "./pages/Missions";
import Auth from "./pages/Auth";
import OAuthConsent from "./pages/OAuthConsent";


const queryClient = new QueryClient();

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const };

function AnimatedRoutes() {
  const location = useLocation();

  const wrap = (node: React.ReactNode) => (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
    >
      {node}
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={wrap(<Home />)} />
        <Route path="/prayers" element={wrap(<Prayers />)} />
        <Route path="/qadha" element={wrap(<Qadha />)} />
        <Route path="/habits" element={wrap(<Habits />)} />
        <Route path="/insights" element={wrap(<Insights />)} />
        <Route path="/calendar" element={wrap(<Calendar />)} />
        <Route path="/settings" element={wrap(<Settings />)} />
        <Route path="/missions" element={wrap(<Missions />)} />
        <Route path="*" element={wrap(<NotFound />)} />

      </Routes>
    </AnimatePresence>
  );
}

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(!hasCompletedOnboarding());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
          <Layout>
            <AnimatedRoutes />
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
