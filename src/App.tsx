import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/layout/Navbar';
import { BottomTabs } from './components/layout/BottomTabs';
import { Today } from './pages/Today';
import { Matches } from './pages/Matches';
import { Teams } from './pages/Teams';
import { Table } from './pages/Table';
import { Picks } from './pages/Picks';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <div className="min-h-screen bg-[#2B002E] text-white flex flex-col font-sans selection:bg-[#E90052] selection:text-white">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Today />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/table" element={<Table />} />
              <Route path="/picks" element={<Picks />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <BottomTabs />
        </div>
      </HashRouter>
    </QueryClientProvider>
  );
}
