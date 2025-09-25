import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './ui/App.jsx'
import ActivitiesList from './ui/ActivitiesList.jsx'
import './index.css'

const router = createBrowserRouter([
  { path: '/', 
    element: <App />, 
    children: [
      { index: true, element: <ActivitiesList /> },
    ] }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
