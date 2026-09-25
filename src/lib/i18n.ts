export type Language = "en" | "ur";

export const LANGUAGE_STORAGE_KEY = "sehat-directory-language";
export const ALL_PROVINCES = "All provinces";
export const ALL_CITIES = "All cities";

const en = {
  unofficialBar: "Independent, unofficial public directory",
  howListingsWork: "How listings work",
  findFacility: "Find a facility",
  about: "About",
  reportCorrection: "Report a correction",
  toggleNav: "Toggle navigation",
  switchToUrdu: "Switch to Urdu",
  switchToEnglish: "Switch to English",
  languageTarget: "اردو",
  eyebrow: "Unofficial government facility directory",
  heroTitle: "Find a government facility",
  heroEmphasis: "near you.",
  heroLead:
    "Search government hospitals and clinics by name, city, or province. We publish only official addresses and switchboards. We do not list doctors.",
  facilityOrArea: "Facility or area",
  searchPlaceholder: "e.g. Lady Reading or Peshawar",
  province: "Province",
  allProvinces: "All provinces",
  findFacilities: "Find facilities",
  noteOfficialAddresses: "Official source addresses only",
  noteNoDoctors: "No doctor names or private numbers",
  noteCallFirst: "Call the facility before travelling",
  beforeYouVisit: "Before you visit",
  purposeTitle: "What this directory lists",
  purposeBody:
    "Government facility name, type, verified address, and official switchboard when the same government source prints them. It does not list doctors, confirm who is on duty, or replace Ministry of Religious Affairs instructions.",
  purposeFacility: "Facility",
  purposeFacilityDetail: "name and type",
  purposeAddress: "Address",
  purposeAddressDetail: "from an official source",
  purposePhone: "Phone",
  purposePhoneDetail: "only if that source prints it",
  governmentFacilities: "Government facilities",
  directoryTitle: "Search hospitals and clinics",
  directoryLead:
    "Only government facilities with a sourced, verified address are listed. Coverage is incomplete: Punjab is strongest, then Sindh, Balochistan, Islamabad, Gilgit-Baltistan, AJK, and a small set of KP hospitals.",
  connectedDirectory: "Connected directory",
  sampleRecords: "Sample records",
  sampleNotice: "Demonstration data: these facilities are placeholders, not verified public listings.",
  searchFacilityOrCity: "Search facility or city",
  allCities: "All cities",
  verifiedOnly: "Verified facilities only",
  verifiedCountOne: "1 verified facility",
  verifiedCountMany: "{count} verified facilities",
  clearFilters: "Clear filters",
  governmentFacility: "Government facility",
  addressVerified: "Address verified",
  addressLabel: "Address",
  switchboardLabel: "Official switchboard",
  notAvailable: "Not available",
  checked: "Checked {date}",
  viewDetails: "View details",
  facilityVerified: "Facility verified",
  emptyTitle: "No matching verified facilities",
  emptyBody: "Try another province, city, or facility name.",
  resetFilters: "Reset filters",
  publicationStandard: "Publication standard",
  listingMeansTitle: "What a listing means",
  listingMeansBody:
    "A published row means this government facility exists in an official source and that source printed a usable address. It does not mean a doctor is available, or that Hajj paperwork will be signed there today.",
  officialSource: "Official source",
  officialSourceBody:
    "The name comes from a government health department, hospital, or official directory.",
  verifiedAddress: "Verified address",
  verifiedAddressBody:
    "We publish an address only when that same official source prints a street or locality we can use.",
  noDoctorList: "No doctor list",
  noDoctorListBody:
    "This directory does not publish doctors, PMDC numbers, or who is on duty.",
  independentProject: "Independent project",
  notGovWebsite: "Not a government website",
  independenceBody:
    "Sehat Directory is not affiliated with or endorsed by the Ministry of Religious Affairs, PMDC, or any provincial government.",
  publicSource: "Public-source attribution",
  correctionRequests: "Correction and removal requests",
  noPrivatePhones: "No private phone numbers",
  reportIncorrect: "Report incorrect information",
  footerAbout:
    "An independent, unofficial directory of government hospitals and clinics in Pakistan.",
  directory: "Directory",
  important: "Important",
  footerImportant:
    "Call the facility before travelling. For Hajj medical forms, use the latest official Ministry form and ask at the hospital desk. This site does not confirm attestation.",
  emergency: "Emergency",
  footerEmergency:
    "This directory is not an emergency service. Call 1122 or visit the nearest emergency department.",
  copyright: "© 2026 Sehat Directory Pakistan",
  copyrightMeta: "Unofficial directory · Privacy · Corrections",
  close: "Close",
  lastChecked: "Last checked",
  callBeforeTravel:
    "Call before travelling. This listing is an address and switchboard, not a confirmation of staff or Hajj attestation.",
  callFacility: "Call facility",
  viewSource: "View source",
  facilityDetails: "{name} facility details",
  notRecorded: "Not recorded",
};

