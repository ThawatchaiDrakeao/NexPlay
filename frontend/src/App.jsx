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
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              NexPlay
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              รายการสนาม
            </h1>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              เลือกสนามที่คุณต้องการจองได้ทันที
            </p>
          </div>
        </section>

        {loading && (
          <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="text-center">
              <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-sm font-medium text-gray-600">
                กำลังโหลดข้อมูลสนาม...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && fields.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500 shadow-sm">
            ไม่มีข้อมูลสนามในตอนนี้
          </div>
        )}

        {!loading && !error && fields.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {fields.map((field) => (
              <div
                key={field.id}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-lg shadow-gray-200/70"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {field.sport_type || field.sportType || "กีฬา"}
                  </span>
                  <span className="text-xs text-gray-400">#{field.code || "-"}</span>
                </div>

                <h2 className="text-xl font-bold text-gray-900">
                  {field.name || "สนามไม่ระบุชื่อ"}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  สนามสำหรับการเล่นกีฬาและจองเวลาได้ทันที
                </p>

                <div className="mt-5 flex items-center justify-between text-sm text-gray-600">
                  <span>ความจุ</span>
                  <span className="font-semibold text-gray-900">
                    {field.capacity || "-"}
                  </span>
                </div>

                <button className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
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
