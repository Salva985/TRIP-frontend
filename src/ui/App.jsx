import { Outlet, NavLink } from 'react-router-dom'
import HealthBadge from './HealthBadge.jsx'

const linkCls = ({ isActive }) =>
  `px-2 py-1 rounded ${isActive ? 'bg-black text-white' : 'hover:underline'}`

export default function App() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">TRIP App</h1>
          <nav className="mt-3 flex items-center text-sm space-x-6">

            <NavLink to="/" end className={linkCls}>Home</NavLink>
            <NavLink to="/trips" className={linkCls}>Trips</NavLink>
            <NavLink to="/activities/new" className={linkCls}>New Activity</NavLink>

          </nav>
        </div>
        <HealthBadge />
      </header>
      <Outlet />
    </div>
  )
}