import { Outlet } from 'react-router-dom'
import HealthBadge from './HealthBadge.jsx'

export default function App() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">TRIP Frontend — Activities</h1>
        <HealthBadge />
      </header>
      <Outlet />
    </div>
  )
}