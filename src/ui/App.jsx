import { Outlet, NavLink } from 'react-router-dom'
import HealthBadge from './HealthBadge.jsx'

const linkCls = ({ isActive }) =>
  `px-2 py-1 rounded ${isActive ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-blue-500 hover:text-white'}`

export default function App() {
  return (
    <div className="min-h-screen bg-blue-100 text-gray-900">
      <header className="flex items-center justify-between mb-6 bg-gray-900 text-white p-4 rounded-lg shadow">
        <div>
          <h1 className="text-2xl font-bold">TRIP App</h1>
          <nav className="mt-3 flex items-center text-sm space-x-6">

            <NavLink to="/" end className={linkCls}>Home</NavLink>
            <NavLink to="/trips" className={linkCls}>Trips</NavLink>
            <NavLink to="/trips/new" className={linkCls}>New Trip</NavLink>
            <NavLink to="/activities/new" className={linkCls}>New Activity</NavLink>

          </nav>
        </div>
        <HealthBadge />
      </header>
      <Outlet />
    </div>
  )
}