import { useEffect, useState } from "react";
import liff from "@line/liff";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://nexplay-backend-eoa4.onrender.com");
const LIFF_ID = import.meta.env.VITE_LIFF_ID || "";
const FIELDS_URL = `${API_BASE_URL}/api/public/fields`;
const AVAILABILITY_URL = `${API_BASE_URL}/api/public/availability`;

const formatDateInput = (dateValue) => {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (dateValue, amount) => {
  const nextDate = new Date(dateValue);
  nextDate.setDate(nextDate.getDate() + amount);
  return formatDateInput(nextDate);
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

const getStoredAuthContext = () => ({
  token: localStorage.getItem("nexplay_access_token") || "",
  tenantId: localStorage.getItem("nexplay_tenant_id") || "",
  user: JSON.parse(localStorage.getItem("nexplay_user") || "null"),
});

const persistAuthContext = (token, user, tenantId = "") => {
  localStorage.setItem("nexplay_access_token", token || "");
  localStorage.setItem("nexplay_tenant_id", tenantId || "");
  localStorage.setItem("nexplay_user", JSON.stringify(user || {}));
};

const clearAuthContext = () => {
  localStorage.removeItem("nexplay_access_token");
  localStorage.removeItem("nexplay_tenant_id");
  localStorage.removeItem("nexplay_user");
};

function App() {
  const initialAuthContext = getStoredAuthContext();

  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(formatDateInput(new Date()));
  const [sportFilter, setSportFilter] = useState("all");
  const [capacityFilter, setCapacityFilter] = useState("all");
  const [availabilityGroups, setAvailabilityGroups] = useState([]);
  const [bookingDraft, setBookingDraft] = useState(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingResult, setBookingResult] = useState(null);
  const [view, setView] = useState("home");
  const [myBookings, setMyBookings] = useState([]);
  const [myBookingsLoading, setMyBookingsLoading] = useState(false);
  const [myBookingsError, setMyBookingsError] = useState("");
  const [authState, setAuthState] = useState(
    initialAuthContext.token ? "authenticated" : "connecting",
  );
  const [authUser, setAuthUser] = useState(initialAuthContext.user);
  const [authError, setAuthError] = useState("");

  const today = formatDateInput(new Date());
  const authReady = authState === "authenticated";
  const visibleFields = fields.filter((field) => {
    const sportMatch =
      sportFilter === "all" || field.sport_type === sportFilter;
    let capacityMatch = true;

    if (capacityFilter === "5") {
      capacityMatch = Number(field.capacity || 0) <= 5;
    } else if (capacityFilter === "7") {
      capacityMatch = Number(field.capacity || 0) <= 7;
    } else if (capacityFilter === "11") {
      capacityMatch = Number(field.capacity || 0) <= 11;
    }

    return sportMatch && capacityMatch;
  });

  const handleLineLogin = async () => {
    if (!LIFF_ID) {
      setAuthState("needs_config");
      setAuthError("VITE_LIFF_ID ยังไม่ได้ถูกตั้งค่าใน environment");
      return;
    }

    try {
      setAuthState("connecting");
      setAuthError("");

      await liff.init({ liffId: LIFF_ID });

      if (!liff.isInClient() && !liff.isLoggedIn()) {
        setAuthState("needs_login");
        setAuthError("กรุณาเปิดแอปผ่าน LINE OA / LIFF เพื่อยืนยันตัวตน");
        return;
      }

      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }

      const idToken = liff.getIDToken();
      if (!idToken) {
        setAuthState("error");
        setAuthError("ไม่สามารถรับ LINE ID token จาก LIFF ได้");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/line`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Unable to authenticate with LINE");
      }

      const token = payload?.token || "";
      const user = payload?.user || null;
      if (!token || !user) {
        throw new Error(
          "Backend did not return a NexPlay authentication token",
        );
      }

      persistAuthContext(token, user, user.tenantId || "");
      setAuthUser(user);
      setAuthState("authenticated");
      setAuthError("");
    } catch (err) {
      console.error("LINE authentication failed:", err);
      setAuthState("error");
      setAuthError(err.message || "ไม่สามารถยืนยันตัวตนผ่าน LINE ได้");
      clearAuthContext();
    }
  };

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
    const storedAuth = getStoredAuthContext();
    if (storedAuth.token) {
      return;
    }

    void handleLineLogin();
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDate || visibleFields.length === 0) {
        setAvailabilityGroups([]);
        return;
      }

      setBookingMessage("");
      setBookingResult(null);

      try {
        const results = await Promise.all(
          visibleFields.map(async (field) => {
            const response = await fetch(
              `${AVAILABILITY_URL}?fieldId=${field.id}&date=${selectedDate}`,
            );
            if (!response.ok) {
              throw new Error(`Availability request failed for ${field.id}`);
            }

            const data = await response.json();
            const slots = Array.isArray(data?.slots) ? data.slots : [];
            return { field, slots };
          }),
        );

        const grouped = [];
        const slotMap = new Map();

        results.forEach(({ field, slots }) => {
          slots.forEach((slot) => {
            const key = `${slot.start_time}__${slot.end_time}`;
            if (!slotMap.has(key)) {
              slotMap.set(key, {
                key,
                startTime: slot.start_time,
                endTime: slot.end_time,
                label: formatSlotLabel(slot),
                fields: [],
              });
            }

            slotMap.get(key).fields.push({
              id: field.id,
              name: field.name,
              capacity: field.capacity,
              sportType: field.sport_type || field.sportType || "กีฬา",
              slot,
            });
          });
        });

        slotMap.forEach((group) => {
          grouped.push(group);
        });

        grouped.sort((left, right) =>
          left.startTime.localeCompare(right.startTime),
        );
        setAvailabilityGroups(grouped);
      } catch (err) {
        console.error("Failed to load availability:", err);
        setAvailabilityGroups([]);
      }
    };

    fetchAvailability();
  }, [selectedDate, visibleFields]);

  const handleDateChange = (value) => {
    setSelectedDate(value);
    setBookingDraft(null);
    setBookingMessage("");
    setBookingResult(null);
  };

  const shiftDate = (amount) => {
    const nextDate = addDays(selectedDate, amount);
    setSelectedDate(nextDate);
    setBookingDraft(null);
    setBookingMessage("");
    setBookingResult(null);
  };

  const openBookingSheet = (field, slot) => {
    setBookingDraft({ field, slot });
    setBookingMessage(
      authReady ? "" : "ต้องยืนยันตัวตนผ่าน LINE ก่อนสร้างการจองจริงในระบบ",
    );
    setBookingResult(null);
  };

  const closeBookingSheet = () => {
    setBookingDraft(null);
    setBookingMessage("");
    setBookingResult(null);
  };

  const handleBookingConfirm = async () => {
    if (!bookingDraft?.field || !bookingDraft?.slot || bookingSubmitting) {
      return;
    }

    const { token } = getStoredAuthContext();
    const tenantId =
      bookingDraft.field?.tenant_id || bookingDraft.field?.tenantId || "";
    if (!token || !tenantId) {
      setBookingMessage(
        "ต้องยืนยันตัวตนผ่าน LINE ก่อนสร้าง booking จริงในระบบ",
      );
      return;
    }

    setBookingSubmitting(true);
    setBookingMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tenantId,
          fieldId: bookingDraft.field.id,
          bookingDate: selectedDate,
          startTime: formatSlotTime(bookingDraft.slot.start_time),
          endTime: formatSlotTime(bookingDraft.slot.end_time),
          totalAmount: 0,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(payload?.message || "ช่วงเวลานี้ถูกจองไปแล้ว");
        }
        if (response.status === 401) {
          throw new Error("เซสชันยืนยันตัวตนหมดอายุหรือไม่มีสิทธิ์ในการจอง");
        }
        if (response.status === 400) {
          throw new Error(payload?.message || "ข้อมูลการจองไม่ถูกต้อง");
        }
        if (response.status === 403) {
          throw new Error("บัญชีนี้ไม่มีสิทธิ์สร้างการจอง");
        }
        throw new Error(payload?.message || "Unable to create booking");
      }

      const bookingPayload = payload?.booking
        ? { booking: payload.booking, payment: payload.payment }
        : payload;
      setBookingResult(bookingPayload);
      setBookingMessage(
        "สร้างการจองสำเร็จ ระบบจะดำเนินการชำระเงินต่อในขั้นตอนถัดไป",
      );
    } catch (err) {
      console.error("Booking creation failed:", err);
      setBookingMessage(err.message || "ไม่สามารถสร้างการจองได้ในขณะนี้");
    } finally {
      setBookingSubmitting(false);
    }
  };

  const loadMyBookings = async () => {
    const { token } = getStoredAuthContext();
    if (!token) {
      setMyBookings([]);
      setMyBookingsError("ต้องมีการยืนยันตัวตนก่อนดูประวัติการจอง");
      return;
    }

    setMyBookingsLoading(true);
    setMyBookingsError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Unable to load bookings");
      }

      const bookings = Array.isArray(payload?.bookings)
        ? payload.bookings
        : Array.isArray(payload)
          ? payload
          : [];
      setMyBookings(bookings);
    } catch (err) {
      console.error("Failed to load my bookings:", err);
      setMyBookingsError(err.message || "ไม่สามารถโหลดประวัติการจองได้");
    } finally {
      setMyBookingsLoading(false);
    }
  };

  const handleOpenBookings = () => {
    setView("bookings");
    loadMyBookings();
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        padding: "16px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          paddingBottom: "88px",
        }}
      >
        <section
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            padding: "18px 18px 20px",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#2563eb",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                NexPlay
              </p>
              <h1
                style={{
                  margin: "6px 0 2px",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                Football Booking
              </h1>
              <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
                จองสนามแบบเร็วและชัดเจนจาก LINE
              </p>
            </div>
            <div
              style={{ fontSize: "13px", color: "#2563eb", fontWeight: 700 }}
            >
              TH / EN
            </div>
          </div>
        </section>

        <section
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            padding: "16px",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#6b7280",
                  textTransform: "uppercase",
                }}
              >
                สถานะบัญชี
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                {authState === "authenticated"
                  ? `เชื่อมต่อ LINE สำเร็จ · ${authUser?.name || "ลูกค้า"}`
                  : authState === "connecting"
                    ? "กำลังเชื่อมต่อ LINE"
                    : authState === "needs_login"
                      ? "กรุณาเข้าสู่ระบบ LINE"
                      : authState === "needs_config"
                        ? "กำหนด VITE_LIFF_ID ก่อนใช้งาน"
                        : "ไม่สามารถยืนยันตัวตนผ่าน LINE ได้"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLineLogin}
              style={{
                border: "none",
                borderRadius: "999px",
                padding: "10px 12px",
                backgroundColor: authReady ? "#ecfdf5" : "#2563eb",
                color: authReady ? "#047857" : "#ffffff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {authReady ? "เชื่อมต่อแล้ว" : "เข้าสู่ระบบ LINE"}
            </button>
          </div>
          {authError && (
            <div
              style={{
                marginTop: "10px",
                borderRadius: "12px",
                padding: "10px 12px",
                backgroundColor: "#fef2f2",
                color: "#b91c1c",
              }}
            >
              {authError}
            </div>
          )}
        </section>

        <div
          style={{
            display: "flex",
            gap: "8px",
            backgroundColor: "#ffffff",
            borderRadius: "999px",
            padding: "6px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <button
            type="button"
            onClick={() => setView("home")}
            style={{
              flex: 1,
              border: "none",
              borderRadius: "999px",
              padding: "10px 12px",
              backgroundColor: view === "home" ? "#2563eb" : "#f9fafb",
              color: view === "home" ? "#ffffff" : "#374151",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            หน้าหลัก
          </button>
          <button
            type="button"
            onClick={handleOpenBookings}
            style={{
              flex: 1,
              border: "none",
              borderRadius: "999px",
              padding: "10px 12px",
              backgroundColor: view === "bookings" ? "#2563eb" : "#f9fafb",
              color: view === "bookings" ? "#ffffff" : "#374151",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            การจองของฉัน
          </button>
        </div>

        {view === "home" && (
          <>
            <section
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "24px",
                padding: "16px",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
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
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#6b7280",
                      textTransform: "uppercase",
                    }}
                  >
                    เลือกวันที่
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    {selectedDate}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => shiftDate(-1)}
                    style={{
                      border: "1px solid #d1d5db",
                      backgroundColor: "#ffffff",
                      borderRadius: "999px",
                      padding: "8px 10px",
                      cursor: "pointer",
                    }}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => shiftDate(1)}
                    style={{
                      border: "1px solid #d1d5db",
                      backgroundColor: "#ffffff",
                      borderRadius: "999px",
                      padding: "8px 10px",
                      cursor: "pointer",
                    }}
                  >
                    →
                  </button>
                </div>
              </div>
              <input
                type="date"
                min={today}
                value={selectedDate}
                onChange={(event) => handleDateChange(event.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid #d1d5db",
                  borderRadius: "12px",
                  padding: "10px 12px",
                  fontSize: "14px",
                }}
              />
            </section>

            <section
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "24px",
                padding: "16px",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
              }}
            >
              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#374151",
                }}
              >
                ตัวกรองสนาม
              </p>
              <div style={{ display: "grid", gap: "10px" }}>
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    fontSize: "13px",
                    color: "#374151",
                  }}
                >
                  <span>ประเภทกีฬา</span>
                  <select
                    value={sportFilter}
                    onChange={(event) => setSportFilter(event.target.value)}
                    style={{
                      border: "1px solid #d1d5db",
                      borderRadius: "12px",
                      padding: "10px 12px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="all">ทั้งหมด</option>
                    {Array.from(
                      new Set(
                        fields
                          .map((field) => field.sport_type || field.sportType)
                          .filter(Boolean),
                      ),
                    ).map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                </label>
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    fontSize: "13px",
                    color: "#374151",
                  }}
                >
                  <span>ความจุ</span>
                  <select
                    value={capacityFilter}
                    onChange={(event) => setCapacityFilter(event.target.value)}
                    style={{
                      border: "1px solid #d1d5db",
                      borderRadius: "12px",
                      padding: "10px 12px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="5">5 คน</option>
                    <option value="7">7 คน</option>
                    <option value="11">11 คน</option>
                  </select>
                </label>
              </div>
            </section>

            {loading && (
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "24px",
                  padding: "24px",
                  textAlign: "center",
                  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.05)",
                }}
              >
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
                />
                <p style={{ margin: 0, color: "#4b5563" }}>
                  กำลังโหลดข้อมูลสนาม...
                </p>
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
                }}
              >
                {error}
              </div>
            )}

            {!loading && !error && availabilityGroups.length === 0 && (
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "24px",
                  padding: "24px",
                  textAlign: "center",
                  color: "#6b7280",
                  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.05)",
                }}
              >
                ไม่มีช่วงเวลาว่างในวันที่เลือกนี้
              </div>
            )}

            {!loading && !error && availabilityGroups.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {availabilityGroups.map((group) => (
                  <section
                    key={group.key}
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "24px",
                      padding: "16px",
                      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "16px",
                            fontWeight: 700,
                            color: "#111827",
                          }}
                        >
                          {group.label}
                        </p>
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: "13px",
                            color: "#6b7280",
                          }}
                        >
                          {group.fields.length} สนามว่าง
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {group.fields.map((field) => (
                        <div
                          key={field.id}
                          style={{
                            backgroundColor: "#f9fafb",
                            borderRadius: "16px",
                            padding: "12px",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <div>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "15px",
                                  fontWeight: 700,
                                  color: "#111827",
                                }}
                              >
                                {field.name}
                              </p>
                              <p
                                style={{
                                  margin: "4px 0 0",
                                  fontSize: "13px",
                                  color: "#6b7280",
                                }}
                              >
                                {field.sportType} · ความจุ{" "}
                                {field.capacity || "-"}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                openBookingSheet(field, field.slot)
                              }
                              style={{
                                border: "none",
                                borderRadius: "12px",
                                padding: "10px 12px",
                                backgroundColor: "#2563eb",
                                color: "#ffffff",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              จอง
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        )}

        {view === "bookings" && (
          <section
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              padding: "16px",
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
            }}
          >
            <p
              style={{
                margin: "0 0 10px",
                fontSize: "16px",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              ประวัติการจอง
            </p>
            <p
              style={{ margin: "0 0 12px", fontSize: "13px", color: "#6b7280" }}
            >
              ข้อมูลจะโหลดจากระบบ booking จริงเมื่อมีการยืนยันตัวตนจาก LINE /
              LIFF
            </p>
            {!authReady && (
              <div
                style={{
                  marginBottom: "12px",
                  borderRadius: "12px",
                  padding: "10px 12px",
                  backgroundColor: "#eff6ff",
                  color: "#1d4ed8",
                }}
              >
                กรุณาเข้าสู่ระบบ LINE ก่อนดูประวัติการจองจริง
              </div>
            )}
            {myBookingsLoading && (
              <p style={{ color: "#4b5563" }}>กำลังโหลดข้อมูล...</p>
            )}
            {myBookingsError && (
              <div style={{ color: "#b91c1c" }}>{myBookingsError}</div>
            )}
            {!myBookingsLoading &&
              !myBookingsError &&
              myBookings.length === 0 && (
                <div style={{ color: "#6b7280" }}>ยังไม่มีประวัติการจอง</div>
              )}
            {!myBookingsLoading &&
              !myBookingsError &&
              myBookings.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {myBookings.map((booking) => (
                    <div
                      key={booking.id}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "16px",
                        padding: "12px",
                      }}
                    >
                      <p
                        style={{ margin: 0, fontWeight: 700, color: "#111827" }}
                      >
                        {booking.booking_date || "-"}
                      </p>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: "14px",
                          color: "#4b5563",
                        }}
                      >
                        {booking.start_time || "-"} - {booking.end_time || "-"}
                      </p>
                      <p
                        style={{
                          margin: "6px 0 0",
                          fontSize: "13px",
                          color: "#6b7280",
                        }}
                      >
                        สถานะ: {booking.status || "-"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
          </section>
        )}
      </div>

      {bookingDraft && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(17,24,39,0.45)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: "16px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              width: "100%",
              maxWidth: "560px",
              borderRadius: "24px 24px 0 0",
              padding: "18px",
              boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
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
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#2563eb",
                    textTransform: "uppercase",
                  }}
                >
                  ยืนยันการจอง
                </p>
                <h2
                  style={{
                    margin: "4px 0 0",
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  {bookingDraft.field?.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeBookingSheet}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: "999px",
                  padding: "8px 10px",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: "14px",
                  padding: "10px 12px",
                }}
              >
                <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                  วันที่
                </p>
                <p
                  style={{
                    margin: "3px 0 0",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  {selectedDate}
                </p>
              </div>
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: "14px",
                  padding: "10px 12px",
                }}
              >
                <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                  ช่วงเวลา
                </p>
                <p
                  style={{
                    margin: "3px 0 0",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  {formatSlotLabel(bookingDraft.slot)}
                </p>
              </div>
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: "14px",
                  padding: "10px 12px",
                }}
              >
                <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                  ความจุ
                </p>
                <p
                  style={{
                    margin: "3px 0 0",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  {bookingDraft.field?.capacity || "-"}
                </p>
              </div>
              <div
                style={{
                  backgroundColor: "#eff6ff",
                  borderRadius: "14px",
                  padding: "10px 12px",
                }}
              >
                <p style={{ margin: 0, fontSize: "13px", color: "#2563eb" }}>
                  ราคา
                </p>
                <p
                  style={{
                    margin: "3px 0 0",
                    fontWeight: 700,
                    color: "#1d4ed8",
                  }}
                >
                  ราคาจะยืนยันในขั้นตอนถัดไป
                </p>
              </div>
            </div>

            {bookingMessage && (
              <div
                style={{
                  marginBottom: "10px",
                  borderRadius: "12px",
                  padding: "10px 12px",
                  backgroundColor: bookingMessage.includes("สำเร็จ")
                    ? "#ecfdf5"
                    : "#fef2f2",
                  color: bookingMessage.includes("สำเร็จ")
                    ? "#047857"
                    : "#b91c1c",
                }}
              >
                {bookingMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleBookingConfirm}
              disabled={bookingSubmitting}
              style={{
                width: "100%",
                border: "none",
                borderRadius: "12px",
                padding: "12px 14px",
                backgroundColor: bookingSubmitting ? "#93c5fd" : "#2563eb",
                color: "#ffffff",
                fontWeight: 700,
                cursor: bookingSubmitting ? "default" : "pointer",
              }}
            >
              {bookingSubmitting ? "กำลังสร้างคำขอจอง..." : "ยืนยันการจอง"}
            </button>

            {bookingResult && (
              <div
                style={{
                  marginTop: "10px",
                  borderRadius: "12px",
                  padding: "10px 12px",
                  backgroundColor: "#eff6ff",
                  color: "#1d4ed8",
                }}
              >
                <p style={{ margin: 0, fontWeight: 700 }}>Booking created</p>
                <p style={{ margin: "4px 0 0" }}>
                  รหัส: {bookingResult.booking?.id || "-"}
                </p>
                <p style={{ margin: "2px 0 0" }}>
                  วันที่: {bookingResult.booking?.booking_date || selectedDate}
                </p>
                <p style={{ margin: "2px 0 0" }}>
                  เวลา: {bookingResult.booking?.start_time || "-"} -{" "}
                  {bookingResult.booking?.end_time || "-"}
                </p>
                <p style={{ margin: "2px 0 0" }}>
                  สถานะ: {bookingResult.booking?.status || "-"}
                </p>
                <p style={{ margin: "2px 0 0" }}>
                  สถานะชำระเงิน: {bookingResult.payment?.status || "-"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