const ur: typeof en = {
  unofficialBar: "آزاد، غیر سرکاری عوامی فہرست",
  howListingsWork: "فہرست کیسے بنتی ہے",
  findFacility: "ہسپتال تلاش کریں",
  about: "تعارف",
  reportCorrection: "تصحیح کی اطلاع دیں",
  toggleNav: "مینو کھولیں",
  switchToUrdu: "اردو میں تبدیل کریں",
  switchToEnglish: "انگریزی میں تبدیل کریں",
  languageTarget: "English",
  eyebrow: "سرکاری ہسپتالوں کی غیر سرکاری فہرست",
  heroTitle: "سرکاری ہسپتال تلاش کریں",
  heroEmphasis: "اپنے قریب۔",
  heroLead:
    "نام، شہر یا صوبے سے سرکاری ہسپتال اور کلینک تلاش کریں۔ ہم صرف سرکاری پتے اور فون نمبر دکھاتے ہیں۔ ہم ڈاکٹروں کی فہرست نہیں دیتے۔",
  facilityOrArea: "ہسپتال یا علاقہ",
  searchPlaceholder: "مثلاً لیڈی ریڈنگ یا پشاور",
  province: "صوبہ",
  allProvinces: "تمام صوبے",
  findFacilities: "تلاش کریں",
  noteOfficialAddresses: "صرف سرکاری ذرائع کے پتے",
  noteNoDoctors: "نہ ڈاکٹر کے نام، نہ ذاتی نمبر",
  noteCallFirst: "جانے سے پہلے ہسپتال کو فون کریں",
  beforeYouVisit: "جانے سے پہلے",
  purposeTitle: "اس فہرست میں کیا ہے",
  purposeBody:
    "سرکاری ہسپتال کا نام، قسم، تصدیق شدہ پتہ، اور سرکاری فون نمبر جب وہی سرکاری ذریعہ انہیں چھاپے۔ یہ ڈاکٹروں کی فہرست نہیں، ڈیوٹی کی تصدیق نہیں، اور وزارتِ مذہبی امور کی ہدایات کی جگہ نہیں لیتی۔",
  purposeFacility: "ہسپتال",
  purposeFacilityDetail: "نام اور قسم",
  purposeAddress: "پتہ",
  purposeAddressDetail: "سرکاری ذریعے سے",
  purposePhone: "فون",
  purposePhoneDetail: "صرف اگر وہی ذریعہ چھاپے",
  governmentFacilities: "سرکاری سہولیات",
  directoryTitle: "ہسپتال اور کلینک تلاش کریں",
  directoryLead:
    "صرف وہ سرکاری سہولیات درج ہیں جن کا تصدیق شدہ پتہ کسی ذریعے سے ملا۔ کوریج نامکمل ہے: پنجاب سب سے زیادہ، پھر سندھ، بلوچستان، اسلام آباد، گلگت بلتستان، آزاد کشمیر، اور خیبر پختونخوا کے چند ہسپتال۔",
  connectedDirectory: "منسلک ڈائریکٹری",
  sampleRecords: "نمونہ ریکارڈ",
  sampleNotice:
    "نمونہ ڈیٹا: یہ سہولیات پلیس ہولڈر ہیں، تصدیق شدہ عوامی فہرست نہیں۔",
  searchFacilityOrCity: "ہسپتال یا شہر تلاش کریں",
  allCities: "تمام شہر",
  verifiedOnly: "صرف تصدیق شدہ سہولیات",
  verifiedCountOne: "۱ تصدیق شدہ سہولت",
  verifiedCountMany: "{count} تصدیق شدہ سہولیات",
  clearFilters: "فلٹر صاف کریں",
  governmentFacility: "سرکاری سہولت",
  addressVerified: "پتہ تصدیق شدہ",
  addressLabel: "پتہ",
  switchboardLabel: "سرکاری فون",
  notAvailable: "دستیاب نہیں",
  checked: "جانچ {date}",
  viewDetails: "تفصیل دیکھیں",
  facilityVerified: "سہولت تصدیق شدہ",
  emptyTitle: "کوئی تصدیق شدہ سہولت نہیں ملی",
  emptyBody: "دوسرا صوبہ، شہر یا ہسپتال کا نام آزمائیں۔",
  resetFilters: "فلٹر ری سیٹ کریں",
  publicationStandard: "اشاعت کا معیار",
  listingMeansTitle: "فہرست میں اندراج کا مطلب",
  listingMeansBody:
    "اشاعت شدہ اندراج کا مطلب یہ ہے کہ یہ سرکاری سہولت کسی سرکاری ذریعے میں موجود ہے اور اس ذریعے نے استعمال کے قابل پتہ چھاپا ہے۔ اس کا مطلب یہ نہیں کہ ڈاکٹر دستیاب ہے، یا آج وہاں حج کے کاغذات دستخط ہوں گے۔",
  officialSource: "سرکاری ذریعہ",
  officialSourceBody:
    "نام کسی حکومتی محکمہ صحت، ہسپتال، یا سرکاری فہرست سے آیا ہے۔",
  verifiedAddress: "تصدیق شدہ پتہ",
  verifiedAddressBody:
    "ہم پتہ صرف تب دکھاتے ہیں جب وہی سرکاری ذریعہ سڑک یا علاقہ چھاپے۔",
  noDoctorList: "ڈاکٹروں کی فہرست نہیں",
  noDoctorListBody:
    "یہ ڈائریکٹری ڈاکٹر، پی ایم ڈی سی نمبر، یا ڈیوٹی پر موجود عملہ نہیں چھاپتی۔",
  independentProject: "آزاد منصوبہ",
  notGovWebsite: "سرکاری ویب سائٹ نہیں",
  independenceBody:
    "صحت ڈائریکٹری وزارتِ مذہبی امور، پی ایم ڈی سی، یا کسی صوبائی حکومت سے منسلک یا تصدیق شدہ نہیں۔",
  publicSource: "عوامی ذریعے کا حوالہ",
  correctionRequests: "تصحیح اور حذف کی درخواستیں",
  noPrivatePhones: "ذاتی فون نمبر نہیں",
  reportIncorrect: "غلط معلومات کی اطلاع دیں",
  footerAbout:
    "پاکستان کے سرکاری ہسپتالوں اور کلینکس کی ایک آزاد، غیر سرکاری فہرست۔",
  directory: "ڈائریکٹری",
  important: "اہم",
  footerImportant:
    "سفر سے پہلے ہسپتال کو فون کریں۔ حج کے میڈیکل فارم کے لیے وزارت کا تازہ ترین سرکاری فارم استعمال کریں اور ہسپتال کے ڈیسک سے پوچھیں۔ یہ سائٹ تصدیق کی ضمانت نہیں دیتی۔",
  emergency: "ایمرجنسی",
  footerEmergency:
    "یہ ڈائریکٹری ایمرجنسی سروس نہیں۔ ۱۱۲۲ پر کال کریں یا قریبی ایمرجنسی ڈیپارٹمنٹ جائیں۔",
  copyright: "© ۲۰۲۶ صحت ڈائریکٹری پاکستان",
  copyrightMeta: "غیر سرکاری ڈائریکٹری · رازداری · تصحیحات",
  close: "بند کریں",
  lastChecked: "آخری جانچ",
  callBeforeTravel:
    "سفر سے پہلے فون کریں۔ یہ اندراج صرف پتہ اور فون ہے، عملے یا حج کی تصدیق نہیں۔",
  callFacility: "ہسپتال کو فون کریں",
  viewSource: "ذریعہ دیکھیں",
  facilityDetails: "{name} کی تفصیل",
  notRecorded: "درج نہیں",
};

