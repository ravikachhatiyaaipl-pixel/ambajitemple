/**
 *  Ambaji Mata Temple - landing page content.
 *  All text/numbers shown on the public landing page live here so they can be edited in one place.
 *  NOTE: items marked "VERIFY" are sample values - replace them with confirmed temple figures before go-live.
 */

// Where the main call-to-action buttons go (devotee / staff portal).
export const PORTAL_PATH = "/login";
export const REGISTER_PATH = "/registration";

export const TEMPLE_NAME = "Shree Ambaji Mata Temple";

export const NAV_LINKS = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Darshan Timings", id: "timings" },
  { label: "Services", id: "services" },
  { label: "Donate", id: "donate" },
  { label: "FAQ", id: "faq" },
];

// VERIFY: sample figures
export const STATS = [
  { value: "51", label: "Shakti Peethas — this is one" },
  { value: "1.4 Cr+", label: "Devotees welcomed yearly" },
  { value: "24/7", label: "Online booking & donations" },
  { value: "8", label: "Daily aarti & seva slots" },
];

// VERIFY: sample timings (24h format). Times drive the live "Next Aarti" card too.
export const TIMINGS = [
  { id: "mangala", title: "Mangala Aarti", note: "Temple opens for the day", time: "06:00", icon: "sunrise", aarti: true },
  { id: "abhishek", title: "Abhishek & Shringar", note: "Sacred bathing & adornment", time: "07:30", icon: "sun", aarti: true },
  { id: "rajbhog", title: "Rajbhog Aarti", note: "Midday offering", time: "12:00", icon: "food", aarti: true },
  { id: "sandhya", title: "Sandhya Aarti", note: "Evening prayer, most attended", time: "19:00", icon: "flame", aarti: true },
  { id: "shayan", title: "Shayan Aarti", note: "Closing ceremony", time: "21:00", icon: "moon", aarti: true },
  { id: "close", title: "Temple Closes", note: "Reopens 6:00 AM next day", time: "21:30", icon: "lock", aarti: false },
];
export const OPEN_TIME = "06:00";
export const CLOSE_TIME = "21:30";

export const ABOUT_POINTS = [
  { icon: "landmark", title: "Ancient Shakti Peeth", text: "Believed to be where the heart of Goddess Sati fell, making it one of the holiest of the 51 Shakti Peethas." },
  { icon: "mountain", title: "Aravalli Foothills", text: "Nestled in Banaskantha district, Gujarat, on the border with Rajasthan — a serene pilgrimage destination." },
  { icon: "gem", title: "No Idol, Only a Yantra", text: "Uniquely, the sanctum holds a sacred Shree Yantra rather than a conventional idol of the Goddess." },
];

export const ABOUT_FACTS = [
  { label: "Established", value: "Ancient · Puranic era" },
  { label: "Deity", value: "Maa Amba (Shakti)" },
  { label: "Darshan hours", value: "6:00 AM - 9:30 PM" },
  { label: "Nearest station", value: "Abu Road, ~20 km" },
];

export const SERVICES = [
  { icon: "ticket", title: "Darshan Booking", text: "Reserve your darshan slot in advance and skip the long queues.", badge: "Popular" },
  { icon: "crown", title: "VIP Darshan", text: "Priority access with a simple approval-based booking flow." },
  { icon: "pooja", title: "Seva & Pooja", text: "Book Abhishek, Rudrabhishek and other sevas performed on your behalf." },
  { icon: "donate", title: "Donations & Chadhava", text: "Contribute securely online with an instant digital receipt.", badge: "Secure" },
  { icon: "food", title: "Pangat / Prasad", text: "Reserve a seat for the community prasad seating." },
  { icon: "bed", title: "Accommodation", text: "Book a room at the temple guest house for your stay." },
];

export const DONATE_POINTS = [
  { icon: "shield", text: "Secure online payments" },
  { icon: "receipt", text: "Digital receipt for every donation" },
  { icon: "heart", text: "Transparent temple accounts" },
];

