"use client";

import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Database,
  ExternalLink,
  FileCheck2,
  HeartPulse,
  Languages,
  MapPin,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  Stethoscope,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  type DirectoryResponse,
  type PublicDoctor,
  pilotCities,
  sampleDoctors,
} from "@/lib/directory";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export default function Home() {
  const [doctors, setDoctors] = useState<PublicDoctor[]>(sampleDoctors);
  const [dataMode, setDataMode] = useState<DirectoryResponse["mode"]>("sample");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All cities");
  const [specialty, setSpecialty] = useState("All specialties");
  const [selectedDoctor, setSelectedDoctor] = useState<PublicDoctor | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/doctors")
      .then((response) => {
        if (!response.ok) throw new Error("Directory unavailable");
        return response.json() as Promise<DirectoryResponse>;
      })
      .then((payload) => {
        if (!active) return;
        setDoctors(payload.doctors);
        setDataMode(payload.mode);
      })
      .catch(() => {
        if (active) setDataMode("sample");
      });
    return () => {
      active = false;
    };
  }, []);

  const specialties = useMemo(
    () => [...new Set(doctors.map((doctor) => doctor.specialty))].sort(),
    [doctors],
  );

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const facilityInitials = doctor.facilityName
        .split(/\s+/)
        .filter((word) => !["of", "and", "the"].includes(word.toLowerCase()))
        .map((word) => word[0])
        .join("")
        .toLowerCase();
      const matchesQuery =
        !needle ||
        facilityInitials.includes(needle) ||
        [
          doctor.name,
          doctor.designation,
          doctor.specialty,
          doctor.facilityName,
          doctor.address,
        ].some((value) => value.toLowerCase().includes(needle));
      const matchesCity = city === "All cities" || doctor.city === city;
      const matchesSpecialty =
        specialty === "All specialties" || doctor.specialty === specialty;
      return matchesQuery && matchesCity && matchesSpecialty;
    });
  }, [city, doctors, query, specialty]);

  const searchDirectory = () =>
    document.getElementById("directory")?.scrollIntoView({ behavior: "smooth" });

  const clearFilters = () => {
    setQuery("");
    setCity("All cities");
    setSpecialty("All specialties");
  };

  return (
    <main>
      <div className="unofficial-bar">
        <span><CircleAlert size={14} /> Independent, unofficial public directory</span>
        <a href="#standards">How records are verified <ArrowRight size={14} /></a>
      </div>

      <header className="nav-shell">
        <nav className="nav container">
          <a className="brand" href="#">
            <span className="brand-mark"><HeartPulse size={23} strokeWidth={2.4} /></span>
            <span>Sehat<span>Directory</span></span>
          </a>
          <div className={`nav-links ${mobileOpen ? "open" : ""}`}>
            <a href="#directory" onClick={() => setMobileOpen(false)}>Find a doctor</a>
            <a href="#cities" onClick={() => setMobileOpen(false)}>Pilot cities</a>
            <a href="#standards" onClick={() => setMobileOpen(false)}>Verification</a>
            <a href="#about" onClick={() => setMobileOpen(false)}>About</a>
          </div>
          <div className="nav-actions">
            <button className="language" type="button"><Languages size={17} /> اردو</button>
            <a className="report-link" href="mailto:corrections@sehatdirectory.pk">Report a correction</a>
            <button className="menu-button" type="button" aria-label="Toggle navigation" onClick={() => setMobileOpen((value) => !value)}>
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-pattern" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><ShieldCheck size={15} /> Hajj 2027 medical form support</div>
            <h1>Find a verified government doctor <em>near you.</em></h1>
            <p className="hero-lead">
              Search government doctors with a valid PMDC registration who may
              complete your Hajj medical fitness certificate.
            </p>

            <div className="search-panel">
              <label className="search-control search-wide">
                <span>Doctor, specialty or hospital</span>
                <div><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. General Medicine or PIMS" /></div>
              </label>
              <label className="search-control">
                <span>City</span>
                <div><MapPin size={20} /><select value={city} onChange={(event) => setCity(event.target.value)}><option>All cities</option>{pilotCities.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={16} /></div>
              </label>
              <button className="primary-button" type="button" onClick={searchDirectory}><Search size={18} /> Find doctors</button>
            </div>

            <div className="hero-notes">
              <span><CheckCircle2 size={16} /> Valid PMDC registration checked</span>
              <span><CheckCircle2 size={16} /> Government posting checked</span>
              <span><CheckCircle2 size={16} /> PMDC numbers kept private</span>
            </div>
          </div>

          <aside className="purpose-card">
            <span className="purpose-icon"><FileCheck2 size={29} /></span>
            <span className="kicker">BEFORE YOU VISIT</span>
            <h2>Confirm with the facility</h2>
            <p>Doctor postings and clinic hours can change. Call the official hospital number before travelling and take the current Ministry-issued Hajj medical form.</p>
            <div className="purpose-checks">
              <span><BadgeCheck size={18} /><b>PMDC status</b> verified internally</span>
              <span><Building2 size={18} /><b>Government role</b> sourced separately</span>
              <span><Phone size={18} /><b>Contact details</b> belong to the facility</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="directory section" id="directory">
        <div className="container">
          <div className="section-heading split">
            <div>
              <span className="kicker">FOUR-CITY PILOT</span>
              <h2>Government doctor directory</h2>
              <p>Only records that pass both PMDC and government-employment checks are publishable.</p>
            </div>
            <div className={`data-mode ${dataMode}`}><Database size={15} /> {dataMode === "database" ? "Connected directory" : "Sample records"}</div>
          </div>

          {dataMode === "sample" && (
            <div className="sample-notice">
              <CircleAlert size={19} />
              <span><b>Demonstration data:</b> these names and details are placeholders, not verified public listings.</span>
            </div>
          )}

          <div className="filter-bar">
            <label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, facility or address" /></label>
            <label><MapPin size={17} /><select value={city} onChange={(event) => setCity(event.target.value)}><option>All cities</option>{pilotCities.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
            <label><Stethoscope size={17} /><select value={specialty} onChange={(event) => setSpecialty(event.target.value)}><option>All specialties</option>{specialties.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
            <div className="verified-filter"><BadgeCheck size={17} /> PMDC verified only</div>
          </div>

          <div className="results-summary">
            <span>{results.length} verified {results.length === 1 ? "record" : "records"}</span>
            {(query || city !== "All cities" || specialty !== "All specialties") && <button type="button" onClick={clearFilters}>Clear filters</button>}
          </div>

          <div className="doctor-grid">
            {results.map((doctor) => (
              <article className="doctor-card" key={doctor.id}>
                <div className="doctor-head">
                  <div className="doctor-avatar">{doctor.name.split(" ").slice(1).map((part) => part[0]).join("").slice(0, 2)}</div>
                  <div>
                    <h3>{doctor.name} <BadgeCheck size={18} aria-label="PMDC verified" /></h3>
                    <p>{doctor.designation} · {doctor.specialty}</p>
                  </div>
                </div>
                <div className="verification-row">
                  <span><ShieldCheck size={15} /> PMDC verified</span>
                  <span><Building2 size={15} /> Government posting verified</span>
                </div>
                <div className="doctor-details">
                  <div><Building2 size={18} /><span><small>GOVERNMENT FACILITY</small><strong>{doctor.facilityName}</strong><em>{doctor.facilityType}</em></span></div>
                  <div><MapPin size={18} /><span><small>ADDRESS</small><strong>{doctor.address}</strong></span></div>
                  <div><Phone size={18} /><span><small>OFFICIAL SWITCHBOARD</small><strong>{doctor.officialPhone}</strong></span></div>
                </div>
                <div className="doctor-foot">
                  <span>Checked {formatDate(doctor.lastVerifiedAt)}</span>
                  <button type="button" onClick={() => setSelectedDoctor(doctor)}>View details <ArrowRight size={15} /></button>
                </div>
              </article>
            ))}
          </div>

          {results.length === 0 && (
            <div className="empty-state"><Search size={30} /><h3>No matching verified records</h3><p>Try another city, facility, or specialty.</p><button type="button" onClick={clearFilters}>Reset filters</button></div>
          )}
        </div>
      </section>

      <section className="cities section" id="cities">
        <div className="container">
          <div className="section-heading centered"><span className="kicker">INITIAL COVERAGE</span><h2>Four-city pilot</h2><p>We are starting with a small, auditable directory before expanding across Pakistan.</p></div>
          <div className="city-grid">
            {pilotCities.map((item, index) => {
              const count = doctors.filter((doctor) => doctor.city === item).length;
              return (
                <button className="city-card" type="button" key={item} onClick={() => { setCity(item); setTimeout(searchDirectory, 50); }}>
                  <span className={`city-icon city-${index + 1}`}><Building2 size={24} /></span>
                  <strong>{item}</strong>
                  <small>{count} {dataMode === "sample" ? "sample" : "verified"} {count === 1 ? "record" : "records"}</small>
                  <em>Browse directory <ArrowRight size={15} /></em>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="standards section" id="standards">
        <div className="container standards-grid">
          <div className="standards-copy">
            <span className="kicker">PUBLICATION STANDARD</span>
            <h2>Two checks before a doctor appears</h2>
            <p>Registration and employment are different facts. We verify them independently and keep the evidence attached to each internal record.</p>
            <div className="standard-step"><span>01</span><div><b>Government source check</b><p>A public hospital or health-department source must support the doctor’s current posting.</p></div></div>
            <div className="standard-step"><span>02</span><div><b>PMDC validity check</b><p>The registration must be valid when checked. The registration number is retained internally and never displayed.</p></div></div>
            <div className="standard-step"><span>03</span><div><b>Ongoing review</b><p>Stale, disputed, or failed records are hidden until they can be verified again.</p></div></div>
          </div>
          <aside className="independence-card">
            <ShieldCheck size={38} />
            <span className="kicker">INDEPENDENT PROJECT</span>
            <h3>Not a government website</h3>
            <p>Sehat Directory is not affiliated with or endorsed by PMDC, the Ministry of Religious Affairs, or any provincial government.</p>
            <ul>
              <li><CheckCircle2 size={17} /> Public-source attribution</li>
              <li><CheckCircle2 size={17} /> Correction and removal requests</li>
              <li><CheckCircle2 size={17} /> No private phone numbers</li>
            </ul>
            <a href="mailto:corrections@sehatdirectory.pk">Report incorrect information <ArrowRight size={16} /></a>
          </aside>
        </div>
      </section>

      <section className="cta">
        <div className="container cta-inner">
          <div><span className="kicker light">HELP IMPROVE THE DIRECTORY</span><h2>Know of an outdated record?</h2><p>Send us the official source or ask for a correction or removal.</p></div>
          <a href="mailto:corrections@sehatdirectory.pk">Submit a correction <ArrowRight size={17} /></a>
        </div>
      </section>

      <footer id="about">
        <div className="container footer-grid">
          <div><a className="brand footer-brand" href="#"><span className="brand-mark"><HeartPulse size={22} /></span><span>Sehat<span>Directory</span></span></a><p>An independent directory helping Pakistani pilgrims locate verified government doctors for Hajj medical forms.</p></div>
          <div><strong>Directory</strong><a href="#directory">Find a doctor</a><a href="#cities">Pilot cities</a><a href="#standards">Verification standard</a></div>
          <div><strong>Important</strong><p>Always confirm the doctor’s availability with the government facility and use the latest official Hajj medical form.</p></div>
          <div><strong>Emergency</strong><p>This directory is not an emergency service. Call <b>1122</b> or visit the nearest emergency department.</p></div>
        </div>
        <div className="container copyright"><span>© 2026 Sehat Directory Pakistan</span><span>Unofficial directory · Privacy · Corrections</span></div>
      </footer>

      {selectedDoctor && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedDoctor(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label={`${selectedDoctor.name} directory details`} onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setSelectedDoctor(null)} aria-label="Close"><X size={20} /></button>
            <div className="modal-badges"><span><BadgeCheck size={16} /> PMDC verified</span><span><Building2 size={16} /> Government doctor</span></div>
            <h2>{selectedDoctor.name}</h2>
            <p className="modal-role">{selectedDoctor.designation} · {selectedDoctor.specialty}</p>
            <div className="modal-info">
              <div><Building2 /><span><small>GOVERNMENT FACILITY</small><strong>{selectedDoctor.facilityName}</strong><em>{selectedDoctor.facilityType}</em></span></div>
              <div><MapPin /><span><small>ADDRESS</small><strong>{selectedDoctor.address}</strong></span></div>
              <div><Phone /><span><small>OFFICIAL SWITCHBOARD</small><strong>{selectedDoctor.officialPhone}</strong></span></div>
              <div><FileCheck2 /><span><small>LAST CHECKED</small><strong>{formatDate(selectedDoctor.lastVerifiedAt)}</strong></span></div>
            </div>
            <div className="confirm-note"><CircleAlert size={19} /><span><b>Call before travelling.</b>{selectedDoctor.availabilityNote}</span></div>
            <div className="modal-actions">
              <a href={`tel:${selectedDoctor.officialPhone.replace(/\s/g, "")}`}><Phone size={17} /> Call facility</a>
              {selectedDoctor.sourceUrl ? <a className="secondary" href={selectedDoctor.sourceUrl} target="_blank" rel="noreferrer">View source <ExternalLink size={16} /></a> : <span className="source-label">{selectedDoctor.sourceName}</span>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
