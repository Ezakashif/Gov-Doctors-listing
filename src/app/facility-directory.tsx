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
import { useEffect, useMemo, useState } from "react";
import { type PublicFacility } from "@/lib/facilities";
import {
  ALL_CITIES,
  ALL_PROVINCES,
  LANGUAGE_STORAGE_KEY,
  type Language,
  copy,
  formatCheckedDate,
  replaceCount,
  translateFacilityType,
  translateProvince,
} from "@/lib/i18n";

export function FacilityDirectory({
  initialFacilities,
  mode,
}: {
  initialFacilities: PublicFacility[];
  mode: "database" | "sample";
}) {
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState(ALL_PROVINCES);
  const [city, setCity] = useState(ALL_CITIES);
  const [selected, setSelected] = useState<PublicFacility | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [languageReady, setLanguageReady] = useState(false);
  const facilities = initialFacilities;
  const dataMode = mode;
  const t = copy[language];

  useEffect(() => {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === "ur" || saved === "en") setLanguage(saved);
    setLanguageReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "ur" ? "ur" : "en";
    document.documentElement.dir = language === "ur" ? "rtl" : "ltr";
    if (languageReady) {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, [language, languageReady]);

  const provinces = useMemo(
    () => [...new Set(facilities.map((item) => item.province))].sort(),
    [facilities],
  );
  const cities = useMemo(
    () =>
      [...new Set(facilities.map((item) => item.city))]
        .filter((item) => province === ALL_PROVINCES || facilities.some((facility) => facility.province === province && facility.city === item))
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
        province === ALL_PROVINCES || facility.province === province;
      const matchesCity = city === ALL_CITIES || facility.city === city;
      return matchesQuery && matchesProvince && matchesCity;
    });
  }, [city, facilities, province, query]);

  const openFacility = (facility: PublicFacility) => {
    setSelected(facility);
  };

  const clearFilters = () => {
    setQuery("");
    setProvince(ALL_PROVINCES);
    setCity(ALL_CITIES);
  };

  const toggleLanguage = () => {
    setLanguage((current) => (current === "en" ? "ur" : "en"));
  };

  return (
    <main>
      <div className="unofficial-bar">
        <span><CircleAlert size={14} /> {t.unofficialBar}</span>
        <a href="#standards">{t.howListingsWork} <ArrowRight size={14} /></a>
      </div>

      <header className="nav-shell">
        <nav className="nav container">
          <a className="brand" href="#">
            <span className="brand-mark"><HeartPulse size={23} strokeWidth={2.4} /></span>
            <span>Sehat<span>Directory</span></span>
          </a>
          <div className={`nav-links ${mobileOpen ? "open" : ""}`}>
            <a href="#directory" onClick={() => setMobileOpen(false)}>{t.findFacility}</a>
            <a href="#standards" onClick={() => setMobileOpen(false)}>{t.howListingsWork}</a>
            <a href="#about" onClick={() => setMobileOpen(false)}>{t.about}</a>
          </div>
          <div className="nav-actions">
            <button
              className="language"
              type="button"
              onClick={toggleLanguage}
              aria-label={language === "en" ? t.switchToUrdu : t.switchToEnglish}
            >
              <Languages size={16} />
              <span>{t.languageTarget}</span>
            </button>
            <a className="report-link" href="mailto:corrections@sehatdirectory.pk">{t.reportCorrection}</a>
            <button className="menu-button" type="button" aria-label={t.toggleNav} suppressHydrationWarning onClick={() => setMobileOpen((value) => !value)}>
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-pattern" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><ShieldCheck size={15} /> {t.eyebrow}</div>
            <h1>{t.heroTitle} <em>{t.heroEmphasis}</em></h1>
            <p className="hero-lead">{t.heroLead}</p>
            <div className="search-panel facility-search">
              <label className="search-control search-wide">
                <span>{t.facilityOrArea}</span>
                <div><Search size={20} /><input suppressHydrationWarning value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} /></div>
              </label>
              <label className="search-control">
                <span>{t.province}</span>
                <div>
                  <MapPin size={20} />
                  <select suppressHydrationWarning value={province} onChange={(event) => { setProvince(event.target.value); setCity(ALL_CITIES); }}>
                    <option value={ALL_PROVINCES}>{t.allProvinces}</option>
                    {provinces.map((item) => <option key={item} value={item}>{translateProvince(item, language)}</option>)}
                  </select>
                  <ChevronDown size={16} />
                </div>
              </label>
              <button className="primary-button" type="button" onClick={() => document.getElementById("directory")?.scrollIntoView({ behavior: "smooth" })}><Search size={18} /> {t.findFacilities}</button>
            </div>
            <div className="hero-notes">
              <span><CheckCircle2 size={16} /> {t.noteOfficialAddresses}</span>
              <span><CheckCircle2 size={16} /> {t.noteNoDoctors}</span>
              <span><CheckCircle2 size={16} /> {t.noteCallFirst}</span>
            </div>
          </div>
          <aside className="purpose-card">
            <span className="purpose-icon"><FileCheck2 size={29} /></span>
            <span className="kicker">{t.beforeYouVisit}</span>
            <h2>{t.purposeTitle}</h2>
            <p>{t.purposeBody}</p>
            <div className="purpose-checks">
              <span><Building2 size={18} /><b>{t.purposeFacility}</b> {t.purposeFacilityDetail}</span>
              <span><BadgeCheck size={18} /><b>{t.purposeAddress}</b> {t.purposeAddressDetail}</span>
              <span><Phone size={18} /><b>{t.purposePhone}</b> {t.purposePhoneDetail}</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="directory section" id="directory">
        <div className="container">
          <div className="section-heading split">
            <div>
              <span className="kicker">{t.governmentFacilities}</span>
              <h2>{t.directoryTitle}</h2>
              <p>{t.directoryLead}</p>
            </div>
            <div className={`data-mode ${dataMode}`}><Database size={15} /> {dataMode === "database" ? t.connectedDirectory : t.sampleRecords}</div>
          </div>

          {dataMode === "sample" && (
            <div className="sample-notice">
              <CircleAlert size={19} />
              <span>{t.sampleNotice}</span>
            </div>
          )}

          <div className="filter-bar facility-filters">
            <label><Search size={18} /><input suppressHydrationWarning value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchFacilityOrCity} /></label>
            <label>
              <MapPin size={17} />
              <select suppressHydrationWarning value={province} onChange={(event) => { setProvince(event.target.value); setCity(ALL_CITIES); }}>
                <option value={ALL_PROVINCES}>{t.allProvinces}</option>
                {provinces.map((item) => <option key={item} value={item}>{translateProvince(item, language)}</option>)}
              </select>
              <ChevronDown size={14} />
            </label>
            <label>
              <Building2 size={17} />
              <select suppressHydrationWarning value={city} onChange={(event) => setCity(event.target.value)}>
                <option value={ALL_CITIES}>{t.allCities}</option>
                {cities.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <ChevronDown size={14} />
            </label>
            <div className="verified-filter"><BadgeCheck size={17} /> {t.verifiedOnly}</div>
          </div>

          <div className="results-summary">
            <span>{results.length === 1 ? t.verifiedCountOne : replaceCount(t.verifiedCountMany, results.length)}</span>
            {(query || province !== ALL_PROVINCES || city !== ALL_CITIES) && <button type="button" onClick={clearFilters}>{t.clearFilters}</button>}
          </div>

          <div className="doctor-grid">
            {results.map((facility) => (
              <article className="doctor-card" key={facility.id}>
                <div className="doctor-head">
                  <div className="doctor-avatar">{facility.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
                  <div>
                    <h3>{facility.name} <BadgeCheck size={18} aria-label={t.facilityVerified} /></h3>
                    <p>{translateFacilityType(facility.facilityType, language)}</p>
                  </div>
                </div>
                <div className="verification-row">
                  <span><Building2 size={15} /> {t.governmentFacility}</span>
                  <span><ShieldCheck size={15} /> {t.addressVerified}</span>
                </div>
                <div className="doctor-details">
                  <div><MapPin size={18} /><span><small>{t.addressLabel}</small><strong>{facility.address}</strong><em>{facility.city}, {translateProvince(facility.province, language)}</em></span></div>
                  <div><Phone size={18} /><span><small>{t.switchboardLabel}</small><strong>{facility.officialPhone ?? t.notAvailable}</strong></span></div>
                </div>
                <div className="doctor-foot">
                  <span>{t.checked.replace("{date}", formatCheckedDate(facility.lastVerifiedAt, language, t.notRecorded))}</span>
                  <button type="button" onClick={() => openFacility(facility)}>{t.viewDetails} <ArrowRight size={15} /></button>
                </div>
              </article>
            ))}
          </div>

          {results.length === 0 && (
            <div className="empty-state"><Search size={30} /><h3>{t.emptyTitle}</h3><p>{t.emptyBody}</p><button type="button" onClick={clearFilters}>{t.resetFilters}</button></div>
          )}
        </div>
      </section>

      <section className="standards section" id="standards">
        <div className="container standards-grid">
          <div className="standards-copy">
            <span className="kicker">{t.publicationStandard}</span>
            <h2>{t.listingMeansTitle}</h2>
            <p>{t.listingMeansBody}</p>
            <div className="standard-step"><span>01</span><div><b>{t.officialSource}</b><p>{t.officialSourceBody}</p></div></div>
            <div className="standard-step"><span>02</span><div><b>{t.verifiedAddress}</b><p>{t.verifiedAddressBody}</p></div></div>
            <div className="standard-step"><span>03</span><div><b>{t.noDoctorList}</b><p>{t.noDoctorListBody}</p></div></div>
          </div>
          <aside className="independence-card">
            <ShieldCheck size={38} />
            <span className="kicker">{t.independentProject}</span>
            <h3>{t.notGovWebsite}</h3>
            <p>{t.independenceBody}</p>
            <ul>
              <li><CheckCircle2 size={17} /> {t.publicSource}</li>
              <li><CheckCircle2 size={17} /> {t.correctionRequests}</li>
              <li><CheckCircle2 size={17} /> {t.noPrivatePhones}</li>
            </ul>
            <a href="mailto:corrections@sehatdirectory.pk">{t.reportIncorrect} <ArrowRight size={16} /></a>
          </aside>
        </div>
      </section>

      <footer id="about">
        <div className="container footer-grid">
          <div><a className="brand footer-brand" href="#"><span className="brand-mark"><HeartPulse size={22} /></span><span>Sehat<span>Directory</span></span></a><p>{t.footerAbout}</p></div>
          <div><strong>{t.directory}</strong><a href="#directory">{t.findFacility}</a><a href="#standards">{t.howListingsWork}</a></div>
          <div><strong>{t.important}</strong><p>{t.footerImportant}</p></div>
          <div><strong>{t.emergency}</strong><p>{t.footerEmergency}</p></div>
        </div>
        <div className="container copyright"><span>{t.copyright}</span><span>{t.copyrightMeta}</span></div>
      </footer>

      {selected && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label={t.facilityDetails.replace("{name}", selected.name)} onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setSelected(null)} aria-label={t.close}><X size={20} /></button>
            <div className="modal-badges"><span><Building2 size={16} /> {t.governmentFacility}</span><span><BadgeCheck size={16} /> {t.addressVerified}</span></div>
            <h2>{selected.name}</h2>
            <p className="modal-role">{translateFacilityType(selected.facilityType, language)} · {selected.city}</p>
            <div className="modal-info">
              <div><MapPin /><span><small>{t.addressLabel}</small><strong>{selected.address}</strong></span></div>
              <div><Phone /><span><small>{t.switchboardLabel}</small><strong>{selected.officialPhone ?? t.notAvailable}</strong></span></div>
              <div><FileCheck2 /><span><small>{t.lastChecked}</small><strong>{formatCheckedDate(selected.lastVerifiedAt, language, t.notRecorded)}</strong></span></div>
            </div>
            <div className="confirm-note"><CircleAlert size={19} /><span>{t.callBeforeTravel}</span></div>
            <div className="modal-actions">
              {selected.officialPhone && (
                <a href={`tel:${selected.officialPhone.replace(/\s/g, "")}`}><Phone size={17} /> {t.callFacility}</a>
              )}
              {selected.sourceUrl ? <a className="secondary" href={selected.sourceUrl} target="_blank" rel="noreferrer">{t.viewSource} <ExternalLink size={16} /></a> : <span className="source-label">{selected.sourceName}</span>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