export const copy: Record<Language, typeof en> = { en, ur };

const PROVINCE_URDU: Record<string, string> = {
  Punjab: "پنجاب",
  Sindh: "سندھ",
  Balochistan: "بلوچستان",
  "Khyber Pakhtunkhwa": "خیبر پختونخوا",
  "Islamabad Capital Territory": "اسلام آباد",
  "Gilgit-Baltistan": "گلگت بلتستان",
  "Azad Jammu & Kashmir": "آزاد جموں و کشمیر",
};

const FACILITY_TYPE_URDU: Record<string, string> = {
  "Government district headquarters hospital": "ضلعی صدر دفتر ہسپتال",
  "Government tehsil headquarters hospital": "تحصیلی صدر دفتر ہسپتال",
  "Government teaching hospital": "تدریسی ہسپتال",
  "Government civil hospital": "سول ہسپتال",
  "Government hospital": "سرکاری ہسپتال",
  "Government specialized hospital": "خصوصی ہسپتال",
  "Government district or teaching hospital": "ضلعی یا تدریسی ہسپتال",
};

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_UR = [
  "جنوری",
  "فروری",
  "مارچ",
  "اپریل",
  "مئی",
  "جون",
  "جولائی",
  "اگست",
  "ستمبر",
  "اکتوبر",
  "نومبر",
  "دسمبر",
];

export const translateProvince = (province: string, language: Language) =>
  language === "ur" ? (PROVINCE_URDU[province] ?? province) : province;

export const translateFacilityType = (facilityType: string, language: Language) =>
  language === "ur" ? (FACILITY_TYPE_URDU[facilityType] ?? facilityType) : facilityType;

export const formatCheckedDate = (
  value: string | null | undefined,
  language: Language,
  notRecorded: string,
) => {
  if (!value) return notRecorded;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return notRecorded;
  const months = language === "ur" ? MONTHS_UR : MONTHS_EN;
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
};

export const replaceCount = (template: string, count: number) =>
  template.replace("{count}", String(count));
