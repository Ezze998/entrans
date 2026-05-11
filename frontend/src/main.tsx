// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import './index.css'; // Pastikan Tailwind sudah di-import di sini

// 1. Inisialisasi QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Menghindari refetch otomatis saat window fokus (opsional, tergantung kebutuhan UX)
      refetchOnWindowFocus: false, 
      // Berapa kali percobaan ulang jika API error
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. Bungkus App dengan Provider */}
    <QueryClientProvider client={queryClient}>
      <App />
      
      {/* 3. Devtools (Hanya muncul di mode development) */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  </React.StrictMode>
);