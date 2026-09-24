# Official data-source research

**Research type:** documentation, then a facilities-only import on 24 September 2026. Doctors, PMDC numbers, Hajj statuses, public-doctor rules, and the existing KP pilot records were not changed. The import used official public directories only.

**Research / website access date:** 23 September 2026.

**Document dates** below are the dates printed on the source, not the access date. A government-hosted file from 2021 or 2024 is treated as historical even if the website is still online in 2026.

**Purpose:** identify reliable, current, official Pakistani government sources that could later populate a government medical-facility and doctor directory for Hajj medical-form attestation. This phase does not implement importers.

---

## Method and classification

Sources were assessed from official government domains, official PDFs, and official portals. Private directories, news articles, Google Maps, OpenStreetMap, and aggregator sites were used only as leads and are never treated as authoritative verification.

### Reliability tiers

| Tier | Meaning |
| ---- | ------- |
| **Tier 1** | Official primary source: provincial/federal health department, official hospital website, official HRMIS, official government PDF/Excel/API, PM&DC register |
| **Tier 2** | Official government-linked source: autonomous health authority, Medical Teaching Institution, PPHI/project portal, official public-sector health organisation |
| **Tier 3** | Secondary source: news, private directory, maps, aggregator. May help discover a facility; must not verify government status or Hajj eligibility |

### Currency

| Class | Meaning |
| ----- | ------- |
| **Current** | Document or portal states a 2026 update, or is a live official operational system with a 2026 update mark |
| **Historical** | Explicit earlier document date (for example 1 May 2024 seniority list) |
| **Unknown** | Official and accessible, but no reliable publication/update date was found |

### Access

Public web page · Public PDF · Public CSV/Excel · Public API · Login required · Internal government system · Restricted · Unclear · Broken/unavailable

If login is required, the source is recorded as **potentially useful official source, but not publicly accessible**. No authentication, CAPTCHA, rate limit, or access control was bypassed.

### Automation potential (future only; no importer was built)

| Class | Meaning |
| ----- | ------- |
| **A** | Structured, public, stable, clearly official |
| **B** | Official PDF/Excel/structured page that still needs human review |
| **C** | Official but only suitable for manual verification |
| **D** | Unreliable, inaccessible, ambiguous, outdated, or non-authoritative |

---

## A. Executive summary

No single official source covers all of Pakistan. Facility data is unevenly public. Current government doctor postings are almost never published as a complete public directory.

**Facilities — realistically available now**

- **Punjab** has the strongest public official facility directory: Primary & Secondary Healthcare / Health and Population Department pages for DHQ, THQ, RHC, BHU and dispensaries, plus a separate SHC&ME tertiary-hospital name list.
- **Balochistan** publishes a January 2026 Medical Superintendent list and a live hospital medicine-availability page covering DHQ/THQ/teaching hospitals. Primary-care BHUs are listed on the PPHI-Balochistan dashboard (Tier 2), not as a Health Department address book.
- **Sindh** has an official GIS portal and a facility-in-charge page that *should* include addresses and phones, but the in-charge page was empty or returned HTTP 500 during this research. District facility tables dated **2024** exist on health.sindh.gov.pk.
- **Khyber Pakhtunkhwa** has official facility-name lists (facility-wise position list, RHC/BHU PDFs, some district pages). Most provincial lists lack street addresses and phones. The 2021 RHC/BHU PDF is historical.
- **ICT / Federal** has official hospital websites (PIMS, Federal Government Polyclinic) and an official DHO Islamabad site listing RHCs/BHUs by name. A Ministry of NHSR&C August 2025 tender annex lists federal and ICT primary-care facility *names* without addresses.
- **AJK** has an official Health Department website with no public facility directory.
- **Gilgit-Baltistan** has official Finance Department budget books (FY 2024-25 and 2025-26) that name hospitals and some civil hospitals. They are not address directories and do not prove operational status for pilgrims.

**Doctors — realistically available now**

- Almost every jurisdiction runs or mentions an **HRMIS / leave-transfer portal**. These are **login-required or internal**. They are potentially useful official sources, but not publicly accessible.
- Public doctor evidence is limited to **seniority lists** (historical), **transfer/posting notifications** (event-based, incomplete, often stale on the public page), and a few **manager lists** (Balochistan MS/DHO, January 2026).
- **No province publishes a current public roster** that can establish, for the general medical-officer cadre: “Doctor X is currently employed/posted at Government Facility Y.”
- The existing KP 1 May 2024 seniority list remains **historical government-record evidence only**.

**PM&DC**

