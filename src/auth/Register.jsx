import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

function range(n) {
  return Array.from({ length: n }, (_, i) => i);
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  const years = useMemo(
    () => range(100).map((i) => String(new Date().getFullYear() - i)),
    []
  );
  const months = useMemo(
    () => range(12).map((i) => String(i + 1).padStart(2, "0")),
    []
  );
  const days = useMemo(
    () => range(31).map((i) => String(i + 1).padStart(2, "0")),
    []
  );

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
  
    const dob = year && month && day ? `${year}-${month}-${day}` : null;
  
    try {
      await register({
        username: username.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        dob,
        password, 
      });
      navigate("/login");
    } catch (e2) {
      setErr(e2); // e2.message will show cleanly thanks to client()
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="min-h-screen bg-blue-100 flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="space-y-4 bg-white rounded-2xl shadow p-6 ring-1 ring-gray-200"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold">Create account</h2>
          <p className="text-sm text-gray-600 mt-1">
            Join TRIP App to plan trips and manage activities with ease.
          </p>
        </div>

        <label className="block">
          <span className="text-sm">Username</span>
          <input
            className="border rounded px-3 py-2 w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm">Full name</span>
          <input
            className="border rounded px-3 py-2 w-full"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm">Email</span>
          <input
            type="email"
            className="border rounded px-3 py-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm">Password</span>
          <input
            type="password"
            className="border rounded px-3 py-2 w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        <div>
          <span className="text-sm block mb-1">Date of birth (DOB)</span>
          <div className="grid grid-cols-3 gap-2">
            <select
              className="border rounded px-2 py-2"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              aria-label="Day"
            >
              <option value="">DD</option>
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              className="border rounded px-2 py-2"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              aria-label="Month"
            >
              <option value="">MM</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              className="border rounded px-2 py-2"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              aria-label="Year"
            >
              <option value="">YYYY</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {err && <p className="text-sm text-red-600">{err.message}</p>}

        <button
          className="w-full px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60"
          disabled={busy}
        >
          {busy ? "Creating…" : "Register"}
        </button>

        {/* Links stacked underneath */}
        <div className="mt-4 flex justify-between text-sm">
          <Link
            to="/login"
            className="text-blue-600 hover:underline"
          >
            I already have an account
          </Link>
          <Link
            to="/"
            className="text-gray-600 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </form>
    </section>
  );
}
