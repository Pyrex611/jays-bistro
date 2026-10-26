/** Opening-hours helper (Africa/Lagos, no DST). Pure: pass `now` for tests. */

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TZ = "Africa/Lagos";

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const formatClock = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour} ${suffix}` : `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
};

function lagosParts(now) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "long", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  const hour = Number(get("hour")) % 24;
  return { dayIndex: DAYS.indexOf(get("weekday")), minutes: hour * 60 + Number(get("minute")) };
}

const slotForDay = (hours, dayName) => hours.find((h) => h.days.includes(dayName));

/**
 * @param {Array<{days:string[], opens:string, closes:string}>} hours
 * @returns {{open:boolean, label:string}}
 */
export function getOpenStatus(hours, now = new Date()) {
  const { dayIndex, minutes } = lagosParts(now);
  const today = slotForDay(hours, DAYS[dayIndex]);

  if (today && minutes >= toMinutes(today.opens) && minutes < toMinutes(today.closes)) {
    return { open: true, label: `Open · until ${formatClock(today.closes)}` };
  }
  if (today && minutes < toMinutes(today.opens)) {
    return { open: false, label: `Closed · opens today at ${formatClock(today.opens)}` };
  }
  for (let step = 1; step <= 7; step += 1) {
    const name = DAYS[(dayIndex + step) % 7];
    const slot = slotForDay(hours, name);
    if (slot) {
      const when = step === 1 ? "tomorrow" : name.slice(0, 3);
      return { open: false, label: `Closed · opens ${when} at ${formatClock(slot.opens)}` };
    }
  }
  return { open: false, label: "Closed" };
}
