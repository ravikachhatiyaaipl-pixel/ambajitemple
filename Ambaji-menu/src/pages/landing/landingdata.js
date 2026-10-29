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
  { icon: "landmark", value: "51", label: "Shakti Peethas — this is one" },
  { icon: "users", value: "1.4 Cr+", label: "Devotees welcomed yearly" },
  { icon: "clock", value: "24/7", label: "Online booking & donations" },
  { icon: "sparkles", value: "8", label: "Daily aarti & seva slots" },
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
// Card look per timing: gradient + decorative sky icon (sunrise -> night).
export const TIMING_THEMES = {
  mangala: "from-amber-400 via-orange-500 to-rose-700",
  abhishek: "from-amber-500 via-orange-500 to-red-700",
  rajbhog: "from-yellow-500 via-amber-600 to-orange-700",
  sandhya: "from-orange-600 via-rose-700 to-temple-800",
  shayan: "from-temple-700 via-temple-800 to-temple-950",
  close: "from-gray-600 to-gray-800",
};

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
  { title: "Shri Ambaji Mata Devasthan", img: "/ambaji-temple2.jpg", pos: "center 35%", big: true },
  { title: "Temple Complex", img: "/suvarna-shikar-hero.jpg", pos: "center" },
  { title: "Golden Shikhara", img: "/images11.jpg", pos: "72% 18%" },
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
  { title: "Explore", links: [["About the Temple", "about"], ["Darshan Timings", "timings"], ["Services", "services"], ["Events", "events"], ["Guidelines", "guidelines"], ["Gallery", "gallery"]] },
  { title: "Services", links: [["Darshan Booking", "services"], ["VIP Darshan", "services"], ["Seva & Pooja", "services"], ["Donations", "donate"]] },
  { title: "Support", links: [["FAQ", "faq"]] },
];

// Leave phone / email empty until confirmed - they are hidden in the footer when empty.
export const CONTACT = {
  address: "Ambaji, Banaskantha, Gujarat 385110",
  phone: "",
  email: "",
};

/* ---------- Highlight bands (alternating image + text) ----------
 * tone: "marigold" (yellow band) | "cream". Add `img` of prasad / other offerings here later. */
export const HIGHLIGHTS = [
  {
    id: "aarti",
    tone: "marigold",
    tag: "Maa Amba's Darshan",
    title: "Begin your visit with the morning and evening aarti",
    text: "Stand in the sanctum as the lamps are lit. Reserve your slot online and spend your time in prayer, not in the queue.",
    cta: "Book Darshan",
    img: "/images10.jpg",
    pos: "center 40%",
    portrait: true,
  },
  {
    id: "shikhar",
    tone: "cream",
    tag: "Pure gold plated",
    title: "Suvarna Shikhar of Ambaji Temple",
    text: "The golden shikhara covered in pure gold stands as a symbol of faith, drawing devotees from across the world to Maa Amba's blessings.",
    cta: "Donate Now",
    img: "/Golden Shikhara.png",
    pos: "70% 20%",
    anchor: "donate",
  },
];

/* ---------- Announcement (VERIFY wording before go-live) ---------- */
export const ANNOUNCEMENT = {
  tag: "Events & Celebrations",
  title: "Light & Sound Show at Gabbar Hill",
  text: "Experience the divine celebration of Navratri at Ambaji Temple, filled with devotion, traditional Garba, cultural performances, and spiritual festivities. Join devotees in seeking the blessings of Maa Ambe and celebrating this auspicious festival with faith, joy, and enthusiasm.",
  img: "/ambaji1.jpg",
  pos: "center",
};

/* ---------- Events (VERIFY dates; kept general on purpose) ---------- */
export const EVENTS = [
  { title: "Bhadarvi Poonam Fair", period: "Bhadarvo full moon", text: "Lakhs of padyatris walk to Ambaji for the largest fair of the year.", img: "/ambaji_bhadarvi_poonam.jpg", pos: "center 30%" },
  { title: "Navratri Mahotsav", period: "Ashwin Navratri", text: "Nine nights of garba, aarti and special shringar at the temple.", img: "/ambaji1.jpg", pos: "center" },
  { title: "Chaitra Navratri", period: "Chaitra Shukla Paksha", text: "Special pooja and havan during the spring Navratri.", img: "/chaitra navaratri.jpg", pos: "72% 18%" },
  { title: "Poonam Darshan", period: "Every full moon", text: "A large number of devotees visit on each Poonam for darshan.", img: "/Ambaji_poonam.jpeg", pos: "center 35%" },
];