// VERIFY: sample testimonials - replace with real devotee feedback (with permission).
export const TESTIMONIALS = [
  { quote: "Booking VIP darshan online saved us hours of standing in queue with my elderly parents. The whole process felt organised and respectful.", name: "Rekha Ben Patel", place: "Ahmedabad, Gujarat" },
  { quote: "We travelled from Chennai for the first time and the aarti timings on the site matched exactly. Made planning our trip so much easier.", name: "Suresh Kumar Iyer", place: "Chennai, Tamil Nadu" },
  { quote: "Being abroad, I never thought I could offer seva for my family back home. The online booking made it possible, and the receipt arrived instantly.", name: "Priyanka Shah", place: "London, UK" },
];

export const GALLERY = [
  { title: "Shri Ambaji Mata Devasthan", img: "/splash.png", pos: "center 35%", big: true },
  { title: "Temple Complex", img: "/Ambaji-Temple.jpg", pos: "center" },
  { title: "Golden Shikhara", img: "/Golden Shikhara.png", pos: "72% 18%" },
  { title: "Marble Courtyard", img: "/Golden Shikhara.png", pos: "center 96%" },
  { title: "Temple Entrance", img: "/Ambaji-Temple.jpg", pos: "42% 72%" },
];

export const FAQS = [
  { q: "How do I book a darshan slot online?", a: "Sign in to the portal, choose “Darshan Booking”, pick your preferred date and time slot, and confirm the number of people in your group. You will receive a QR ticket by email." },
  { q: "Is VIP darshan booking guaranteed once I apply?", a: "VIP darshan is approval-based. Once your request is reviewed you will be notified, and the confirmed slot appears in your account." },
  { q: "Are online donations secure?", a: "Yes. Payments are processed through secure payment channels and every donation generates a digital receipt for your records." },
  { q: "Can I book accommodation at the temple guest house in advance?", a: "Yes. Guest house rooms can be requested in advance from the portal, subject to availability for your dates." },
  { q: "What should I do if my payment succeeded but booking is not confirmed?", a: "Please wait a few minutes and refresh your bookings. If it is still not confirmed, contact the temple helpdesk with your payment reference and we will resolve it." },
];

export const FOOTER_COLUMNS = [
  { title: "Explore", links: [["About the Temple", "about"], ["Darshan Timings", "timings"], ["Services", "services"], ["Gallery", "gallery"]] },
  { title: "Services", links: [["Darshan Booking", "services"], ["VIP Darshan", "services"], ["Seva & Pooja", "services"], ["Donations", "donate"]] },
  { title: "Support", links: [["FAQ", "faq"]] },
];

// Leave phone / email empty until confirmed - they are hidden in the footer when empty.
export const CONTACT = {
  address: "Ambaji, Banaskantha, Gujarat 385110",
  phone: "",
  email: "",
};

/* ---------- time helpers (temple time = IST) ---------- */
export const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const format12 = (t) => {
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
};

export const isTempleOpen = (nowMin) =>
  nowMin >= toMinutes(OPEN_TIME) && nowMin < toMinutes(CLOSE_TIME);

/** Next aarti after `nowMin` (minutes since midnight, IST). Wraps to tomorrow's first aarti. */
export const getNextAarti = (nowMin) => {
  const list = TIMINGS.filter((t) => t.aarti);
  const upcoming = list.find((t) => toMinutes(t.time) > nowMin);
  if (upcoming) {
    return { item: upcoming, minsAway: toMinutes(upcoming.time) - nowMin, tomorrow: false };
  }
  const first = list[0];
  return { item: first, minsAway: 1440 - nowMin + toMinutes(first.time), tomorrow: true };
};

export const formatAway = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `in ${m}m`;
  return `in ${h}h ${String(m).padStart(2, "0")}m`;
};
