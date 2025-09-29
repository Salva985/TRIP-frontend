import { useNavigate } from "react-router-dom"
import TripForm from "./TripForm"

export default function TripCreatePage() {
  const navigate = useNavigate()
  return (
    <div className="max-w-xl">
      <TripForm onSuccess={() => navigate('/trips')} onCancel={() => navigate('/trips')} />
    </div>
  )
}