/* ---------- Guidelines (VERIFY with temple trust) ---------- */
export const GUIDELINES = {
  dos: [
    "Carry a valid photo ID and your booking QR code",
    "Dress modestly and follow the queue",
    "Keep your valuables with you or in the cloakroom",
    "Use only the official portal for bookings and donations",
  ],
  donts: [
    "Do not carry large bags into the queue area",
    "Do not litter in the temple premises",
    "Do not pay anyone outside for \"fast\" darshan",
    "Do not use flash or loud devices near the sanctum",
  ],
};

/* ---------- Devotee portal (post-login dashboard) ----------
 * Everything the devotee dashboard shows that is not user data lives here.
 * VERIFY: contact numbers / email / trust name below are taken from the approved design - confirm before go-live.
 * `to` = route inside the portal. Items without `to` are shown as plain text. */
export const DEVOTEE_PORTAL = {
  badge: "Shaktipeeth",
  subtitleGu: "\u0aaf\u0abe\u0aa4\u0acd\u0ab0\u0abe\u0ab3\u0ac1 \u0ab8\u0ac7\u0ab5\u0abe \u0aaa\u0acb\u0ab0\u0acd\u0a9f\u0ab2",
  subtitleEn: "Devotee Portal",
  location: "Ambaji, Banaskantha, Gujarat",
  liveDarshan: "Live Darshan Online",
  crowdFlow: "Normal (Minor Queue)",
  trustName: "Shree Arasuri Ambaji Mata Devasthan Trust",
  managementLine: "Shree Arasuri Ambaji Mata Devasthan Trust (SKDT) Management",
};

export const DEVOTEE_SERVICES = [
  { id: "pooja", icon: "pooja", tone: "orange", title: "Pooja Services", tag: { text: "Sacred", tone: "amber" },
    text: "Book daily rituals, Abhishek, Archana & Special Sevas.", foot: "Instant confirmation", cta: "Book Pooja", to: "/seva-portal" },
  { id: "donation", icon: "donate", tone: "red", title: "Donation", tag: { text: "80G Benefit", tone: "green" },
    text: "General temple fund, Gaushala & Annadan with 80G exemption.", foot: "Tax exemption receipt", cta: "Donate Now", to: "/devotee-donation-entry" },
  { id: "gold", icon: "gold", tone: "amber", title: "Gold Donation", tag: { text: "SKDT Verified", tone: "amber" },
    text: "Offer pure bullion with SKDT digital treasury verification.", foot: "SKDT Treasury", cta: "Offer Gold", to: "/devotee-donation-entry" },
  { id: "article", icon: "article", tone: "purple", title: "Article Donation", tag: { text: "\u0ab5\u0ab8\u0acd\u0aa4\u0ac1 \u0aa6\u0abe\u0aa8", tone: "purple" },
    text: "Offer vastra, grains, brassware & temple materials.", foot: "In-kind offerings", cta: "Donate Articles", to: "/devotee-article-donation-entry" },
  { id: "bhojan", icon: "food", tone: "amber", title: "Annakshetra & Bhojan Booking", tag: { text: "\u0a85\u0aa8\u0acd\u0aa8\u0a95\u0acd\u0ab7\u0ac7\u0aa4\u0acd\u0ab0", tone: "amber" },
    text: "Reserve dining slots & Bhojanalaya coupons.", foot: "Free & Seva coupons", cta: "Book Bhojan", to: "/seva-portal" },
  { id: "receipts", icon: "receipt", tone: "blue", title: "My Donations", tag: { text: "80G Tax", tone: "blue" },
    text: "View donation history & download official tax receipts.", foot: "Download PDFs", cta: "View Receipts", to: "/devotee-donations", soft: true },
];

export const DEVOTEE_FOOTER = {
  about: "One of the 51 celebrated Shaktipeeths of Bharat. Worship the sacred Vishwa Yantra in the holy Arasur hills.",
  columns: [
    { title: "Quick Access", links: [
      { label: "Online Prasad Delivery" }, { label: "Live Darshan 24\u00d77" },
      { label: "Bhojanalaya Timings" }, { label: "Gabbar Hill Ropeway" },
    ] },
    { title: "Devotee Support", links: [
      { label: "Wheelchair & Senior Citizens" }, { label: "Lost & Found Center" },
      { label: "Donation Tax Exemption (80G)" }, { label: "Security & Cloakroom Facilities" },
    ] },
  ],
  emergency: { title: "Emergency Contacts", helpdesk: "Devasthan Trust Helpdesk:", phones: "+91 02749 262136 / 262623", email: "info@ambajitemple.in" },
  legal: ["Designed & Developed by Aark InfoSoft Pvt. Ltd."],
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
