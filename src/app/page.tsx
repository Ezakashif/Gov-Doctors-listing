"use client";

import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  Check,
  ChevronDown,
  CircleCheck,
  Clock3,
  HeartPulse,
  Languages,
  LocateFixed,
  MapPin,
  Menu,
  Navigation,
  Phone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Stethoscope,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type Doctor = {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  city: string;
  province: string;
  shift: string;
  hours: string;
  verified: string;
  initials: string;
  tone: string;
  phone: string;
};

const doctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Ayesha Malik",
    specialty: "General Physician",
    hospital: "Services Hospital",
    city: "Lahore",
    province: "Punjab",
    shift: "On duty now",
    hours: "8:00 AM — 2:00 PM",
    verified: "Verified 12 min ago",
    initials: "AM",
    tone: "mint",
    phone: "042 9920 3402",
  },
  {
    id: 2,
    name: "Dr. Hamza Siddiqui",
    specialty: "Cardiologist",
    hospital: "Jinnah Postgraduate Medical Centre",
    city: "Karachi",
    province: "Sindh",
    shift: "On duty now",
    hours: "9:00 AM — 5:00 PM",
    verified: "Verified 24 min ago",
    initials: "HS",
    tone: "blue",
    phone: "021 9920 1300",
  },
  {
    id: 3,
    name: "Dr. Sanaullah Khan",
    specialty: "Pediatrician",
    hospital: "Lady Reading Hospital",
    city: "Peshawar",
    province: "Khyber Pakhtunkhwa",
    shift: "Starts at 4:00 PM",
    hours: "4:00 PM — 10:00 PM",
    verified: "Verified 35 min ago",
    initials: "SK",
    tone: "amber",
    phone: "091 9211 438",
  },
  {
    id: 4,
    name: "Dr. Zoya Ahmed",
    specialty: "Gynecologist",
    hospital: "Pakistan Institute of Medical Sciences",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    shift: "On duty now",
    hours: "10:00 AM — 6:00 PM",
    verified: "Verified 8 min ago",
    initials: "ZA",
    tone: "rose",
    phone: "051 9261 170",
  },
  {
    id: 5,
    name: "Dr. Bilal Raza",
    specialty: "Emergency Medicine",
    hospital: "Nishtar Hospital",
    city: "Multan",
    province: "Punjab",
    shift: "On duty now",
    hours: "2:00 PM — 10:00 PM",
    verified: "Verified 17 min ago",
    initials: "BR",
    tone: "violet",
    phone: "061 9200 230",
  },
  {
    id: 6,
    name: "Dr. Mahnoor Baloch",
    specialty: "Dermatologist",
    hospital: "Sandeman Provincial Hospital",
    city: "Quetta",
    province: "Balochistan",
    shift: "Starts at 6:00 PM",
    hours: "6:00 PM — 11:00 PM",
    verified: "Verified 41 min ago",
    initials: "MB",
    tone: "cyan",
    phone: "081 9202 013",
  },
];

