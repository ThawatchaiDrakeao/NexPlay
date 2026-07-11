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
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        padding: "24px 16px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <section
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            padding: "24px",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#2563eb", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            NexPlay
          </p>
          <h1 style={{ margin: "8px 0 6px", fontSize: "32px", fontWeight: 700, color: "#111827" }}>
            รายการสนาม
          </h1>
          <p style={{ margin: 0, fontSize: "15px", color: "#6b7280" }}>
            เลือกสนามที่คุณต้องการจองได้ทันที
          </p>
        </section>

        {loading && (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              padding: "32px",
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.05)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  margin: "0 auto 12px",
                  border: "4px solid #2563eb",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              ></div>
              <p style={{ margin: 0, fontSize: "14px", color: "#4b5563" }}>
                กำลังโหลดข้อมูลสนาม...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "16px",
              padding: "14px 16px",
              color: "#b91c1c",
              boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && fields.length === 0 && (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              padding: "32px",
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.05)",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            ไม่มีข้อมูลสนามในตอนนี้
          </div>
        )}

        {!loading && !error && fields.length > 0 && (
          <div
            style={{
              display: "grid",
              gap: "16px",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            }}
          >
            {fields.map((field) => (
              <div
                key={field.id}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  padding: "20px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: "#eff6ff",
                      color: "#2563eb",
                      borderRadius: "999px",
                      padding: "6px 10px",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {field.sport_type || field.sportType || "กีฬา"}
                  </span>
                  <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                    #{field.code || "-"}
                  </span>
                </div>

                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#111827" }}>
                  {field.name || "สนามไม่ระบุชื่อ"}
                </h2>
                <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#6b7280" }}>
                  สนามสำหรับการเล่นกีฬาและจองเวลาได้ทันที
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "16px",
                    fontSize: "14px",
                    color: "#4b5563",
                  }}
                >
                  <span>ความจุ</span>
                  <span style={{ fontWeight: 700, color: "#111827" }}>
                    {field.capacity || "-"}
                  </span>
                </div>

                <button
                  style={{
                    marginTop: "18px",
                    width: "100%",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
                  }}
                >
                  จอง
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
