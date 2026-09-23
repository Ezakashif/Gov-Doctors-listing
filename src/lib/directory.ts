export type PublicDoctor = {
  id: string;
  name: string;
  designation: string;
  specialty: string;
  facilityName: string;
  facilityType: string;
  address: string;
  city: string;
  province: string;
  officialPhone: string;
  availabilityNote: string;
  pmdcVerified: true;
  governmentEmploymentVerified: true;
  sourceName: string;
  sourceUrl: string;
  lastVerifiedAt: string;
};

export type DirectoryResponse = {
  doctors: PublicDoctor[];
  mode: "database" | "sample";
  updatedAt: string;
};

export const pilotCities = ["Islamabad", "Lahore", "Karachi", "Peshawar"] as const;

export const sampleDoctors: PublicDoctor[] = [
  {
    id: "sample-islamabad-1",
    name: "Dr. Zoya Ahmed",
    designation: "Medical Officer",
    specialty: "General Medicine",
    facilityName: "Pakistan Institute of Medical Sciences",
    facilityType: "Federal government hospital",
    address: "Ibn-e-Sina Road, G-8/3, Islamabad",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    officialPhone: "051 9261170",
    availabilityNote: "Please call the hospital to confirm clinic hours.",
    pmdcVerified: true,
    governmentEmploymentVerified: true,
    sourceName: "Demonstration record",
    sourceUrl: "",
    lastVerifiedAt: "2026-09-20T10:00:00.000Z",
  },
  {
    id: "sample-lahore-1",
    name: "Dr. Ayesha Malik",
    designation: "Women Medical Officer",
    specialty: "General Medicine",
    facilityName: "Services Hospital Lahore",
    facilityType: "Punjab government teaching hospital",
    address: "Jail Road, Lahore",
    city: "Lahore",
    province: "Punjab",
    officialPhone: "042 99203402",
    availabilityNote: "Please call the hospital to confirm clinic hours.",
    pmdcVerified: true,
    governmentEmploymentVerified: true,
    sourceName: "Demonstration record",
    sourceUrl: "",
    lastVerifiedAt: "2026-09-19T11:30:00.000Z",
  },
  {
    id: "sample-karachi-1",
    name: "Dr. Hamza Siddiqui",
    designation: "Medical Officer",
    specialty: "Internal Medicine",
    facilityName: "Jinnah Postgraduate Medical Centre",
    facilityType: "Federal government hospital",
    address: "Rafiqui Shaheed Road, Karachi",
    city: "Karachi",
    province: "Sindh",
    officialPhone: "021 99201300",
    availabilityNote: "Please call the hospital to confirm clinic hours.",
    pmdcVerified: true,
    governmentEmploymentVerified: true,
    sourceName: "Demonstration record",
    sourceUrl: "",
    lastVerifiedAt: "2026-09-18T09:15:00.000Z",
  },
  {
    id: "sample-peshawar-1",
    name: "Dr. Sanaullah Khan",
    designation: "Medical Officer",
    specialty: "General Medicine",
    facilityName: "Lady Reading Hospital",
    facilityType: "Khyber Pakhtunkhwa government hospital",
    address: "Soekarno Road, Peshawar",
    city: "Peshawar",
    province: "Khyber Pakhtunkhwa",
    officialPhone: "091 9211430",
    availabilityNote: "Please call the hospital to confirm clinic hours.",
    pmdcVerified: true,
    governmentEmploymentVerified: true,
    sourceName: "Demonstration record",
    sourceUrl: "",
    lastVerifiedAt: "2026-09-17T13:45:00.000Z",
  },
  {
    id: "sample-lahore-2",
    name: "Dr. Bilal Raza",
    designation: "Senior Medical Officer",
    specialty: "Emergency Medicine",
    facilityName: "Mayo Hospital Lahore",
    facilityType: "Punjab government teaching hospital",
    address: "Hospital Road, Anarkali, Lahore",
    city: "Lahore",
    province: "Punjab",
    officialPhone: "042 99211100",
    availabilityNote: "Please call the hospital to confirm clinic hours.",
    pmdcVerified: true,
    governmentEmploymentVerified: true,
    sourceName: "Demonstration record",
    sourceUrl: "",
    lastVerifiedAt: "2026-09-19T08:20:00.000Z",
  },
  {
    id: "sample-karachi-2",
    name: "Dr. Mahnoor Ali",
    designation: "Women Medical Officer",
    specialty: "Family Medicine",
    facilityName: "Dr. Ruth K. M. Pfau Civil Hospital",
    facilityType: "Sindh government teaching hospital",
    address: "Mission Road, Karachi",
    city: "Karachi",
    province: "Sindh",
    officialPhone: "021 99215900",
    availabilityNote: "Please call the hospital to confirm clinic hours.",
    pmdcVerified: true,
    governmentEmploymentVerified: true,
    sourceName: "Demonstration record",
    sourceUrl: "",
    lastVerifiedAt: "2026-09-18T14:00:00.000Z",
  },
];
