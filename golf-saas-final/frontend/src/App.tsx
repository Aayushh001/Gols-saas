
import { useEffect, useState } from "react";
import { API, setToken } from "./api";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type Score = { id: number; score: number };

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [scores, setScores] = useState<Score[]>([]);
  const [avg, setAvg] = useState(0);
  const [token, setT] = useState<string | null>(null);

  const register = async () => {
    await API.post("/auth/register", { email, password });
    alert("Registered. Now login.");
  };

  const login = async () => {
    const res = await API.post("/auth/login", { email, password });
    setToken(res.data.token);
    setT(res.data.token);
    localStorage.setItem("token", res.data.token);
    await fetchScores();
  };

  const fetchScores = async () => {
    const res = await API.get("/scores");
    setScores(res.data.scores);
    setAvg(res.data.avg);
  };

  const addScore = async () => {
    const s = prompt("Enter score");
    if (!s) return;
    await API.post("/scores", { score: Number(s) });
    await fetchScores();
  };

  const runDraw = async () => {
    const res = await API.get("/draw");
    alert(`Winner: ${res.data.winner.email} | Prize: $${res.data.prize}`);
  };

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      setToken(t);
      setT(t);
      fetchScores();
    }
  }, []);

  return (
    <div className="min-h-screen text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🏌️ Golf SaaS Dashboard</h1>

      <div className="bg-gray-800 p-4 rounded-xl mb-6">
        <input className="p-2 m-2 text-black" placeholder="Email" onChange={e=>setEmail(e.target.value)} />
        <input className="p-2 m-2 text-black" type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)} />
        <button className="bg-blue-500 px-3 py-2 m-2 rounded" onClick={register}>Register</button>
        <button className="bg-green-500 px-3 py-2 m-2 rounded" onClick={login}>Login</button>
      </div>

      {token && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-xl">
              <p>Average (last 5)</p>
              <p className="text-2xl">{avg.toFixed(2)}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl">
              <p>Total Scores</p>
              <p className="text-2xl">{scores.length}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl">
              <p>Best Score</p>
              <p className="text-2xl">{scores.length ? Math.min(...scores.map(s=>s.score)) : 0}</p>
            </div>
          </div>

          <div className="mb-6">
            <button className="bg-purple-500 px-4 py-2 mr-2 rounded" onClick={addScore}>Add Score</button>
            <button className="bg-pink-500 px-4 py-2 rounded" onClick={runDraw}>Run Draw</button>
          </div>

          <div className="bg-gray-800 p-4 rounded-xl mb-6">
            <h2 className="mb-2">Score Trend</h2>
            <LineChart width={600} height={250} data={scores}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="id" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="score" />
            </LineChart>
          </div>

          <div className="bg-gray-800 p-4 rounded-xl">
            <h2 className="mb-2">Scores</h2>
            <ul>
              {scores.map(s => <li key={s.id}>⛳ {s.score}</li>)}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
