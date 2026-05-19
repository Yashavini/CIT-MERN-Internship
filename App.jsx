import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [title, setTitle] = useState("");
  const [memory, setMemory] = useState("");
  const [capsules, setCapsules] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("EchoMind Loaded");
  }, []);

  const addCapsule = () => {
    if (title === "" || memory === "") {
      setError("Please fill all fields");
      return;
    }

    const newCapsule = {
      id: Date.now(),
      title,
      memory,
    };

    setCapsules([...capsules, newCapsule]);

    setTitle("");
    setMemory("");
    setError("");
  };

  const deleteCapsule = (id) => {
    const updated = capsules.filter(
      (capsule) => capsule.id !== id
    );

    setCapsules(updated);
  };

  return (
    <div className="container">
      <h1>🧠 EchoMind</h1>

      <p className="subtitle">
        Preserve your meaningful memories.
      </p>

      <div className="form-box">

        <input
          type="text"
          placeholder="Memory Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Write your memory..."
          value={memory}
          onChange={(e) => setMemory(e.target.value)}
        ></textarea>

        {error && <p className="error">{error}</p>}

        <button onClick={addCapsule}>
          Save Capsule
        </button>

      </div>

      <div className="cards">

        {capsules.map((capsule) => (
          <div className="card" key={capsule.id}>

            <h2>{capsule.title}</h2>

            <p>{capsule.memory}</p>

            <button
              className="delete-btn"
              onClick={() => deleteCapsule(capsule.id)}
            >
              Delete
            </button>

          </div>
        ))}

      </div>
    </div>
  );
}

export default App;