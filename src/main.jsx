import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './ui/App.jsx'
import ActivitiesList from './ui/ActivitiesList.jsx'
import ActivityDetail from './ui/ActivityDetail.jsx'
import ActivityForm from './ui/ActivityForm.jsx'
import TripsList from './ui/TripsList.jsx'
import TripDetail from './ui/TripDetails.jsx'
import TripCreatePage from "./ui/TripCreatePage.jsx"
import './index.css'

const router = createBrowserRouter([
  { path: '/', 
    element: <App />, 
    children: [
      //Home
      { index: true, element: <TripsList /> },

      //Trips pages
      { path: 'trips', element: <TripsList /> },
      { path: 'trips/new', element: <TripCreatePage /> },
      { path: 'trips/:id', element: <TripDetail /> }, 

      //Activities pages
      { path: 'activities', element: <ActivitiesList /> },
      { path: 'activities/new', element: <ActivityForm mode="create" /> },
      { path: 'activities/:id', element: <ActivityDetail /> },
      { path: 'activities/:id/edit', element: <ActivityForm mode="edit" /> },
    ] }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
