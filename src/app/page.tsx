'use client';

import dynamic from 'next/dynamic';
import { LanguageProvider } from '../contexts/LanguageContext';

const App = dynamic(() => import('../App'), { ssr: false });

export default function Page() {
  return (
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
}
