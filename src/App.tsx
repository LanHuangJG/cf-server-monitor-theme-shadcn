import { HashRouter, Route, Routes } from 'react-router-dom'

import { Dashboard } from '@/pages/dashboard'
import { ServerDetail } from '@/pages/server-detail'

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-svh bg-background">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/server/:id" element={<ServerDetail />} />
        </Routes>
      </div>
    </HashRouter>
  )
}
