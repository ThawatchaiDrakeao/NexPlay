const { getSupabaseAdminClient } = require('../../config/database');
const { HttpError } = require('../../utils/httpError');

const SLOT_MINUTES = 60;

const toMinutes = (time) => {
  const [hours, minutes] = String(time).slice(0, 5).split(':').map(Number);
  return hours * 60 + minutes;
};

const toTime = (minutes) => {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mins = String(minutes % 60).padStart(2, '0');
  return `${hours}:${mins}`;
};

const getDayOfWeek = (date) => new Date(`${date}T00:00:00Z`).getUTCDay();

const overlaps = (slotStart, slotEnd, blockedStart, blockedEnd) =>
  slotStart < blockedEnd && slotEnd > blockedStart;

const calculateAvailableSlots = async (fieldId, date) => {
  if (!fieldId || !date) throw new HttpError(400, 'Field id and date are required');

  const db = getSupabaseAdminClient();
  const { data: field, error: fieldError } = await db
    .from('fields')
    .select('id, tenant_id, branch_id')
    .eq('id', fieldId)
    .single();

  if (fieldError || !field) throw new HttpError(404, 'Field not found');

  const dayOfWeek = getDayOfWeek(date);
  const { data: hours } = await db
    .from('opening_hours')
    .select('open_time, close_time, is_closed, field_id')
    .eq('tenant_id', field.tenant_id)
    .eq('branch_id', field.branch_id)
    .eq('day_of_week', dayOfWeek);

  const openingHours = (hours || []).find((item) => item.field_id === fieldId)
    || (hours || []).find((item) => item.field_id === null);

  if (!openingHours || openingHours.is_closed) return [];

  const start = toMinutes(openingHours.open_time);
  const end = toMinutes(openingHours.close_time);
  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd = new Date(`${date}T23:59:59.999Z`);

  const { data: blockedTimes } = await db
    .from('blocked_times')
    .select('start_time, end_time')
    .eq('tenant_id', field.tenant_id)
    .eq('field_id', fieldId)
    .eq('status', 'active')
    .gte('end_time', dayStart.toISOString())
    .lte('start_time', dayEnd.toISOString());

  const blocked = (blockedTimes || []).map((item) => ({
    start: new Date(item.start_time),
    end: new Date(item.end_time)
  }));

  const slots = [];
  for (let cursor = start; cursor + SLOT_MINUTES <= end; cursor += SLOT_MINUTES) {
    const slotStartTime = toTime(cursor);
    const slotEndTime = toTime(cursor + SLOT_MINUTES);
    const slotStart = new Date(`${date}T${slotStartTime}:00.000Z`);
    const slotEnd = new Date(`${date}T${slotEndTime}:00.000Z`);
    const isBlocked = blocked.some((item) => overlaps(slotStart, slotEnd, item.start, item.end));

    if (!isBlocked) {
      slots.push({ start_time: slotStart.toISOString(), end_time: slotEnd.toISOString() });
    }
  }

  return slots;
};

module.exports = {
  calculateAvailableSlots
};