const cities = [
  { name: "Lahore", count: "138 doctors", landmark: "Punjab" },
  { name: "Karachi", count: "214 doctors", landmark: "Sindh" },
  { name: "Islamabad", count: "84 doctors", landmark: "ICT" },
  { name: "Peshawar", count: "76 doctors", landmark: "Khyber Pakhtunkhwa" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All cities");
  const [specialty, setSpecialty] = useState("All specialties");
  const [onDutyOnly, setOnDutyOnly] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searched, setSearched] = useState(false);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const matchesQuery =
        !needle ||
        [doctor.name, doctor.specialty, doctor.hospital, doctor.city].some(
          (value) => value.toLowerCase().includes(needle),
        );
      const matchesCity = city === "All cities" || doctor.city === city;
      const matchesSpecialty =
        specialty === "All specialties" || doctor.specialty === specialty;
      const matchesDuty = !onDutyOnly || doctor.shift === "On duty now";
      return matchesQuery && matchesCity && matchesSpecialty && matchesDuty;
    });
  }, [query, city, specialty, onDutyOnly]);

  const scrollToResults = () => {
    setSearched(true);
    document.getElementById("doctors")?.scrollIntoView({ behavior: "smooth" });
  };

  const useLocation = () => {
    setCity("Lahore");
    setSearched(true);
  };

  return (
    <main>
      <div className="announcement">
        <span>Public service directory · Duty information is regularly verified</span>
        <a href="#how-it-works">How verification works <ArrowRight size={14} /></a>
      </div>

      <header className="nav-shell">
        <nav className="nav container">
          <a className="brand" href="#">
            <span className="brand-mark"><HeartPulse size={23} strokeWidth={2.4} /></span>
            <span>Sehat<span>Duty</span></span>
          </a>
          <div className={`nav-links ${mobileOpen ? "open" : ""}`}>
            <a href="#doctors" onClick={() => setMobileOpen(false)}>Find a doctor</a>
            <a href="#cities" onClick={() => setMobileOpen(false)}>Cities</a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)}>How it works</a>
            <a href="#about" onClick={() => setMobileOpen(false)}>About</a>
          </div>
          <div className="nav-actions">
            <button className="language"><Languages size={17} /> اردو</button>
            <a className="hospital-link" href="#partner">For hospitals</a>
            <button
              className="menu-button"
              aria-label="Toggle navigation"
              onClick={() => setMobileOpen((value) => !value)}
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-pattern" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span><ShieldCheck size={14} /></span> Verified public health information</div>
            <h1>Find a government doctor <em>on duty, right now.</em></h1>
            <p className="hero-lead">
              Search verified duty rosters from public hospitals across Pakistan.
              Know where to go before you leave home.
            </p>

            <div className="search-card">
              <label className="search-field wide">
                <span>Doctor, specialty or hospital</span>
                <div><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. Cardiologist or Jinnah Hospital" /></div>
              </label>
              <label className="search-field">
                <span>City</span>
                <div><MapPin size={20} />
                  <select value={city} onChange={(event) => setCity(event.target.value)}>
                    <option>All cities</option>
                    {cities.map((item) => <option key={item.name}>{item.name}</option>)}
                    <option>Multan</option><option>Quetta</option>
                  </select>
                  <ChevronDown className="select-arrow" size={16} />
                </div>
              </label>
              <button className="search-button" onClick={scrollToResults}><Search size={19} /> Search doctors</button>
              <button className="location-button" onClick={useLocation}><LocateFixed size={17} /> Use my location</button>
            </div>

            <div className="hero-notes">
              <span><Check size={16} /> No sign-up needed</span>
              <span><Check size={16} /> Free public service</span>
              <span><Check size={16} /> Updated throughout the day</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="Live duty status preview">
            <div className="map-shape map-one" />
            <div className="map-shape map-two" />
            <div className="visual-card">
              <div className="visual-top">
                <span className="live-dot" />
                <span>LIVE DUTY STATUS</span>
                <span className="updated">Updated now</span>
              </div>
              <div className="visual-doctor">
                <div className="avatar large mint">AM</div>
                <div><strong>Dr. Ayesha Malik</strong><span>General Physician</span></div>
                <BadgeCheck className="verified-icon" size={21} />
              </div>
              <div className="visual-hospital">
                <span className="icon-box"><Building2 size={19} /></span>
                <div><small>ON DUTY AT</small><strong>Services Hospital, Lahore</strong></div>
              </div>
              <div className="shift-row">
                <span><Clock3 size={17} /> 8:00 AM — 2:00 PM</span>
                <span className="status"><i /> Available</span>
              </div>
              <button onClick={() => setSelectedDoctor(doctors[0])}>View duty details <ArrowRight size={16} /></button>
            </div>
            <div className="verified-pill"><ShieldCheck size={18} /><div><strong>Hospital verified</strong><small>12 minutes ago</small></div></div>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container trust-grid">
          <div><strong>1,240+</strong><span>Listed doctors</span></div>
          <div><strong>86</strong><span>Public hospitals</span></div>
          <div><strong>34</strong><span>Cities covered</span></div>
          <div className="trust-message"><ShieldCheck size={30} /><span><b>Information you can trust</b>Rosters sourced from participating public hospitals</span></div>
        </div>
      </section>

      <section className="directory section" id="doctors">
        <div className="container">
          <div className="section-heading split">
            <div><span className="kicker">AVAILABLE TODAY</span><h2>Doctors currently on duty</h2><p>Recently verified shifts at government hospitals across Pakistan.</p></div>
            <a href="#search-panel">View all doctors <ArrowRight size={17} /></a>
          </div>

          <div className="filter-bar" id="search-panel">
            <label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search doctors or hospitals" /></label>
            <label><MapPin size={17} /><select value={city} onChange={(event) => setCity(event.target.value)}><option>All cities</option>{[...new Set(doctors.map((doctor) => doctor.city))].map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
            <label><Stethoscope size={17} /><select value={specialty} onChange={(event) => setSpecialty(event.target.value)}><option>All specialties</option>{[...new Set(doctors.map((doctor) => doctor.specialty))].map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
            <button className={`duty-toggle ${onDutyOnly ? "active" : ""}`} onClick={() => setOnDutyOnly((value) => !value)}><span><i /></span> On duty now</button>
            <button className="filter-icon" aria-label="More filters"><SlidersHorizontal size={19} /></button>
          </div>

          <div className="results-summary">
            <span>{results.length} {results.length === 1 ? "doctor" : "doctors"} found</span>
            {(searched || query || city !== "All cities" || specialty !== "All specialties") && <button onClick={() => { setQuery(""); setCity("All cities"); setSpecialty("All specialties"); setOnDutyOnly(false); setSearched(false); }}>Clear filters</button>}
          </div>

          <div className="doctor-grid">
            {results.map((doctor) => (
              <article className="doctor-card" key={doctor.id}>
                <div className="doctor-head">
                  <div className={`avatar ${doctor.tone}`}>{doctor.initials}</div>
                  <div className="doctor-title"><h3>{doctor.name} <BadgeCheck size={17} /></h3><span>{doctor.specialty}</span></div>
                  <span className={`duty-badge ${doctor.shift !== "On duty now" ? "later" : ""}`}><i /> {doctor.shift}</span>
                </div>
                <div className="doctor-details">
                  <div><Building2 size={18} /><span><small>HOSPITAL</small><strong>{doctor.hospital}</strong></span></div>
                  <div><MapPin size={18} /><span><small>LOCATION</small><strong>{doctor.city}, {doctor.province}</strong></span></div>
                  <div><Clock3 size={18} /><span><small>TODAY&apos;S SHIFT</small><strong>{doctor.hours}</strong></span></div>
                </div>
                <div className="doctor-foot">
                  <span><CircleCheck size={15} /> {doctor.verified}</span>
                  <button onClick={() => setSelectedDoctor(doctor)}>View details <ArrowRight size={15} /></button>
                </div>
              </article>
            ))}
          </div>
          {results.length === 0 && <div className="empty-state"><Search size={30} /><h3>No matching doctors</h3><p>Try a different city, specialty, or search term.</p><button onClick={() => { setQuery(""); setCity("All cities"); setSpecialty("All specialties"); setOnDutyOnly(false); }}>Reset filters</button></div>}
        </div>
      </section>

      <section className="cities section" id="cities">
        <div className="container">
          <div className="section-heading centered"><span className="kicker">EXPLORE BY LOCATION</span><h2>Find care in your city</h2><p>Browse verified duty rosters from public hospitals near you.</p></div>
          <div className="city-grid">
            {cities.map((item, index) => (
              <button className="city-card" key={item.name} onClick={() => { setCity(item.name); setOnDutyOnly(false); setTimeout(scrollToResults, 50); }}>
                <span className={`city-icon city-${index + 1}`}><Building2 size={25} /></span>
                <span><strong>{item.name}</strong><small>{item.landmark}</small></span>
                <em>{item.count} <ArrowRight size={15} /></em>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="how section" id="how-it-works">
        <div className="container how-grid">
          <div className="how-copy">
            <span className="kicker">SIMPLE & RELIABLE</span>
            <h2>Get the right information before you go</h2>
            <p>Sehat Duty helps patients save time and avoid unnecessary trips with clear, recent duty information.</p>
            <div className="steps">
              <div><span>01</span><div><strong>Search your area</strong><p>Choose a city, hospital, or the specialty you need.</p></div></div>
              <div><span>02</span><div><strong>Check live duty status</strong><p>See who is available and when their shift ends.</p></div></div>
              <div><span>03</span><div><strong>Visit with confidence</strong><p>Call the official hospital number if you need confirmation.</p></div></div>
            </div>
          </div>
          <div className="verification-card">
            <span className="shield-large"><ShieldCheck size={34} /></span>
            <span className="kicker">OUR VERIFICATION STANDARD</span>
            <h3>Built around trustworthy data</h3>
            <ul>
              <li><CircleCheck size={19} /><span><b>Official sources</b>Duty rosters come from participating hospitals and health departments.</span></li>
              <li><CalendarClock size={19} /><span><b>Time-stamped updates</b>Every listing shows when it was last checked or updated.</span></li>
              <li><Phone size={19} /><span><b>Safe contact details</b>We only publish official facility numbers—never private details.</span></li>
            </ul>
            <a href="#">Learn about our data standards <ArrowRight size={16} /></a>
          </div>
        </div>
      </section>

      <section className="partner" id="partner">
        <div className="container partner-inner">
          <div><span className="kicker light">FOR PUBLIC HEALTH FACILITIES</span><h2>Keep your community informed.</h2><p>Share accurate duty rosters and help patients find care faster. Partner participation is free.</p></div>
          <a href="mailto:partners@sehatduty.pk">List your hospital <ArrowRight size={18} /></a>
        </div>
      </section>

      <footer id="about">
        <div className="container footer-grid">
          <div><a className="brand footer-brand" href="#"><span className="brand-mark"><HeartPulse size={23} /></span><span>Sehat<span>Duty</span></span></a><p>A public service helping people across Pakistan find verified government doctors on duty.</p><span className="made">Made for Pakistan <b>♥</b></span></div>
          <div><strong>Explore</strong><a href="#doctors">Find a doctor</a><a href="#cities">Browse cities</a><a href="#how-it-works">How it works</a></div>
          <div><strong>Information</strong><a href="#">Data standards</a><a href="#">For hospitals</a><a href="#">Report an update</a></div>
          <div><strong>Important</strong><p>This is a demonstration with sample data. For an emergency, call <b>1122</b> or go to your nearest emergency department.</p></div>
        </div>
        <div className="container copyright"><span>© 2026 Sehat Duty Pakistan</span><span>Privacy · Terms · Accessibility</span></div>
      </footer>

      {selectedDoctor && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedDoctor(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label={`${selectedDoctor.name} duty details`} onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedDoctor(null)} aria-label="Close"><X size={20} /></button>
            <div className="modal-status"><span className="live-dot" /> {selectedDoctor.shift}</div>
            <div className="modal-doctor"><div className={`avatar large ${selectedDoctor.tone}`}>{selectedDoctor.initials}</div><div><h2>{selectedDoctor.name} <BadgeCheck size={20} /></h2><p>{selectedDoctor.specialty}</p></div></div>
            <div className="modal-info">
              <div><Building2 /><span><small>HOSPITAL</small><strong>{selectedDoctor.hospital}</strong></span></div>
              <div><Navigation /><span><small>LOCATION</small><strong>{selectedDoctor.city}, {selectedDoctor.province}</strong></span></div>
              <div><Clock3 /><span><small>TODAY&apos;S SHIFT</small><strong>{selectedDoctor.hours}</strong></span></div>
              <div><Phone /><span><small>HOSPITAL SWITCHBOARD</small><strong>{selectedDoctor.phone}</strong></span></div>
            </div>
            <div className="modal-verified"><ShieldCheck size={20} /><span><b>Duty information verified</b>{selectedDoctor.verified}. Call the hospital before travelling if your need is not urgent.</span></div>
            <a className="call-button" href={`tel:${selectedDoctor.phone.replace(/\s/g, "")}`}><Phone size={18} /> Call hospital</a>
          </div>
        </div>
      )}
    </main>
  );
}
