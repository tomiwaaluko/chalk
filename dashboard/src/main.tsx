import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

const App = lazy(() => import('./App'))
const LandingPage = lazy(() => import('./pages/LandingPage'))

const loadingFallback = (
  <div className="flex min-h-screen items-center justify-center bg-canvas">
    {/* The chalk tick, holding the space until the app arrives. */}
    <span className="sr-only">Loading Chalk</span>
    <span className="h-6 w-[3px] animate-pulse rounded-full bg-chalk" />
  </div>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={loadingFallback}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<App />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
