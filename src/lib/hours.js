/** Opening-hours helper (Africa/Lagos, no DST). Pure: pass `now` for tests. */

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TZ = "Africa/Lagos";

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const formatClock = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour} ${suffix}` : `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
};

/** Accepts the settings shape ({day, open, close, closed}) or the legacy shape ({days:[…], opens, closes}). */
export function toSlots(hours) {
  return (hours ?? []).flatMap((h) =>
    h.days
      ? [{ days: h.days, opens: h.opens, closes: h.closes }]
      : h.closed ? [] : [{ days: [h.day], opens: h.open, closes: h.close }],
  );
}

function lagosParts(now) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "long", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  const hour = Number(get("hour")) % 24;
  return { dayIndex: DAY_NAMES.indexOf(get("weekday")), minutes: hour * 60 + Number(get("minute")) };
}

const lagosDate = (when) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(when);
const slotForDay = (slots, dayName) => slots.find((h) => h.days.includes(dayName));

/**
 * @returns {{open:boolean, label:string}}
 */
export function getOpenStatus(hours, now = new Date(), closures = []) {
  const slots = toSlots(hours);
  const { dayIndex, minutes } = lagosParts(now);
  const closureOn = (when) => closures.find((c) => c.date === lagosDate(when));

  const todayClosure = closureOn(now);
  const today = todayClosure ? null : slotForDay(slots, DAY_NAMES[dayIndex]);

  if (todayClosure) {
    // fall through to "next opening" below, but say why we're closed today
  } else if (today && minutes >= toMinutes(today.opens) && minutes < toMinutes(today.closes)) {
    return { open: true, label: `Open · until ${formatClock(today.closes)}` };
  } else if (today && minutes < toMinutes(today.opens)) {
    return { open: false, label: `Closed · opens today at ${formatClock(today.opens)}` };
  }

  for (let step = 1; step <= 14; step += 1) {
    const when = new Date(now.getTime() + step * 86_400_000);
    if (closureOn(when)) continue;
    const name = DAY_NAMES[(dayIndex + step) % 7];
    const slot = slotForDay(slots, name);
    if (slot) {
      const label = step === 1 ? "tomorrow" : name.slice(0, 3);
      return { open: false, label: `${todayClosure ? "Closed today" : "Closed"} · opens ${label} at ${formatClock(slot.opens)}` };
    }
  }
  return { open: false, label: "Closed" };
}
