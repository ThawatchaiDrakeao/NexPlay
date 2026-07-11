import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = "https://nexplay-backend-eoa4.onrender.com";
const FIELDS_URL = `${API_BASE_URL}/api/public/fields`;
const AVAILABILITY_URL = `${API_BASE_URL}/api/public/availability`;

const formatDateInput = (dateValue) => {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatSlotTime = (value) => {
  if (!value) return "";

  return new Date(value).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
};

const formatSlotLabel = (slot) => {
  const start = formatSlotTime(slot?.start_time);
  const end = formatSlotTime(slot?.end_time);
  return `${start} - ${end}`;
};

function App() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedField, setSelectedField] = useState(null);
  const [view, setView] = useState("list");
  const [selectedDate, setSelectedDate] = useState(formatDateInput(new Date()));
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(FIELDS_URL);
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

  useEffect(() => {
    if (!selectedField || !selectedDate) {
      return;
    }

    const fetchAvailability = async () => {
      setAvailabilityLoading(true);
      setAvailabilityError("");
      setSelectedSlot(null);
      setBookingConfirmed(false);

      try {
        const response = await fetch(
          `${AVAILABILITY_URL}?fieldId=${selectedField.id}&date=${selectedDate}`,
        );

        if (!response.ok) {
          throw new Error(`Availability request failed with status ${response.status}`);
        }

        const data = await response.json();
        const slots = Array.isArray(data?.slots) ? data.slots : [];
        setAvailabilitySlots(slots);
      } catch (err) {
        console.error("Failed to load availability:", err);
        setAvailabilityError("ไม่สามารถโหลดช่วงเวลาว่างได้ในขณะนี้");
        setAvailabilitySlots([]);
      } finally {
        setAvailabilityLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedField, selectedDate]);

  const handleSelectField = (field) => {
    setSelectedField(field);
    setView("booking");
    setSelectedDate(formatDateInput(new Date()));
    setAvailabilitySlots([]);
    setSelectedSlot(null);
    setBookingConfirmed(false);
  };

  const handleGoBack = () => {
    setView("list");
    setSelectedField(null);
    setSelectedDate(formatDateInput(new Date()));
    setAvailabilitySlots([]);
    setSelectedSlot(null);
    setBookingConfirmed(false);
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot) {
      return;
    }
    setBookingConfirmed(true);
  };

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
            {view === "list" ? "รายการสนาม" : "จองสนาม"}
          </h1>
          <p style={{ margin: 0, fontSize: "15px", color: "#6b7280" }}>
            {view === "list"
              ? "เลือกสนามที่คุณต้องการจองได้ทันที"
              : "เลือกวันที่และช่วงเวลาว่างจากระบบจริง"}
          </p>
        </section>

        {view === "list" && (
          <>
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
                      type="button"
                      onClick={() => handleSelectField(field)}
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
          </>
        )}

        {view === "booking" && selectedField && (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              padding: "20px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
            }}
          >
            <button
              type="button"
              onClick={handleGoBack}
              style={{
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
                borderRadius: "999px",
                padding: "8px 12px",
                cursor: "pointer",
                marginBottom: "16px",
                fontWeight: 600,
              }}
            >
              ← กลับ
            </button>

            <div style={{ marginBottom: "18px" }}>
              <h2 style={{ margin: "0 0 6px", fontSize: "22px", color: "#111827" }}>
                {selectedField.name || "สนามไม่ระบุชื่อ"}
              </h2>
              <p style={{ margin: 0, color: "#6b7280" }}>
                ประเภทกีฬา: {selectedField.sport_type || selectedField.sportType || "-"}
              </p>
            </div>

            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 700,
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              เลือกวันที่
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: "12px",
                padding: "10px 12px",
                fontSize: "14px",
                marginBottom: "16px",
              }}
            />

            {availabilityLoading && (
              <div style={{ color: "#4b5563", marginBottom: "12px" }}>
                กำลังโหลดช่วงเวลาว่าง...
              </div>
            )}

            {availabilityError && (
              <div style={{ color: "#b91c1c", marginBottom: "12px" }}>
                {availabilityError}
              </div>
            )}

            {!availabilityLoading && !availabilityError && availabilitySlots.length === 0 && (
              <div style={{ color: "#6b7280", marginBottom: "12px" }}>
                ไม่มีช่วงเวลาว่างในวันที่เลือกนี้
              </div>
            )}

            {!availabilityLoading && !availabilityError && availabilitySlots.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                  เลือกช่วงเวลา
                </div>
                <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
                  {availabilitySlots.map((slot) => {
                    const slotLabel = formatSlotLabel(slot);
                    const isSelected = selectedSlot?.start_time === slot.start_time;

                    return (
                      <button
                        key={slot.start_time}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        style={{
                          border: isSelected ? "1px solid #2563eb" : "1px solid #d1d5db",
                          borderRadius: "12px",
                          padding: "10px 12px",
                          backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
                          color: isSelected ? "#1d4ed8" : "#111827",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {slotLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                paddingTop: "16px",
              }}
            >
              <h3 style={{ margin: "0 0 8px", fontSize: "16px", color: "#111827" }}>
                ยืนยันการจอง
              </h3>
              <p style={{ margin: "0 0 12px", color: "#6b7280" }}>
                {selectedSlot
                  ? `คุณเลือกเวลา ${formatSlotLabel(selectedSlot)} แล้ว`
                  : "กรุณาเลือกช่วงเวลาจากรายการด้านบนก่อน"}
              </p>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={!selectedSlot}
                style={{
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  backgroundColor: selectedSlot ? "#2563eb" : "#9ca3af",
                  color: "#ffffff",
                  fontWeight: 700,
                  cursor: selectedSlot ? "pointer" : "not-allowed",
                  width: "100%",
                }}
              >
                {bookingConfirmed ? "ยืนยันแล้ว" : "ยืนยันการจอง"}
              </button>

              {bookingConfirmed && (
                <div
                  style={{
                    marginTop: "12px",
                    borderRadius: "12px",
                    padding: "12px",
                    backgroundColor: "#ecfdf5",
                    color: "#047857",
                    fontWeight: 600,
                  }}
                >
                  การจองของคุณถูกเตรียมไว้เรียบร้อยแล้ว
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
