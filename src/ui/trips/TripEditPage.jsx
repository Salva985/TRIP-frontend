// src/ui/trips/TripEditPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TripForm from "./TripForm.jsx";
import { getTrip } from "../../api/tripsApi";

export default function TripEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: null, trip: null });

  useEffect(() => {
    let off = false;
    setState(s => ({ ...s, loading: true, error: null }));
    getTrip(id)
      .then(t => !off && setState({ loading: false, error: null, trip: t }))
      .catch(e => !off && setState({ loading: false, error: e, trip: null }));
    return () => { off = true; };
  }, [id]);

  if (state.loading) return <p>Loading trip…</p>;
  if (state.error)   return <p className="text-red-600">Error: {state.error.message}</p>;
  if (!state.trip)   return <p>Not found</p>;

  return (
    <TripForm
      mode="edit"
      initialData={{
        id: state.trip.id,
        name: state.trip.name,
        startDate: state.trip.startDate,
        endDate: state.trip.endDate,
        destinationId: state.trip.destinationId ?? state.trip.destination?.id,
        tripType: state.trip.tripType ?? "",
        notes: state.trip.notes ?? "",
      }}
      onSuccess={(updated) => navigate(`/trips/${updated.id ?? id}`)}
      onCancel={() => navigate(`/trips/${id}`)}
    />
  );
}