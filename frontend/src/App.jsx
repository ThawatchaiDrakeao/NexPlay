import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://nexplay-backend-eoa4.onrender.com/api/public/fields";

function App() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        setFields(Array.isArray(data) ? data : data.fields || []);
      } catch (err) {
        console.error("Failed to load fields:", err);
        setError("ไม่สามารถโหลดข้อมูลสนามได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  return (
    <main className="app-shell">
      <div className="app-container">
        <h1>รายการสนาม</h1>
        <p>ข้อมูลสนามจากระบบ NexPlay</p>

        {loading && <p>กำลังโหลดข้อมูลสนาม...</p>}

        {error && <div className="error-message">{error}</div>}

        {!loading && !error && fields.length === 0 && (
          <p>ไม่มีข้อมูลสนามในตอนนี้</p>
        )}

        {!loading && !error && fields.length > 0 && (
          <div className="field-list">
            {fields.map((field) => (
              <div className="field-card" key={field.id}>
                <h3>{field.name || "สนามไม่ระบุชื่อ"}</h3>
                <p>
                  <strong>ประเภทกีฬา:</strong>{" "}
                  {field.sport_type || field.sportType || "-"}
                </p>
                <p>
                  <strong>Code:</strong> {field.code || "-"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
