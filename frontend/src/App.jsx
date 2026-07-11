import { useEffect, useState, useRef } from "react";
import "./App.css";

// ใช้ LIFF ID ที่เราเพิ่งสร้างสำเร็จครับ
const LIFF_ID = "2010674830-XvD2Fo0d";
const API_BASE_URL = "https://nexplay-backend-eoa4.onrender.com";

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  if (timeStr.includes("T")) {
    return timeStr.split("T")[1].substring(0, 5);
  }
  return timeStr.substring(0, 5);
};

const buildDateOptions = () => {
  const dates = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let index = 0; index < 14; index += 1) {
    const nextDate = new Date(start);
    nextDate.setDate(start.getDate() + index);
    dates.push(nextDate);
  }
  return dates;
};

const formatDateInput = (dateValue) => {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function App() {
  const [fields, setFields] = useState([]);
  const [fieldId, setFieldId] = useState("");
  const [date, setDate] = useState(formatDateInput(new Date()));
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [error, setError] = useState("");
  const [bookingResult, setBookingResult] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [customer, setCustomer] = useState({
    name: "LINE Guest User",
    phone: "0800000000",
    lineUserId: "U_mock_line_123",
  });
  const fileInputRef = useRef(null);

  const dateOptions = buildDateOptions();

  // ดึงข้อมูลผู้ใช้จาก LINE ทันทีที่โหลดแอป
  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await window.liff.init({ liffId: LIFF_ID });
        if (window.liff.isLoggedIn()) {
          const profile = await window.liff.getProfile();
          setCustomer({
            name: profile.displayName,
            phone: "0800000000",
            lineUserId: profile.userId,
          });
        } else {
          window.liff.login();
        }
      } catch (err) {
        console.error("LIFF init error:", err);
      }
    };
    initializeLiff();
  }, []);

  // โหลดสนาม
  useEffect(() => {
    const loadFields = async () => {
      const url = `${API_BASE_URL}/api/public/fields`;
      console.log("Fetching fields from:", url);
      try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Fields response:", data);
        setFields(data.fields || []);
        if (data.fields?.length > 0) setFieldId(data.fields[0].id);
      } catch (err) {
        console.error("Failed to load fields:", err);
        setError("ไม่สามารถโหลดข้อมูลสนามได้");
      } finally {
        setLoading(false);
      }
    };
    loadFields();
  }, []);

  // ดึงคิวว่าง
  useEffect(() => {
    const fetchAvailability = async () => {
      if (fieldId && date) {
        const url = `${API_BASE_URL}/api/public/availability?fieldId=${fieldId}&date=${date}`;
        console.log("Fetching availability from:", url);
        const response = await fetch(url);
        const data = await response.json();
        console.log("Availability response:", data);
        setAvailableSlots(data.slots || []);
      }
    };
    fetchAvailability();
  }, [fieldId, date]);

  const handleBooking = async (slotStartTime) => {
    setIsBooking(true);
    const slotDetails = availableSlots.find(
      (s) => s.start_time === slotStartTime,
    );
    const payload = {
      fieldId,
      date,
      startTime: formatTime(slotDetails.start_time),
      endTime: formatTime(slotDetails.end_time),
      customer,
    };

    const url = `${API_BASE_URL}/api/public/bookings`;
    console.log("Creating booking at:", url, payload);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("Booking response:", result);
    if (response.ok) {
      setBookingResult(result.booking?.booking || result.booking);
    }
    setIsBooking(false);
  };

  const handleFileSelection = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsSubmittingPayment(true);
    setIsPaymentLoading(true);

    // จำลองการอัปโหลด
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const url = `${API_BASE_URL}/api/public/payments/confirm`;
    console.log("Confirming payment at:", url, { bookingId: bookingResult?.id });
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: bookingResult?.id }),
    });

    setPaymentCompleted(true);
    setIsPaymentLoading(false);
    setIsSubmittingPayment(false);
  };

  return (
    <main className="app-shell">
      {/* ส่วน UI แสดงผลตาม Logic เดิมที่คุณออกแบบไว้ได้เลยครับ */}
      {/* เพิ่มส่วนแสดงชื่อลูกค้าที่ดึงจากไลน์ */}
      <div className="user-profile">
        ยินดีต้อนรับคุณ: <strong>{customer.name}</strong>
      </div>

      {/* ... โค้ดส่วนแสดงผล UI ที่คุณมีอยู่เดิม ... */}
    </main>
  );
}

export default App;
