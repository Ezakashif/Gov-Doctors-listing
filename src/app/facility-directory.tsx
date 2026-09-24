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
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  type FacilityDetailResponse,
  type PublicFacility,
} from "@/lib/facilities";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const formatDate = (value: string | null | undefined) => {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
};

export function FacilityDirectory({
  initialFacilities,
  mode,
}: {
  initialFacilities: PublicFacility[];
  mode: "database" | "sample";
}) {
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState("All provinces");
  const [city, setCity] = useState("All cities");
  const [selected, setSelected] = useState<FacilityDetailResponse | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const facilities = initialFacilities;
  const dataMode = mode;

  const provinces = useMemo(
    () => [...new Set(facilities.map((item) => item.province))].sort(),
    [facilities],
  );
  const cities = useMemo(
    () =>
      [...new Set(facilities.map((item) => item.city))]
        .filter((item) => province === "All provinces" || facilities.some((facility) => facility.province === province && facility.city === item))
        .sort(),
    [facilities, province],
  );

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return facilities.filter((facility) => {
      const matchesQuery =
        !needle ||
        [facility.name, facility.address, facility.city, facility.district ?? ""].some(
          (value) => value.toLowerCase().includes(needle),
        );
      const matchesProvince =
        province === "All provinces" || facility.province === province;
      const matchesCity = city === "All cities" || facility.city === city;
      return matchesQuery && matchesProvince && matchesCity;
    });
  }, [city, facilities, province, query]);

  const openFacility = async (facility: PublicFacility) => {
    const response = await fetch(`/api/facilities/${facility.id}`);
    if (!response.ok) {
      setSelected({ facility, doctors: [], mode: dataMode });
      return;
    }
    setSelected((await response.json()) as FacilityDetailResponse);
  };

  const clearFilters = () => {
    setQuery("");
    setProvince("All provinces");
    setCity("All cities");
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
            <a href="#directory" onClick={() => setMobileOpen(false)}>Find a facility</a>
            <a href="#standards" onClick={() => setMobileOpen(false)}>Verification</a>
            <a href="#about" onClick={() => setMobileOpen(false)}>About</a>
          </div>
          <div className="nav-actions">
            <button className="language" type="button"><Languages size={17} /> اردو</button>
            <a className="report-link" href="mailto:corrections@sehatdirectory.pk">Report a correction</a>
            <button className="menu-button" type="button" aria-label="Toggle navigation" suppressHydrationWarning onClick={() => setMobileOpen((value) => !value)}>
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
            <h1>Find a government facility <em>near you.</em></h1>
            <p className="hero-lead">
              Start with a verified government hospital or clinic. A government
              doctor with a valid PM&amp;DC number can attest the form — confirm
              at the desk and take the official Ministry form.
            </p>
            <div className="search-panel facility-search">
              <label className="search-control search-wide">
                <span>Facility or area</span>
                <div><Search size={20} /><input suppressHydrationWarning value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. Lady Reading or Peshawar" /></div>
              </label>
              <label className="search-control">
                <span>Province</span>
                <div><MapPin size={20} /><select suppressHydrationWarning value={province} onChange={(event) => { setProvince(event.target.value); setCity("All cities"); }}><option>All provinces</option>{provinces.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={16} /></div>
              </label>
              <button className="primary-button" type="button" onClick={() => document.getElementById("directory")?.scrollIntoView({ behavior: "smooth" })}><Search size={18} /> Find facilities</button>
            </div>
            <div className="hero-notes">
              <span><CheckCircle2 size={16} /> Government facilities first</span>
              <span><CheckCircle2 size={16} /> Doctors listed only after full verification</span>
              <span><CheckCircle2 size={16} /> Call the facility before travelling</span>
            </div>
          </div>
          <aside className="purpose-card">
            <span className="purpose-icon"><FileCheck2 size={29} /></span>
            <span className="kicker">BEFORE YOU VISIT</span>
            <h2>Ask at the government facility</h2>
            <p>Take the current Ministry-issued Hajj medical form. Staff at the Ministry have said any government doctor can attest it if they have a valid PM&amp;DC number. Confirm at the hospital desk; the written Hajj 2027 instructions are not published yet.</p>
            <div className="purpose-checks">
              <span><Building2 size={18} /><b>Facility first</b> address and switchboard</span>
              <span><BadgeCheck size={18} /><b>Doctors</b> only when fully verified</span>
              <span><Phone size={18} /><b>Contact</b> belongs to the facility</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="directory section" id="directory">
        <div className="container">
          <div className="section-heading split">
            <div>
              <span className="kicker">GOVERNMENT FACILITIES</span>
              <h2>Where to inquire about Hajj medical forms</h2>
              <p>Any listed government facility is a place to ask. Only addresses from official sources are published. Individual doctors appear only after a trusted PMDC match.</p>
            </div>
            <div className={`data-mode ${dataMode}`}><Database size={15} /> {dataMode === "database" ? "Connected directory" : "Sample records"}</div>
          </div>

          {dataMode === "sample" && (
            <div className="sample-notice">
              <CircleAlert size={19} />
              <span><b>Demonstration data:</b> these facilities are placeholders, not verified public listings.</span>
            </div>
          )}

          <div className="filter-bar facility-filters">
            <label><Search size={18} /><input suppressHydrationWarning value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search facility or city" /></label>
            <label><MapPin size={17} /><select suppressHydrationWarning value={province} onChange={(event) => { setProvince(event.target.value); setCity("All cities"); }}><option>All provinces</option>{provinces.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
            <label><Building2 size={17} /><select suppressHydrationWarning value={city} onChange={(event) => setCity(event.target.value)}><option>All cities</option>{cities.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
            <div className="verified-filter"><BadgeCheck size={17} /> Verified facilities only</div>
          </div>

          <div className="results-summary">
            <span>{results.length} verified {results.length === 1 ? "facility" : "facilities"}</span>
            {(query || province !== "All provinces" || city !== "All cities") && <button type="button" onClick={clearFilters}>Clear filters</button>}
          </div>

          <div className="doctor-grid">
            {results.map((facility) => (
              <article className="doctor-card" key={facility.id}>
                <div className="doctor-head">
                  <div className="doctor-avatar">{facility.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
                  <div>
                    <h3>{facility.name} <BadgeCheck size={18} aria-label="Facility verified" /></h3>
                    <p>{facility.facilityType}</p>
                  </div>
                </div>
                <div className="verification-row">
                  <span><Building2 size={15} /> Government facility</span>
                  <span><ShieldCheck size={15} /> Address verified</span>
                </div>
                <div className="doctor-details">
                  <div><MapPin size={18} /><span><small>ADDRESS</small><strong>{facility.address}</strong><em>{facility.city}, {facility.province}</em></span></div>
                  <div><Phone size={18} /><span><small>OFFICIAL SWITCHBOARD</small><strong>{facility.officialPhone ?? "Not available"}</strong></span></div>
                </div>
                <div className="doctor-foot">
                  <span>Checked {formatDate(facility.lastVerifiedAt)}</span>
                  <button type="button" onClick={() => void openFacility(facility)}>View details <ArrowRight size={15} /></button>
                </div>
              </article>
            ))}
          </div>

          {results.length === 0 && (
            <div className="empty-state"><Search size={30} /><h3>No matching verified facilities</h3><p>Try another province, city, or facility name.</p><button type="button" onClick={clearFilters}>Reset filters</button></div>
          )}
        </div>
      </section>

      <section className="standards section" id="standards">
        <div className="container standards-grid">
          <div className="standards-copy">
            <span className="kicker">PUBLICATION STANDARD</span>
            <h2>Facilities and doctors are verified separately</h2>
            <p>A hospital appearing in a 2024 seniority list is not enough to list a doctor as Hajj-eligible. Each check stays independent.</p>
            <div className="standard-step"><span>01</span><div><b>Facility address</b><p>Only officially sourced government facility addresses are published.</p></div></div>
            <div className="standard-step"><span>02</span><div><b>Current government posting</b><p>A historical seniority list does not prove the doctor still works there.</p></div></div>
            <div className="standard-step"><span>03</span><div><b>PMDC and Hajj checks</b><p>Doctors appear only after an unambiguous PMDC match and Hajj-attestation confirmation.</p></div></div>
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

      <footer id="about">
        <div className="container footer-grid">
          <div><a className="brand footer-brand" href="#"><span className="brand-mark"><HeartPulse size={22} /></span><span>Sehat<span>Directory</span></span></a><p>An independent directory helping Pakistani pilgrims locate government medical facilities for Hajj medical forms.</p></div>
          <div><strong>Directory</strong><a href="#directory">Find a facility</a><a href="#standards">Verification standard</a></div>
          <div><strong>Important</strong><p>Ask a government doctor with a valid PM&amp;DC number, confirm at the desk, and use the latest official Hajj medical form.</p></div>
          <div><strong>Emergency</strong><p>This directory is not an emergency service. Call <b>1122</b> or visit the nearest emergency department.</p></div>
        </div>
        <div className="container copyright"><span>© 2026 Sehat Directory Pakistan</span><span>Unofficial directory · Privacy · Corrections</span></div>
      </footer>

      {selected && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label={`${selected.facility.name} directory details`} onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setSelected(null)} aria-label="Close"><X size={20} /></button>
            <div className="modal-badges"><span><Building2 size={16} /> Government facility</span><span><BadgeCheck size={16} /> Address verified</span></div>
            <h2>{selected.facility.name}</h2>
            <p className="modal-role">{selected.facility.facilityType} · {selected.facility.city}</p>
            <div className="modal-info">
              <div><MapPin /><span><small>ADDRESS</small><strong>{selected.facility.address}</strong></span></div>
              <div><Phone /><span><small>OFFICIAL SWITCHBOARD</small><strong>{selected.facility.officialPhone ?? "Not available"}</strong></span></div>
              <div><FileCheck2 /><span><small>LAST CHECKED</small><strong>{formatDate(selected.facility.lastVerifiedAt)}</strong></span></div>
            </div>
            <div className="confirm-note"><CircleAlert size={19} /><span><b>Call before travelling.</b> Ask a government doctor with a valid PM&amp;DC number to attest the official form.</span></div>
            <h3 className="facility-doctors-heading">Verified doctors at this facility</h3>
            {selected.doctors.length === 0 ? (
              <p className="facility-doctors-empty">No doctor at this facility has passed every public verification check yet.</p>
            ) : (
              <ul className="facility-doctors">
                {selected.doctors.map((doctor) => (
                  <li key={doctor.id}>
                    <strong>{doctor.name}</strong>
                    <span>{doctor.designation} · {doctor.specialty}</span>
                    {doctor.pmdcRegistrationNumber && <em>PMDC {doctor.pmdcRegistrationNumber}</em>}
                  </li>
                ))}
              </ul>
            )}
            <div className="modal-actions">
              {selected.facility.officialPhone && (
                <a href={`tel:${selected.facility.officialPhone.replace(/\s/g, "")}`}><Phone size={17} /> Call facility</a>
              )}
              {selected.facility.sourceUrl ? <a className="secondary" href={selected.facility.sourceUrl} target="_blank" rel="noreferrer">View source <ExternalLink size={16} /></a> : <span className="source-label">{selected.facility.sourceName}</span>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
