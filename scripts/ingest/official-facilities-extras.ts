import { toOfficialFacility } from "./official-facilities-lib";
import type { OfficialFacilityRecord } from "./official-facilities-types";

const keep = (record: OfficialFacilityRecord | null) => record;

export function curatedOfficialFacilities(): OfficialFacilityRecord[] {
  const ictAuthority = "District Health Office, Islamabad Capital Territory";
  const ictUrl = "https://dhoict.gov.pk/bhu/";
  const ictFacilities: Array<{
    name: string;
    type: string;
    url: string;
  }> = [
    { name: "RHC Tarlai", type: "Rural health centre", url: "https://dhoict.gov.pk/rhc/" },
    { name: "RHC Barakahu", type: "Rural health centre", url: "https://dhoict.gov.pk/rhc/" },
    { name: "RHC Sihala", type: "Rural health centre", url: "https://dhoict.gov.pk/rhc/" },
    { name: "BHU Sohan", type: "Basic health unit", url: ictUrl },
    { name: "BHU Golra Sharif", type: "Basic health unit", url: ictUrl },
    { name: "BHU Jhang Syedan", type: "Basic health unit", url: ictUrl },
    { name: "BHU Shahdara", type: "Basic health unit", url: ictUrl },
    { name: "BHU Bhimber Tarar", type: "Basic health unit", url: ictUrl },
    { name: "BHU Bhukkar", type: "Basic health unit", url: ictUrl },
    { name: "BHU Jagiot", type: "Basic health unit", url: ictUrl },
    { name: "BHU Tumair", type: "Basic health unit", url: ictUrl },
    { name: "BHU Chirah", type: "Basic health unit", url: ictUrl },
    { name: "BHU Gokina", type: "Basic health unit", url: ictUrl },
    { name: "BHU Pind Begwal", type: "Basic health unit", url: ictUrl },
    { name: "BHU Gagri", type: "Basic health unit", url: ictUrl },
    { name: "BHU Phulgran", type: "Basic health unit", url: ictUrl },
    { name: "BHU Kirpa", type: "Basic health unit", url: ictUrl },
    { name: "CHC Rawat", type: "Community health centre", url: ictUrl },
    { name: "CHC Shah Allah Ditta", type: "Community health centre", url: ictUrl },
    { name: "CHC G-15 / Tarnol", type: "Community health centre", url: ictUrl },
    { name: "CHC Bari Imam", type: "Community health centre", url: ictUrl },
    { name: "CHC G-13", type: "Community health centre", url: ictUrl },
    { name: "Dispensary Model Town Humak", type: "Government dispensary", url: ictUrl },
  ];

  const records: OfficialFacilityRecord[] = [];

  for (const facility of ictFacilities) {
    const record = toOfficialFacility({
      name: facility.name,
      facilityType: facility.type,
      province: "Islamabad Capital Territory",
      district: "Islamabad",
      tehsil: "Islamabad",
      city: "Islamabad",
      sourceName: "District Health Office ICT facility pages",
      sourceUrl: facility.url,
      sourceType: "government_page",
      authority: ictAuthority,
      notes:
        "Official DHO ICT page lists the facility name. No official street address was printed on the page.",
    });
    if (record) records.push(record);
  }

  const fgpc = toOfficialFacility({
    name: "Federal Government Polyclinic",
    facilityType: "Federal government hospital",
    province: "Islamabad Capital Territory",
    district: "Islamabad",
    tehsil: "Islamabad",
    city: "Islamabad",
    address: "44 Luqman Hakeem Road, G-6/2, Islamabad",
    officialPhone: "051-9218300",
    sourceName: "Federal Government Polyclinic official contact page",
    sourceUrl: "https://www.fgpc.gov.pk/contact",
    sourceType: "government_page",
    authority: "Federal Government Polyclinic",
    notes: "Official contact page prints the hospital address and switchboard.",
  });
  if (fgpc) records.push(fgpc);

  const pims = toOfficialFacility({
    name: "Pakistan Institute of Medical Sciences",
    facilityType: "Federal government hospital",
    province: "Islamabad Capital Territory",
    district: "Islamabad",
    tehsil: "Islamabad",
    city: "Islamabad",
    sourceName: "Pakistan Institute of Medical Sciences official website",
    sourceUrl: "https://pims.gov.pk/",
    sourceType: "government_page",
    authority: "Pakistan Institute of Medical Sciences",
    notes:
      "Official website confirms the institution. The public location section did not print a street address, so the record was not verified.",
  });
  if (pims) records.push(pims);

  const tertiary: Array<[string, string]> = [
    ["Bahawal Victoria Hospital, Bahawalpur City, Bahawalpur", "Bahawalpur"],
    ["Pervaiz Elahi Institute of Cardiology (PIC), Bahawalpur", "Bahawalpur"],
    ["Nawab Sir Sadiq Muhammad Khan Abbasi Hospital Bahawalpur", "Bahawalpur"],
    ["Sardar Fateh Muhammad Khan Buzdar Institute of Cardiology, Dera Ghazi Khan", "Dera Ghazi Khan"],
    ["Allama Iqbal Teaching Hospital, D.G. Khan", "Dera Ghazi Khan"],
    ["Faisalabad Institute Of Cardiology, Faisalabad City, Faisalabad", "Faisalabad"],
    ["Allied Hospital, Faisalabad City, Faisalabad", "Faisalabad"],
    ["Allied Hospital-II, Faisalabad", "Faisalabad"],
    ["Faisalabad Teaching Hospital, Faisalabad", "Faisalabad"],
    ["Children Hospital, Faisalabad City, Faisalabad", "Faisalabad"],
    ["Gujranwala Teaching Hospital, Gujranwala", "Gujranwala"],
    ["Chaudhary Pervaiz Elahi Institute of Cardiology, Wazirabad", "Gujranwala"],
    ["Aziz Bhatti Shaheed Hospital, Gujrat, Gujrat", "Gujrat"],
    ["Said Mitha Hospital, Lahore City, Lahore", "Lahore"],
    ["Lahore General Hospital, Lahore Cantt, Lahore", "Lahore"],
    ["Punjab Institute of Mental Health, Model Town, Lahore", "Lahore"],
    ["The Children Hospital & The Institute of Child Health, Lahore City, Lahore", "Lahore"],
    ["Jinnah Hospital, Lahore City, Lahore", "Lahore"],
    ["Lady Willingdon Hospital, Lahore City, Lahore", "Lahore"],
    ["Mayo Hospital, Lahore City, Lahore", "Lahore"],
    ["Punjab Institute Of Cardiology, Lahore City, Lahore", "Lahore"],
    ["Services Hospital, Lahore City, Lahore", "Lahore"],
    ["Sir Ganga Ram Hospital, Lahore City, Lahore", "Lahore"],
    ["Govt. Muhammad Nawaz Sharif Hospital, Yakki Gate, Lahore City, Lahore", "Lahore"],
    ["Punjab Dental Hospital, Lahore City, Lahore", "Lahore"],
    ["Mian Munshi DHQ-1 Teaching Hospital, Lahore City, Lahore", "Lahore"],
    ["Govt. Kot Khawaja Saeed Teaching Hospital, Lahore City, Lahore", "Lahore"],
    ["Punjab Institute of Neurosciences, Lahore", "Lahore"],
    ["Jinnah Burn and Reconstructive Surgery Center, Allama Iqbal Medical College, Lahore", "Lahore"],
    ["DHQ Teaching Hospital, Mianwali", "Mianwali"],
    ["Nishtar Hospital, Multan City, Multan", "Multan"],
    ["Ch. Pervaiz Elahi Institute Of Cardiology, Multan City, Multan", "Multan"],
    ["The Children Hospital and The Institute of Child Health, Multan City, Multan", "Multan"],
    ["Tertiary Care Hospital (Nishtar-II), Multan", "Multan"],
    ["Sheikh Zayed Hospital, Rahim Yar Khan", "Rahim Yar Khan"],
    ["Rawalpindi Teaching Hospital, Rawalpindi", "Rawalpindi"],
    ["Holy Family Hospital, Rawalpindi", "Rawalpindi"],
    ["Benazir Bhutto Hospital, Rawalpindi", "Rawalpindi"],
    ["Rawalpindi Institute Of Cardiology, Rawalpindi", "Rawalpindi"],
    ["Sahiwal Teaching Hospital, Sahiwal", "Sahiwal"],
    ["Sahiwal Institute of Cardiology, Sahiwal", "Sahiwal"],
    ["Dr. Faisal Masood Teaching Hospital, Sargodha", "Sargodha"],
    ["Allama Iqbal Memorial Hospital, Sialkot", "Sialkot"],
    ["Govt. Sardar Begum Teaching Hospital, Sialkot", "Sialkot"],
  ];

  for (const [name, district] of tertiary) {
    const record = toOfficialFacility({
      name,
      facilityType: "Government teaching hospital",
      province: "Punjab",
      district,
      tehsil: district,
      city: district,
      sourceName: "Specialized Healthcare & Medical Education Department tertiary hospitals",
      sourceUrl: "https://health.punjab.gov.pk/TertiaryHospitals.aspx",
      sourceType: "government_page",
      authority: "Specialized Healthcare & Medical Education Department, Government of the Punjab",
      notes:
        "Official tertiary-hospital name list. The page does not publish a street address, so the record stays needs_review unless another official source supplies one.",
    });
    if (record) records.push(record);
  }

  const balochistan = [
    ["DHQ Hospital Awaran", "Awaran"],
    ["DHQ Hospital Barkhan", "Barkhan"],
    ["DHQ Hospital Prince Fahad Dalbindin", "Chagai"],
    ["THQ Hospital Nokundi", "Chagai"],
    ["Teaching Hospital Chaman", "Chaman"],
    ["DHQ Hospital Dera Bugti", "Dera Bugti"],
    ["PPL Hospital Sui", "Dera Bugti"],
    ["DHQ Hospital Dukki", "Duki"],
    ["GDA Hospital Gwadar", "Gwadar"],
    ["Pak Oman Pasni Hospital", "Gwadar"],
    ["DHQ Hospital Harnai", "Harnai"],
    ["Jam Ghulam Qadir Govt Teaching Hospital Hub", "Hub"],
    ["DHQ Hospital Jaffarabad", "Jaffarabad"],
    ["DHQ Hospital Gandawah", "Jhal Magsi"],
    ["DHQ Hospital Dhadar", "Kachhi"],
    ["Teaching Hospital Kalat", "Kalat"],
    ["Teaching Hospital Kharan", "Kharan"],
    ["Teaching Hospital Khuzdar", "Khuzdar"],
    ["THQ Wadh", "Khuzdar"],
    ["DHQ Hospital Killa Abdullah", "Killa Abdullah"],
    ["Teaching Hospital Killa Saifullah", "Killa Saifullah"],
    ["DHQ Hospital Kohlu", "Kohlu"],
    ["DHQ Hospital Uthal", "Lasbela"],
    ["Civil Hospital Bela", "Lasbela"],
    ["Teaching Hospital Loralai", "Loralai"],
    ["DHQ Hospital Mastung", "Mastung"],
    ["DHQ Hospital Musakhail", "Musakhail"],
    ["Mir Gul Khan Naseer Teaching Hospital Nushki", "Nushki"],
    ["Teaching Hospital Panjgur", "Panjgur"],
    ["Teaching Hospital Pishin", "Pishin"],
    ["Sandeman Provincial Hospital Quetta", "Quetta"],
    ["Mohtarma Shaheed Benazir Bhutto General Hospital Quetta", "Quetta"],
    ["DHQ Hospital Sherani", "Sherani"],
    ["Teaching Hospital Sibi", "Sibi"],
    ["DHQ Hospital Sohbat Pur", "Sohbat Pur"],
    ["DHQ Hospital Surab", "Surab"],
    ["DHQ Hospital Washuk", "Washuk"],
    ["Teaching Hospital Zhob", "Zhob"],
    ["Teaching Hospital Ziarat", "Ziarat"],
    ["THQ Hospital Sanjavi", "Ziarat"],
  ];

  for (const [name, district] of balochistan) {
    const record = toOfficialFacility({
      name,
      facilityType: name.startsWith("THQ")
        ? "Government tehsil headquarters hospital"
        : name.startsWith("Civil")
          ? "Government civil hospital"
          : "Government district or teaching hospital",
      province: "Balochistan",
      district,
      tehsil: district,
      city: district,
      sourceName: "Balochistan Health Department hospital / MS list",
      sourceUrl: "https://health.balochistan.gov.pk/wp-content/uploads/2026/01/MS-List-19Jan.pdf",
      sourceType: "government_pdf",
      authority: "Health Department, Government of Balochistan",
      sourceDocumentDate: "2026-01-19",
      notes:
        "Official 19 January 2026 Medical Superintendent list / hospital medicine page. No official street address was published.",
    });
    if (record) records.push(record);
  }

  const sindhVerified: Array<{
    name: string;
    facilityType: string;
    district: string;
    city: string;
    address: string;
    officialPhone?: string | null;
    sourceName: string;
    sourceUrl: string;
    authority: string;
    notes: string;
  }> = [
    {
      name: "Jinnah Postgraduate Medical Centre",
      facilityType: "Government teaching hospital",
      district: "Karachi",
      city: "Karachi",
      address: "Rafiqui Shaheed Road, Karachi-75510, Pakistan",
      officialPhone: "+92-21-99201300",
      sourceName: "Jinnah Postgraduate Medical Centre official contact page",
      sourceUrl: "https://jpmc.edu.pk/contact.php",
      authority: "Jinnah Postgraduate Medical Centre",
      notes:
        "Official JPMC contact page prints the address and switchboard. Also named on the Sindh Health Department teaching-hospital list.",
    },
    {
      name: "Dr. Ruth K. M. Pfau, Civil Hospital Karachi",
      facilityType: "Government teaching hospital",
      district: "Karachi",
      city: "Karachi",
      address:
        "Mission Rd, near Civil Hospital Masjid, New Labour Colony Nanakwara, Karachi, Sindh",
      officialPhone: "021-99215740",
      sourceName: "Civil Hospital Karachi official contact page",
      sourceUrl: "https://www.chk.gov.pk/contact.php",
      authority: "Dr. Ruth K. M. Pfau Civil Hospital Karachi",
      notes:
        "Official chk.gov.pk contact page prints the address and switchboard. Also named on the Sindh Health Department teaching-hospital list.",
    },
    {
      name: "National Institute of Cardiovascular Diseases",
      facilityType: "Government specialized hospital",
      district: "Karachi",
      city: "Karachi",
      address: "Rafiqui (H.J.) Shaheed Road, Karachi-75510, Pakistan",
      officialPhone: "+92-21-99201271-5",
      sourceName: "NICVD official contact page",
      sourceUrl: "https://nicvd.org/contact-us",
      authority: "National Institute of Cardiovascular Diseases",
      notes: "Official NICVD contact page prints the Karachi address and switchboard.",
    },
    {
      name: "National Institute of Child Health",
      facilityType: "Government teaching hospital",
      district: "Karachi",
      city: "Karachi",
      address: "Rafiqui H.J. Shaheed Road, Karachi-75510, Pakistan",
      officialPhone: "+92-21-99201261-3",
      sourceName: "National Institute of Child Health official contact page",
      sourceUrl: "https://nich.edu.pk/contact/",
      authority: "National Institute of Child Health",
      notes:
        "Official NICH contact page prints the address and switchboard. Also named on the Sindh Health Department teaching-hospital list.",
    },
    {
      name: "National Institute of Cardiovascular Diseases, Hyderabad",
      facilityType: "Government specialized hospital",
      district: "Hyderabad",
      city: "Hyderabad",
      address: "Qasimabad, Wadhu Wah Road, Hyderabad, Pakistan",
      officialPhone: null,
      sourceName: "NICVD Hyderabad official page",
      sourceUrl:
        "https://nicvd.org/national-institute-of-cardiovascular-diseases-hyderabad",
      authority: "National Institute of Cardiovascular Diseases",
      notes:
        "Official NICVD page prints the Hyderabad satellite-centre address. No switchboard was printed on that page.",
    },
  ];

  for (const facility of sindhVerified) {
    const record = toOfficialFacility({
      name: facility.name,
      facilityType: facility.facilityType,
      province: "Sindh",
      district: facility.district,
      tehsil: facility.city,
      city: facility.city,
      address: facility.address,
      officialPhone: facility.officialPhone || null,
      sourceName: facility.sourceName,
      sourceUrl: facility.sourceUrl,
      sourceType: "government_page",
      authority: facility.authority,
      notes: facility.notes,
    });
    if (record) records.push(record);
  }

  const sindhTeaching: Array<[string, string]> = [
    ["Ghulam M Meher Medical College Hospital Sukkur", "Sukkur"],
    ["Chandka Medical College Hospital Larkana", "Larkana"],
    ["KMC Civil Hospital, Khairpur", "Khairpur"],
    ["Peoples Medical College Hospital Nawabshah (SBA)", "Shaheed Benazirabad"],
    ["Liaquat University Hospital Hyderabad", "Hyderabad"],
  ];

  for (const [name, district] of sindhTeaching) {
    const record = toOfficialFacility({
      name,
      facilityType: "Government teaching hospital",
      province: "Sindh",
      district,
      tehsil: district,
      city: district,
      sourceName: "Sindh Health Department teaching hospitals list",
      sourceUrl: "https://health.sindh.gov.pk/teaching-hospitals",
      sourceType: "government_page",
      authority: "Health Department, Government of Sindh",
      notes:
        "Official Sindh Health Department teaching-hospital name list. The page does not print a street address.",
    });
    if (record) records.push(record);
  }

  const sindhHyderabad2024: Array<[string, string]> = [
    ["Sindh Government Hospital Paretabad", "Hyderabad"],
    ["Sindh Government Hospital Qasimabad", "Hyderabad"],
    ["Services Hospital Hyderabad", "Hyderabad"],
    ["Sindh Government Hospital Shah Bhitai", "Hyderabad"],
    ["Sindh Government Hospital Hazrat Khadija Latifabad", "Hyderabad"],
  ];

  for (const [name, district] of sindhHyderabad2024) {
    const record = toOfficialFacility({
      name,
      facilityType: "Government hospital",
      province: "Sindh",
      district,
      tehsil: district,
      city: district,
      sourceName: "Sindh Health Department health facilities 2024 (Hyderabad)",
      sourceUrl: "https://health.sindh.gov.pk/information-of-health-facilities-hyderabad",
      sourceType: "government_page",
      authority: "Health Department, Government of Sindh",
      sourceDocumentDate: "2024-01-01",
      notes:
        "Official 2024 Hyderabad facility table names this hospital. The table does not print a street address.",
    });
    if (record) records.push(record);
  }

  const badin = toOfficialFacility({
    name: "Civil Hospital Badin (Indus)",
    facilityType: "Government district headquarters hospital",
    province: "Sindh",
    district: "Badin",
    tehsil: "Badin",
    city: "Badin",
    sourceName: "Sindh Health Department health facilities 2024 (Badin)",
    sourceUrl: "https://health.sindh.gov.pk/information-of-health-facilities-badin-2024",
    sourceType: "government_page",
    authority: "Health Department, Government of Sindh",
    sourceDocumentDate: "2024-01-01",
    notes:
      "Official 2024 Badin facility table names this DHQ. The table does not print a street address.",
  });
  if (badin) records.push(badin);

  return records.filter((record): record is OfficialFacilityRecord => Boolean(keep(record)));
}