- Public practitioner search is available at [https://pmdc.pk/](https://pmdc.pk/) (also presented as www.pmdc.pk) by registration number, full name, or father’s name.
- There is **no documented public API or bulk download**.
- Registration Regulations 2023 allow data “on request in soft copy on payment.” That is an official request channel, not an open feed.
- Name + father-name search does not reliably uniquely identify a doctor. Manual review must continue.

**Hajj**

- Hajj **2027 registration** was launched on 22 June 2026. **No official Hajj 2027 medical form or Hajj 2027 policy/guidelines** were found on mora.gov.pk as of 23 September 2026.
- Official Hajj **2025 guidelines** required a certificate **signed and stamped by any Government doctor of any civil / Armed Forces medical facility**.
- Official Hajj **Policy and Plan 2026** (25 August 2025) says fitness shall be evidenced by a certificate from a **Registered Medical Practitioner in Pakistan**. That text does **not** say “government doctor.”
- The official medical certificate form (2025, and the 2026 download linked from MoRA) asks for doctor name, hospital, tehsil, district, phones, **PM&DC registration number**, and signature/seal.
- **The application must not label any doctor `Hajj attestation verified` from this research.** 2025 and 2026 official texts are not identical, and 2027 instructions are unpublished.

---

## B. Pakistan-wide source map

| Jurisdiction | Facilities source | Doctor / posting source | PM&DC | Hajj |
| ------------ | ----------------- | ----------------------- | ----- | ---- |
| Khyber Pakhtunkhwa | Best public official: Health Department facility-wise position list + official hospital/MTI sites + some district pages. No complete current address directory. | **No suitable public official source found** for current province-wide postings. 2024 seniority list is historical. Transfer page last clearly dated public batches are 2020–2023. HRMIS is not public. | National public search at pmdc.pk | National MoRA sources only. No 2027 form found. |
| Punjab | Best public official: pshealthpunjab.gov.pk Health Facilities (DHQ/THQ/RHC/BHU/Dispensaries) + health.punjab.gov.pk tertiary list. | **No suitable public official source found** for current province-wide postings. HRMIS login required. Public web-orders are event-based. | Same national PM&DC search | Same national MoRA sources |
| Sindh | Best candidate: official GIS + facility-in-charge schema. In-charge page was broken/empty on access. 2024 district tables are historical. | **No suitable public official source found.** HRMIS / intranet login required. Public transfer page showed no records. | Same | Same |
| Balochistan | Best public official for hospitals: Health Department medicine page + MS list dated 19 January 2026. BHUs: PPHI-B dashboard (Tier 2). Addresses largely absent. | Manager lists (MS/DHO) current as of 19 January 2026 only. **No suitable public official source found** for all government doctors. | Same | Same |
| ICT / Federal | Best public official: individual hospital websites + dhoict.gov.pk name lists + NHSRC Aug 2025 name list. Street addresses incomplete except major hospitals. | **No suitable public official source found.** FGPC publishes senior admin contacts only. | Same | Same |
| Azad Jammu & Kashmir | **No suitable public official source found** for a current facility directory with addresses. | **No suitable public official source found.** | Same | Same |
| Gilgit-Baltistan | Best official name list: Finance Department budget 2025-26. Not an address/status directory. | **No suitable public official source found.** APP-reported transfers are news (Tier 3). | Same | Same |

---

## C. Facility sources by jurisdiction

### 1. Khyber Pakhtunkhwa

| Organization | Source | URL | Current / historical | Fields | Access | Tier | Automation |
| ------------ | ------ | --- | -------------------- | ------ | ------ | ---- | ---------- |
| KP Health Department | Facility-wise position list | https://healthkp.gov.pk/c_data/facility_wise_position_list.pdf | **Unknown** (no document date found on the PDF during research) | Facility name, type (BHU/CD/DHQ etc.), district, DHO office, sanctioned-post counts | Public PDF | Tier 1 | B for names; **D for pilgrim addresses** (none present) |
| KP Health Department | RHC / BHU list | https://www.healthkp.gov.pk/public/uploads/downloads-377.pdf announced at https://healthkp.gov.pk/news/view/196 | **Historical** — news page dated **13 April 2021** | District, facility name (partial list) | Public PDF | Tier 1 | D as current directory |
| KP Health Department | Hospital categorisation / Cat-C lists | https://www.healthkp.gov.pk/downloads and downloads/view/2/1 | **Historical / Unknown** (includes 2021 Health Professional Allowance categorisation) | Facility name, category | Public PDF | Tier 1 | B for names only |
| District Administration Bannu | Basic Health Units page | https://bannu.kp.gov.pk/page/basic_health_unit_bhus | **Unknown** (site copyright 2025; no per-row update date) | Facility name, locality/address | Public web page | Tier 1 | B for that district only |
| NHSP-KP (government health project) | PHC dashboard | https://www.nhspkp.gkp.pk/dashboard.php | **Unknown / likely operational** (live scores; no document date) | District, facility name, type, project classification | Public web page | Tier 2 | C |
| Individual MTIs / teaching hospitals | Official hospital sites (for example LRH, KTH, ATH, Saidu Group) | hospital `.gov.pk` / official MTI domains | Current where the hospital site is maintained | Usually name, some contact; staff pages vary | Public web page | Tier 1 or 2 | C |

**Best official facility source currently available:** there is no single complete current directory. The **facility-wise position list** is the broadest official name/type/district inventory. **District government pages** and **official hospital websites** are the only places that sometimes publish a pilgrim-usable address. Official existence on the position list is not the same as a verified address.

### 2. Punjab

| Organization | Source | URL | Current / historical | Fields | Access | Tier | Automation |
| ------------ | ------ | --- | -------------------- | ------ | ------ | ---- | ---------- |
| Health and Population Department (P&SHD) | Health Facilities hub | https://pshealthpunjab.gov.pk/Home/HealthFacilities | **Unknown** (live 2026 official site; no per-record update stamp found) | Links to DHQ / THQ / RHC / BHU / Dispensaries | Public web page | Tier 1 | B |
| Same | DHQ directory | https://pshealthpunjab.gov.pk/Home/DHQ | Unknown | Name, division, district, tehsil, phone, email, detail | Public web page | Tier 1 | B |
| Same | THQ / RHC / BHU / Dispensaries | https://pshealthpunjab.gov.pk/Home/THQ and `/RHC`, `/BHU`, `/Dispensaries` | Unknown | Same column schema | Public web page | Tier 1 | B |
| PSHD South Punjab | DHQ / BHU pages | https://pshdsouthpunjab.gov.pk/district-headquarter-hospitals/ and `/basic-health-units/` | Unknown (copyright 2023; records include phones) | Name, district, tehsil, phone | Public web page | Tier 1 | B |
| Specialized Healthcare & Medical Education Department | Tertiary / teaching hospitals | https://health.punjab.gov.pk/TertiaryHospitals.aspx | Unknown (site marked ©2026) | Facility name, city/district | Public web page | Tier 1 | B for names |
| Punjab Portal (district pages) | Example: Jhelum BHUs | https://punjab.gov.pk/node/662 | **Unknown / likely stale** | Tehsil, name, address, contact | Public web page | Tier 1 | C — coverage incomplete, dates missing |
| DGHS Punjab | Programme description | https://dghs.punjab.gov.pk/ | Current as a department site | Describes DHIS; no public facility dump | Public web page | Tier 1 | D as a directory |
| SHC&ME | Punjab Health Profile counts | https://health.punjab.gov.pk/PunjabHealthProfile.aspx | Unknown | Aggregate counts only (2,461 BHUs, 293 RHCs) | Public web page | Tier 1 | D |

**Best official facility source currently available:** **pshealthpunjab.gov.pk Health Facilities directories**, supplemented by **health.punjab.gov.pk TertiaryHospitals.aspx** for teaching hospitals. Street-level address is not in the list columns; phones/emails may be present. Record-level freshness is **Unknown**.

### 3. Sindh

| Organization | Source | URL | Current / historical | Fields | Access | Tier | Automation |
| ------------ | ------ | --- | -------------------- | ------ | ------ | ---- | ---------- |
| Health Department of Sindh | Facility in-charge list | https://sindhhealth.gov.pk/home/facility_list | **Unknown / Broken** | Schema: name, DDO code, address, district/tehsil/UC, facility type, service type, in-charge, phone, email | Public web page that returned HTTP 500 or empty rows on 23 Sep 2026 | Tier 1 | D until the page is stably populated |
| Health Department of Sindh | GIS | https://gis.sindhhealth.gov.pk/ | **Unknown** (live official GIS) | District, tehsil, facility type (BHU, RHC, DHQ, THQ, teaching, etc.), map location | Public web page | Tier 1 | B/C depending on extractability without bypassing controls |
| Health Department (health.sindh.gov.pk) | District facility tables | Example: https://health.sindh.gov.pk/information-of-health-facilities-2024-dadu | **Historical — 2024** | District, tehsil, UC/village, name, type, operator (DoH/PPHI), hours, functional status | Public web page | Tier 1 | B as 2024 snapshot only |
| Sindh Health Care Commission | Provisional licence list | https://shcc.org.pk/wp-content/uploads/2025/05/List-of-HCEs-with-Provisional-License.pdf | **May 2025** list; includes private HCEs | Name, address, district, type, licence no. | Public PDF | Tier 2 | D as a *government-facility* directory (mixed public/private) |
| EPI-MIS | getFacilities | https://sindh.epimis.pk/Ajax_calls/getFacilities | Unknown | Facility names including private clinics | Public API-like endpoint | Tier 2 / mixed | **D** — not a government-only official directory |
| SHMIS | Hospital MIS home | https://www.shmis.pk/ | News items dated Jan 2026 | Not a public facility address book | Public web page / likely restricted app | Tier 2 | D as a directory |

**Best official facility source currently available:** **Sindh Health GIS** is the only clearly working official spatial inventory. The **facility-in-charge page is the better schema** (address + phone) but was **not reliably accessible**. Until that page is stable, Sindh does **not** have a suitable complete public official address directory.

### 4. Balochistan

| Organization | Source | URL | Current / historical | Fields | Access | Tier | Automation |
| ------------ | ------ | --- | -------------------- | ------ | ------ | ---- | ---------- |
| Health Department Balochistan | Medicine availability by hospital | https://health.balochistan.gov.pk/medicine/ | **Current** (live 2026 operational page) | Hospital name (DHQ/THQ/teaching/civil) | Public web page | Tier 1 | B for hospital names |
| Health Department Balochistan | Hospital managers | https://health.balochistan.gov.pk/contacts-ms/ | **Current — updated 19 January 2026** | Hospital, district, MS name, cell | Public web + PDF | Tier 1 | B |
| Same | MS list PDF | https://health.balochistan.gov.pk/wp-content/uploads/2026/01/MS-List-19Jan.pdf | **Current — 19 January 2026** | Hospital, district, MS, cell | Public PDF | Tier 1 | B |
| Same | DHO list PDF | https://health.balochistan.gov.pk/wp-content/uploads/2026/01/DHO-list-19Jan.pdf | **Current — 19 January 2026** | District, DHO name, cell | Public PDF | Tier 1 | B for DHO offices, not clinical facilities |
| Same | Duty roster | https://health.balochistan.gov.pk/duty-roster/ | **Unknown** (“Will be Updated SOON”) | Facility names only | Public web page | Tier 1 | D until rosters appear |
| DGHS Balochistan | Facility summary | http://www.dghs.gob.pk/H.F%20Summary%202020.pdf | **Historical — 2020** | District-wise counts by type | Public PDF | Tier 1 | D |
| PPHI Balochistan | Facility dashboard | https://pphib.org/bs/ | **Unknown** (live dashboard) | District, BHU/CD name | Public web page | Tier 2 | B for BHU names |

**Best official facility source currently available:** **Health Department hospital/MS materials dated 19 January 2026** for DHQ/THQ/teaching hospitals. **No official public BHU address directory** was found. PPHI-B is the best BHU *name* list but is Tier 2 and lacks addresses.

### 5. Islamabad Capital Territory / Federal Government

| Organization | Source | URL | Current / historical | Fields | Access | Tier | Automation |
| ------------ | ------ | --- | -------------------- | ------ | ------ | ---- | ---------- |
| PIMS | Official site | https://pims.gov.pk/ | Current institutional site | Hospital identity, some location/contact | Public web page | Tier 1 | C |
| Federal Government Polyclinic | Contact / about | https://www.fgpc.gov.pk/contact | Current (house-job result 2025 on site) | Switchboard 051-9218300 / 051-9213175; senior admin names and extensions | Public web page | Tier 1 | C |
| District Health Office ICT | BHU / RHC / facilities | https://dhoict.gov.pk/bhu/ , `/rhc/`, `/health-facility-centers/` | **Unknown** (site content present; images dated Nov 2024 in CMS paths) | Facility names; map links; DHO office G-9 Markaz, 051-9260285 / 051-9261792 | Public web page | Tier 1 | B for names; C for addresses (map links, few street addresses) |
| Ministry of NHSR&C | Tender query responses / facility annex | https://www.nhsrc.gov.pk/SiteImage/Downloads/Responses%20to%20Queries%20(31%20Jul%202025).pdf | **Historical / mid-2025** — document 31 July / 1 August 2025 | Names of federal hospitals, 3 RHCs, 13+ BHUs, CHCs, dispensary | Public PDF | Tier 1 | B for names |
| CDA | CDA Hospitals page | https://cda.gov.pk/cdaHospital | Unknown | Mixes PIMS with private hospitals | Public web page | Tier 1 page, **unreliable mix** | D as government-only directory |
| NHSRC Year Books | 2019-20, 2021-22 | nhsrc.gov.pk year-book PDFs | **Historical** | Institutional descriptions, budgets | Public PDF | Tier 1 | D as current directory |
| Federal Ombudsman report | ICT primary care | mohtasib.gov.pk report PDF | **Historical** | Staffing counts, some facility names | Public PDF | Tier 1 | D |

**Best official facility source currently available:** **official hospital websites** for tertiary/federal hospitals, plus **dhoict.gov.pk** for rural primary-care *names*, plus the **August 2025 NHSRC name list**. There is still **no complete official street-address directory** for ICT BHUs/RHCs.

### 6. Azad Jammu & Kashmir

| Organization | Source | URL | Current / historical | Fields | Access | Tier | Automation |
| ------------ | ------ | --- | -------------------- | ------ | ------ | ---- | ---------- |
| AJK Health Department | Department site | https://health.ajk.gov.pk/ | Current as a 2025 departmental site | DG/Secretary/Minister pages; DG office address in Muzaffarabad; phone +92 (582) 2920015 | Public web page | Tier 1 | D as a facility directory (none published) |
| AJK P&D | Health Policy 2022 | https://pndajk.gov.pk/uploadfiles/downloads/AJK%20Health%20Policy%202022.pdf | **Historical — 2022** | Aggregate staff/facility-type counts | Public PDF | Tier 1 | D |
| AJK PPRA | Historical procurement plans | https://ajkppra.gov.pk/annualprocurement.php | **Historical — FY 2019-20** | Confirms DHQ/THQ procuring agencies by district | Public web page | Tier 1 | D |

**Best official facility source currently available:** **No suitable public official source found.**

### 7. Gilgit-Baltistan

| Organization | Source | URL | Current / historical | Fields | Access | Tier | Automation |
| ------------ | ------ | --- | -------------------- | ------ | ------ | ---- | ---------- |
| GB Finance Department | Budget 2025-26 Volume III | https://gbfinance.gov.pk/uploads/details_data/1772023419.pdf | **Historical / FY 2025-26 budget** (names funded facilities; not a 2026 operational register) | Scheme code, hospital/civil hospital name, district, budget | Public PDF | Tier 1 | B for official names only |
| GB Government | Budget 2024-25 Part C | https://gilgitbaltistan.gov.pk/storage/downloads/Volume-III%20Current%20Revenue%20Expenditure%202024-25%20Part-C.pdf | **Historical — FY 2024-25** | Same pattern | Public PDF | Tier 1 | B for names |
| Auditor General | PHQ Hospital Gilgit performance audit | https://agp.gov.pk/SiteImage/Policy/1.%20Performance%20Audit%20Report%20PHQ%20Hospital%20Gilgit.pdf | **Historical — audit year 2021-22** | Some doctor names and attachments | Public PDF | Tier 1 | D |

No dedicated public Health Department directory website was found.

**Best official facility source currently available:** **GB Finance budget 2025-26** as an official *name list only*. **No suitable public official source found** for addresses, phones, or current operational status.

---

## D. Doctor / posting sources by jurisdiction

The test for every source: can it establish **“Doctor X is currently employed/posted at Government Facility Y”** in September 2026?

### 1. Khyber Pakhtunkhwa

| Organization | Source | URL | Current / historical | Fields | Access | Tier | Automation |
| ------------ | ------ | --- | -------------------- | ------ | ------ | ---- | ---------- |
| KP Health Department | Tentative seniority list MO BS-17 as on **1 May 2024** | https://www.healthkp.gov.pk/public/uploads/news-Tentative%20Seniority%20BPS-17%2C%202024%20%281%29.pdf | **Historical** | Name, father, designation, facility/posting as of that date | Public PDF | Tier 1 | B as historical evidence only |
| Same | Seniority lists index | http://www.dghskp.gov.pk/seniority-list.html and healthkp.gov.pk/downloads | **Historical** (2021–2024 lists) | Cadre, BPS, names | Public PDF | Tier 1 | D for current posting |
| Same | Posting / transfer downloads | https://healthkp.gov.pk/downloads/view/2/3 | **Historical** — latest clearly dated public rows seen were **2023** (and many 2020–2022) | Notification no., some doctor names, from/to | Public PDF | Tier 1 | C for those named doctors as of the order date |
| Same | HRMIS / online leave-transfer | Linked from healthkp.gov.pk (“Online Application (Leave/Transfer)”) | Unknown | Employee self-service | **Login required** | Tier 1 | D publicly; potentially useful official source, but not publicly accessible |
| News report of 4 March 2026 SMO transfers | Pakhtun Digital | news URL only | News claim of 345 Grade-18 postings | Names and some facilities | Public web | **Tier 3** | D |

**Best official doctor source currently available:** **No suitable public official source found** for current province-wide postings. The 2024 seniority list remains useful only as **historical government-record evidence**.

### 2. Punjab

| Organization | Source | URL | Current / historical | Fields | Access | Tier | Automation |
| ------------ | ------ | --- | -------------------- | ------ | ------ | ---- | ---------- |
| P&SHD HISDU | HRMIS | https://hrmis.pshealthpunjab.gov.pk/ (linked from https://pshealthpunjab.gov.pk/Home/HISDU) | Likely current internally | Employee / posting / promotion workflows | **Login required** | Tier 1 | D publicly; potentially useful official source, but not publicly accessible |
| SHC&ME | HRMIS / web orders | https://hrmishealth.punjab.gov.pk/spweborders.aspx | Public order table includes **January 2025** rows (and possibly later; page is live) | Date, section, category (transfer/posting), employee name, designation, file no., PDF | Public web page + PDF | Tier 1 | C — event-based, not a complete current roster |
| P&SHD | Orders / notifications | https://pshealthpunjab.gov.pk/Home/Orders and `/Home/InfoNotifications` | Mixed; many notices are 2023–2025 recruitment/posting *events* | Notices, not a roster | Public web page | Tier 1 | C |
| SHC&ME / P&SHD | Seniority lists | https://health.punjab.gov.pk/SeniorityLists.aspx and https://pshealthpunjab.gov.pk/Home/Senioritylists | **Historical** where dated (examples include 2018 circulation files) | Names, seniority | Public PDF | Tier 1 | D for current posting |

**Best official doctor source currently available:** **No suitable public official source found** for a current complete posting directory. Case-by-case **web orders** can verify a named doctor *as of the order date* only.

### 3. Sindh

| Organization | Source | URL | Current / historical | Fields | Access | Tier | Automation |
| ------------ | ------ | --- | -------------------- | ------ | ------ | ---- | ---------- |
| Health Department | Health Automation / HRMIS | https://sindhhealth.gov.pk/apps/index.html | Unknown internally | HRMIS application | **Login required** | Tier 1 | D publicly; potentially useful official source, but not publicly accessible |
| Health Department | Intranet / official email | linked from sindhhealth.gov.pk | Internal | Unknown | **Login required** | Tier 1 | D |
| health.sindh.gov.pk | Transfer postings | https://health.sindh.gov.pk/notifications?show=transfer_postings | Page live **©2026** but stated **“No Transfer Postings Found”** | None visible | Public web page | Tier 1 | D |
| health.sindh.gov.pk | Leave & Transfer portal notice | https://health.sindh.gov.pk/notifications/2194 dated **6 May 2026** | Current as a portal announcement | Announces portal for BPS-16+ | Public notice; portal itself restricted | Tier 1 | D |
| Facility in-charge list | In-charge officer column | https://sindhhealth.gov.pk/home/facility_list | Broken/empty on access | Would name facility heads only | Broken | Tier 1 | D |
| Private blog of a 25 March 2026 WMO posting | Non-government | — | Claims an official notification | 279 WMOs | **Tier 3** | D |

**Best official doctor source currently available:** **No suitable public official source found.**

### 4. Balochistan

| Organization | Source | URL | Current / historical | Fields | Access | Tier | Automation |
| ------------ | ------ | --- | -------------------- | ------ | ------ | ---- | ---------- |
| Health Department | MS list 19 Jan 2026 | https://health.balochistan.gov.pk/wp-content/uploads/2026/01/MS-List-19Jan.pdf | **Current — 19 January 2026** | Hospital, district, MS name, cell | Public PDF | Tier 1 | B for *managers only* |
| Health Department | DHO list 19 Jan 2026 | https://health.balochistan.gov.pk/wp-content/uploads/2026/01/DHO-list-19Jan.pdf | **Current — 19 January 2026** | District, DHO name, cell | Public PDF | Tier 1 | B for DHOs only |
| Health Department | Duty roster | https://health.balochistan.gov.pk/duty-roster/ | Not populated | — | Public web | Tier 1 | D |
| PPHI-B | BHU staff | https://pphib.org/pphi-b/bhu-staff/ | **Unknown** | Name, father name, designation, district, posting | Public web page | Tier 2 | C — currency unmarked; not Health Department HR |

**Best official doctor source currently available:** **No suitable public official source found** for government doctors as a whole. The January 2026 MS/DHO lists are current **only for those administrative postings**.

### 5. ICT / Federal

| Organization | Source | URL | Current / historical | Fields | Access | Tier | Automation |
| ------------ | ------ | --- | -------------------- | ------ | ------ | ---- | ---------- |
| FGPC | Contact directory | https://www.fgpc.gov.pk/contact | Unknown freshness | Senior admin doctors, designation, phone | Public web page | Tier 1 | C for those named officers |
| PIMS | Website | https://pims.gov.pk/ | Current site | No complete public clinician roster found | Public web page | Tier 1 | D as a doctor directory |
| Federal / provincial HR systems | Not found as public directories | — | — | — | Internal / unclear | — | D |

**Best official doctor source currently available:** **No suitable public official source found.**

### 6. Azad Jammu & Kashmir

**No suitable public official source found.** health.ajk.gov.pk does not publish seniority lists, HRMIS, or posting orders. AJK Health Policy 2022 has counts only.

### 7. Gilgit-Baltistan

| Organization | Source | URL | Current / historical | Fields | Access | Tier | Automation |
| ------------ | ------ | --- | -------------------- | ------ | ------ | ---- | ---------- |
| Auditor General | 2021-22 PHQ Gilgit audit | agp.gov.pk audit PDF | **Historical** | Some contractual/attached doctor names | Public PDF | Tier 1 | D |
| Associated Press of Pakistan | Transfer news 7 January (year in byline; news only) | https://www.app.com.pk/domestic/health-department-gilgit-baltistan-announces-major-transfers-of-officers/ | News of senior admin moves | A few named directors/DHOs/MS | Public web | **Tier 3** | D |

**Best official doctor source currently available:** **No suitable public official source found.**

---

## E. PM&DC

Treat PM&DC as **licence / identity verification only**. It does **not** prove government employment, current posting, or Hajj attestation authority.

| Item | Finding |
| ---- | ------- |
| Official public search | [https://pmdc.pk/](https://pmdc.pk/) (same product as www.pmdc.pk). Copy states: search by **Registration Number, Full Name or Father Name** to see **licence validity and registered qualifications**. |
| Search fields | Registration number; full name; father name. Results table: Registration No., Full Name, Father Name, Status, Detail. |
| Registration-number search | Yes — this is the only reliable public lookup when the number is already known from an official document. |
| Name + father name | Available, but **not reliable unique identification**. Common names, spelling variants, incomplete combined filtering, and multiple matches remain. Qualification/specialty on the register can help a *human* disambiguate; they do not make automated matching safe. |
| Downloadable public dataset | **Not published.** |
| Official API | **No documented public API.** |
| Bulk / official extract | Registration Regulations 2023: “Data of registered practitioners shall be provided on request in soft copy on payment as specified in these regulations.” Contact path: IT Section, it.section@pmdc.pk; helpline 051-9190000. This is a **restricted paid request**, not open automation. |
| Practitioner login portals | https://online.pmdc.pk/Account/Login and https://portal.pmdc.pk/signup — for doctors’ own credentials. **Not** a public directory. Do not bypass login. |
| Access restrictions observed | Public HTML search only. No official bulk endpoint. Do not guess registration numbers. Do not scrape or circumvent rate limits/CAPTCHAs if introduced. |

### What can be automated

- **Nothing safely at national scale** from the public search without an approved PM&DC data arrangement.
- Future **A** automation would require a **licensed official extract** obtained by request under the 2023 regulations, with written terms.

### What cannot be automated

- Matching the 25 existing KP pilot doctors (or any name list) to PM&DC numbers without human review.
- Treating a name hit as a trusted PMDC number.
- Inferring government employment or Hajj authority from a valid licence.

**Best official verification method:** continue **manual lookup on the official public register**, write trusted fields only after an explicit `verified` decision, and separately request a paid official extract if the Council will licence it. The existing `/review` workflow must remain unchanged.

---

## F. Hajj requirements

Official sources relevant to **medical-form attestation** (not Hajj Medical Mission deployment to KSA):

| Source | URL | Document date | What it says | Currency |
| ------ | --- | ------------- | ------------ | -------- |
| Hajj Policy and Plan 2026 (1447 AH) | https://www.mora.gov.pk/SiteImage/Policy/200825_Hajj-Policy-2026.pdf also listed at https://www.mora.gov.pk/Policies as 25 August 2025 | **25 August 2025** | “Health fitness shall be evidenced by a medical certificate issued by a **Registered Medical Practitioner** in Pakistan.” Mandatory Saudi Taleemat. Terminally ill patients shall not proceed. | Official for **Hajj 2026**. Does **not** by itself prove 2027 rules. |
| Hajj Policy Guidelines 2025 | https://www.mora.gov.pk/SiteImage/Misc/files/260325_hajpolciyguideline25.pdf | **26 March 2025** | Certificate “signed and stamped by any **Government doctor** of any **civil / Armed Forces** medical facility.” Fake certificates to be actioned. | Official for **Hajj 2025**. **Historical** for 2027. |
| Medical Certificate — Hajj 2025 | https://www.mora.gov.pk/SiteImage/Misc/files/Medcert25.pdf | Hajj 2025 form | Doctor name; hospital; tehsil; district; landline; mobile; **PM&DC registration number**; examination findings; signature and seal. Does not print the words “government doctor” on the form itself. | Historical form |
| Medical Certificate — Hajj 2026 | Linked from official MoRA Hajj 2026 downloads / dues advertisement as “Medical Certificate [PDF]”; commonly stored as Medical_Certificate_2026.pdf under mora.gov.pk SiteImage | Hajj 2026 form | Same family of fields (doctor, hospital, PM&DC number, signature/seal) on the 2026 form copies examined | Official for **Hajj 2026** |
| Hajj 2027 registration launch | https://www.mora.gov.pk/NewsDetail/NDdlYWUwYmUtNjE3ZC00OGNkLWI3ZGItM2U1ZmQxZGQyMWVi and Radio Pakistan 22 June 2026 | **22 June 2026** | Registration via https://hajj.mora.gov.pk/login . No medical-form text in the launch notice. | Current process for **registration only** |
| Hajj Medical Mission recruitment | MoRA/NTS notices (2025–26 news and ministry ads) | Hajj 2026 season | Regular **government** doctors/paramedics for **service in KSA**. This is **not** the pilgrim medical-certificate rule. | Do not use for attestation eligibility |

### What evidence is required before the application may label a doctor `Hajj attestation verified`

**Not yet determinable for Hajj 2027.**

As of 23 September 2026:

1. Hajj 2027 official policy, guidelines, and medical form were **not found** on the Ministry site.
2. Hajj 2025 guidelines and Hajj 2026 Cabinet policy **are not identical** on whether the certifying doctor must be a government doctor.
3. Therefore **no doctor should be marked `Hajj attestation verified`** from this research, from PMDC validity alone, or from 2024 government employment.

Minimum evidence that *has appeared* on recent official forms (still not a 2027 decision):

- Doctor’s name
- Hospital / facility name
- Tehsil and district
- Contact numbers
- **PM&DC / Pakistan Medical or Dental Council registration number**
- Signature and official seal
- 2025 guidelines additionally: government doctor at a civil or Armed Forces facility

Do **not** decide 2027 eligibility by assumption. Do **not** change application Hajj status values in this phase.

**Informal ministry conversation (24 September 2026):** the project operator spoke with a Ministry of Religious Affairs staff member, who said any government doctor can attest the pilgrim medical form if they have a PM&DC number. This is useful operational guidance and matches Hajj 2025 guidelines plus the PM&DC field on recent forms. It is **not** a published Hajj 2027 circular. Do not mark any doctor `Hajj attestation verified` from this conversation. Public copy may tell pilgrims to ask a government doctor with a valid PM&DC number and still confirm at the desk.

---

## G. Recommended data-acquisition strategy

Do not implement this now. Sequence by verification strength and public accessibility.

### 1. Facilities (first)

1. Import **nothing** until a human review protocol is written: official URL, document date, access date, fields present, address vs name-only.
2. Start with **public official directories that already name government facilities**:
   - Punjab P&SHD DHQ/THQ/RHC/BHU/Dispensary pages
   - Punjab SHC&ME tertiary list
   - Balochistan hospital/MS list (19 Jan 2026)
   - ICT: PIMS, FGPC, DHO ICT name list, NHSRC Aug 2025 names
   - KP: facility-wise position list for *names only*; addresses only from the same official page that states the address
   - Sindh: use GIS / restored in-charge list only after a stable public extract is possible without bypassing controls
3. Store address and phone **only** when the same official source prints them. Name-only rows stay `needs_review`.
4. AJK and GB: request official lists from the Health Departments; do not invent coverage from Sehat Card news or maps.
5. Never use Google Maps, OSM, or private directories as the verification source.

### 2. Current government doctors (second)

1. Do **not** import the remaining KP seniority-list doctors or any other-province seniority list as current staff.
2. Treat seniority lists as `government_record_historical` only.
3. Seek **written data-access** to provincial HRMIS / DGHS posting systems. Until granted, those systems are not application dependencies.
4. Use public transfer/web-order PDFs only for **named individuals**, as of the **order date**, with human review.
5. Do not treat Balochistan MS/DHO lists as a doctor directory.

### 3. PMDC verification (third)

1. Keep the existing manual `/review` workflow.
2. Optionally write to PM&DC IT Section requesting a licensed soft-copy extract under the 2023 regulations.
3. Do not scrape pmdc.pk. Do not guess numbers.

### 4. Hajj verification (last)

1. Wait for the **official Hajj 2027 medical form and guidelines** on mora.gov.pk.
2. Encode whatever those documents require. If they again require a government doctor + seal + PMDC number, Hajj verification still depends on **current** government posting + **current** valid PMDC + official facility — not on a 2024 list.
3. Until that document exists, every doctor remains `not_verified` or `needs_confirmation`.

---

## H. Blockers

| Blocker | Detail |
| ------- | ------ |
| Inaccessible systems | Punjab HRMIS, Sindh HRMIS/intranet, KP online leave-transfer, likely all other provincial HR systems. Potentially useful official sources, but not publicly accessible. |
| Broken official pages | Sindh facility-in-charge list (HTTP 500 / empty). Balochistan duty roster unpublished. |
| Outdated datasets | KP MO seniority 1 May 2024; KP RHC/BHU PDF April 2021; KP public transfer index largely 2020–2023; AJK Health Policy 2022; DGHS Balochistan 2020 counts; NHSRC year books 2019–2022; GB audit 2021-22; Sindh district tables labelled 2024. |
| Missing addresses | KP provincial lists; Balochistan hospital lists; ICT BHU/RHC pages; GB budgets; most AJK materials. Official name ≠ pilgrim-usable address. |
| Ambiguous facility names | Already demonstrated in the KP pilot (QATHA, Koklian Piran, SMC Swat vs Saidu). Will recur in every province. |
| PMDC limitations | No public API; no public bulk file; name+father matching unsafe; paid extract only on request. |
| Current-posting limitations | **No jurisdiction publishes a complete current public doctor-to-facility roster.** This is the hardest data problem. |
| Dual official Sindh sites | sindhhealth.gov.pk and health.sindh.gov.pk both present as official; completeness differs. |
| PPHI vs Health Department | Many BHUs are operated by PPHI (Sindh, Balochistan). Ownership/operator must be recorded; PPHI is Tier 2. |
| Hajj rule conflict / gap | 2025 guidelines require a government doctor; 2026 policy says registered practitioner; **2027 form not published**. |
| HMM vs attestation | Hajj Medical Mission recruitment is unrelated to who may sign a pilgrim’s medical certificate. |
| No national master facility list online | MEASURE Evaluation historically noted Punjab’s MFL “available but not online.” No public national government MFL was found. |

---

## I. Recommended next implementation phase

**One concrete next phase:** official **facility-name registry expansion from public government directories only**, with no doctor import and no Hajj-status changes.

Scope of that phase (when implementation is authorised):

1. Manually or semi-manually capture facilities from:
   - Punjab P&SHD DHQ/THQ/RHC/BHU/Dispensary pages
   - Punjab SHC&ME tertiary list
   - Balochistan Health Department hospital/MS list (19 January 2026)
   - ICT official hospital sites + DHO ICT name list
   - KP facility-wise position list **names only**, plus any district page that already prints an address
2. For each row store: official source URL, source document date if any, access date, fields present, and `needs_review` unless the **same official page** gives a usable address.
3. Do not import doctors, PMDC numbers, or Hajj eligibility.
4. In parallel (non-code): write official data-access requests to provincial Health Departments / HRMIS owners and to PM&DC for a licensed register extract; monitor mora.gov.pk for the Hajj 2027 medical form.

That phase matches what is actually public and official today. Current doctor postings and Hajj 2027 attestation rules are **not** ready to implement.

---

## Master source table

Access date for all rows: **23 September 2026**.

| Jurisdiction | Data type | Organization | Source | URL | Current? | Data fields | Format | Access | Reliability | Notes |
| ------------ | --------- | ------------ | ------ | --- | -------- | ----------- | ------ | ------ | ----------- | ----- |
| KP | Facilities | KP Health Department | Facility-wise position list | https://healthkp.gov.pk/c_data/facility_wise_position_list.pdf | Unknown | Name, type, district, posts | PDF | Public PDF | Tier 1 | No addresses/phones |
| KP | Facilities | KP Health Department | RHC/BHU list | https://www.healthkp.gov.pk/public/uploads/downloads-377.pdf | Historical | District, name | PDF | Public PDF | Tier 1 | Announced 13 Apr 2021 |
| KP | Facilities | District Bannu | BHU list | https://bannu.kp.gov.pk/page/basic_health_unit_bhus | Unknown | Name, locality | Web | Public web page | Tier 1 | District coverage only |
| KP | Facilities | NHSP-KP | PHC dashboard | https://www.nhspkp.gkp.pk/dashboard.php | Unknown | Name, type, district, score | Web | Public web page | Tier 2 | Project dashboard |
| KP | Doctors | KP Health Department | MO BS-17 seniority | https://www.healthkp.gov.pk/public/uploads/news-Tentative%20Seniority%20BPS-17%2C%202024%20%281%29.pdf | Historical | Name, father, posting as on 1 May 2024 | PDF | Public PDF | Tier 1 | Not current employment |
| KP | Doctors | KP Health Department | Posting/transfer | https://healthkp.gov.pk/downloads/view/2/3 | Historical | Orders, some names | PDF | Public PDF | Tier 1 | Latest clear public dates ~2023 |
| KP | Doctors | KP Health Department | HRMIS / leave-transfer | healthkp.gov.pk online application links | Unknown | Employee self-service | Web | Login required | Tier 1 | Not publicly accessible |
| Punjab | Facilities | P&SHD / Health & Population | Health Facilities | https://pshealthpunjab.gov.pk/Home/HealthFacilities | Unknown | Hub to typed lists | Web | Public web page | Tier 1 | Strongest public directory found |
| Punjab | Facilities | P&SHD | DHQ list | https://pshealthpunjab.gov.pk/Home/DHQ | Unknown | Name, division, district, tehsil, phone, email | Web | Public web page | Tier 1 | Address not in list columns |
| Punjab | Facilities | P&SHD | BHU list | https://pshealthpunjab.gov.pk/Home/BHU | Unknown | Same schema | Web | Public web page | Tier 1 | JS-rendered table |
| Punjab | Facilities | SHC&ME | Tertiary hospitals | https://health.punjab.gov.pk/TertiaryHospitals.aspx | Unknown | Name, city | Web | Public web page | Tier 1 | Teaching/specialised only |
| Punjab | Facilities | PSHD South Punjab | DHQ / BHU | https://pshdsouthpunjab.gov.pk/ | Unknown | Name, district, tehsil, phone | Web | Public web page | Tier 1 | South Punjab subset |
| Punjab | Doctors | P&SHD | HRMIS | https://hrmis.pshealthpunjab.gov.pk/ | Unknown internally | Posting/HR | Web | Login required | Tier 1 | Not publicly accessible |
| Punjab | Doctors | SHC&ME | Web orders | https://hrmishealth.punjab.gov.pk/spweborders.aspx | Mixed; orders seen into 2025 | Name, designation, order PDF | Web | Public web page | Tier 1 | Event-based, not a roster |
| Sindh | Facilities | Health Department | Facility in-charge | https://sindhhealth.gov.pk/home/facility_list | Unknown / broken | Address, phone, type, in-charge | Web | Broken/unavailable | Tier 1 | HTTP 500 / empty on access |
| Sindh | Facilities | Health Department | GIS | https://gis.sindhhealth.gov.pk/ | Unknown | Type, district, map | Web | Public web page | Tier 1 | Best working Sindh inventory |
| Sindh | Facilities | Health Department | District tables 2024 | e.g. https://health.sindh.gov.pk/information-of-health-facilities-2024-dadu | Historical | Village, type, operator, functional | Web | Public web page | Tier 1 | 2024 snapshot |
| Sindh | Facilities | SHCC | Provisional licences May 2025 | https://shcc.org.pk/wp-content/uploads/2025/05/List-of-HCEs-with-Provisional-License.pdf | Historical (May 2025) | Name, address, mixed ownership | PDF | Public PDF | Tier 2 | Includes private HCEs |
| Sindh | Doctors | Health Department | HRMIS | https://sindhhealth.gov.pk/apps/index.html | Unknown | HR | Web | Login required | Tier 1 | Not publicly accessible |
| Sindh | Doctors | Health Department | Transfer postings | https://health.sindh.gov.pk/notifications?show=transfer_postings | Current page, empty | None | Web | Public web page | Tier 1 | “No Transfer Postings Found” |
| Balochistan | Facilities | Health Department | Medicine / hospitals | https://health.balochistan.gov.pk/medicine/ | Current | Hospital names | Web | Public web page | Tier 1 | Secondary/tertiary |
| Balochistan | Facilities | Health Department | MS list | https://health.balochistan.gov.pk/wp-content/uploads/2026/01/MS-List-19Jan.pdf | Current (19 Jan 2026) | Hospital, district, MS, cell | PDF | Public PDF | Tier 1 | No street address |
| Balochistan | Facilities | PPHI-B | BHU dashboard | https://pphib.org/bs/ | Unknown | District, BHU name | Web | Public web page | Tier 2 | No addresses |
| Balochistan | Doctors | Health Department | DHO list | https://health.balochistan.gov.pk/wp-content/uploads/2026/01/DHO-list-19Jan.pdf | Current (19 Jan 2026) | District, DHO, cell | PDF | Public PDF | Tier 1 | Managers only |
| Balochistan | Doctors | PPHI-B | BHU staff | https://pphib.org/pphi-b/bhu-staff/ | Unknown | Name, father, designation, posting | Web | Public web page | Tier 2 | Currency unmarked |
| ICT / Federal | Facilities | PIMS | Official site | https://pims.gov.pk/ | Current site | Hospital identity/contact | Web | Public web page | Tier 1 | One institution |
| ICT / Federal | Facilities | FGPC | Contact | https://www.fgpc.gov.pk/contact | Unknown | Switchboard, senior admin | Web | Public web page | Tier 1 | |
| ICT / Federal | Facilities | DHO ICT | BHU/RHC | https://dhoict.gov.pk/ | Unknown | Facility names, maps | Web | Public web page | Tier 1 | Few street addresses |
| ICT / Federal | Facilities | NHSR&C | Facility annex | https://www.nhsrc.gov.pk/SiteImage/Downloads/Responses%20to%20Queries%20(31%20Jul%202025).pdf | Historical (31 Jul 2025) | Facility names | PDF | Public PDF | Tier 1 | No addresses |
| ICT / Federal | Doctors | FGPC | Admin directory | https://www.fgpc.gov.pk/contact | Unknown | Senior doctors only | Web | Public web page | Tier 1 | Not a clinical roster |
| AJK | Facilities | Health Department | Department site | https://health.ajk.gov.pk/ | Current site | Department contacts only | Web | Public web page | Tier 1 | No directory |
| AJK | Doctors | — | — | — | — | — | — | — | — | No suitable public official source found |
| GB | Facilities | Finance Department | Budget 2025-26 | https://gbfinance.gov.pk/uploads/details_data/1772023419.pdf | Historical (FY 2025-26) | Funded facility names | PDF | Public PDF | Tier 1 | Names only |
| GB | Doctors | — | — | — | — | — | — | — | — | No suitable public official source found |
| National | PM&DC | Pakistan Medical & Dental Council | Public practitioner search | https://pmdc.pk/ | Current register (live search) | Name, father, reg. no., status, qualifications | Web | Public web page | Tier 1 | No public API |
| National | PM&DC | PM&DC | Soft-copy data on request | Registration Regulations 2023 PDF on pmdc.pk | Regulation dated 2023 | Full register extract possible on payment | Request | Restricted | Tier 1 | Official request, not open feed |
| National | Hajj | MoRA&IH | Hajj Policy 2026 | https://www.mora.gov.pk/SiteImage/Policy/200825_Hajj-Policy-2026.pdf | Historical for 2027; official for 2026 | Registered Medical Practitioner certificate | PDF | Public PDF | Tier 1 | Does not say government doctor |
| National | Hajj | MoRA&IH | Hajj Guidelines 2025 | https://www.mora.gov.pk/SiteImage/Misc/files/260325_hajpolciyguideline25.pdf | Historical | Government doctor, civil/AF facility, stamp | PDF | Public PDF | Tier 1 | Conflicts with 2026 policy wording |
| National | Hajj | MoRA&IH | Medical Certificate 2025 | https://www.mora.gov.pk/SiteImage/Misc/files/Medcert25.pdf | Historical | Doctor, hospital, PMDC no., seal | PDF | Public PDF | Tier 1 | Form fields |
| National | Hajj | MoRA&IH | Hajj 2027 registration | https://hajj.mora.gov.pk/login | Current registration | Registration only | Web | Public web page | Tier 1 | No 2027 medical form found |

---

## Application freeze confirmation

At the end of this research phase:

- No doctors imported
- No facilities imported
- No database migrations
- No changes to public doctor rules
- No PMDC numbers added
- No Hajj statuses changed
- No existing records modified
- No scraping or import scripts added to the repository

The only new file intended from this phase is this document.

---

## Addendum — facilities-only import (24 September 2026)

The recommended next phase was authorised and run as a facilities-only official registry import. No doctors, PMDC numbers, or Hajj statuses were added or changed.

| Metric | Before | After |
| ------ | ------ | ----- |
| Doctors | 25 | 25 |
| Public doctors | 0 | 0 |
| Trusted PMDC matches | 0 | 0 |
| Hajj verified | 0 | 0 |
| Facilities | 22 | 5777 |
| Public facilities | 8 | 2183 |
| Verified facilities | 8 | 2183 |
| Needs-review facilities | 14 | 3594 |

Import batch `official-facility-registry-2026`: 5755 inserted, 0 skipped, 0 errors. Existing KP pilot facilities were not overwritten.

Public directory after import (verified + usable official address only): Punjab 2174, ICT 1 (Federal Government Polyclinic), KP 8 (unchanged pilot), Balochistan 0. PIMS, ICT DHO names, Punjab tertiary names without street addresses, and the Balochistan MS list stay internal `needs_review`.

Not imported: remaining KP doctors, other-province doctors, Sindh (GIS / broken official list), AJK, GB, KP province-wide position-list dump (Bannu BHU page 404 on access date), Punjab dispensaries export (404). Draft letters are in `docs/data-access-requests.md` and were not sent.
