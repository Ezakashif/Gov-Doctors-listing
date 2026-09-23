"use client";

import {
  BadgeCheck,
  Building2,
  CircleAlert,
  ClipboardCheck,
  ExternalLink,
  FileSearch,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  OFFICIAL_PMDC_SOURCE_URL,
  PMDC_REVIEW_DECISIONS,
  type PmdcLicenseStatus,
  type PmdcReviewCaseDetail,
  type PmdcReviewDecisionName,
  type PmdcReviewQueueItem,
} from "@/lib/pmdc-review";

const TOKEN_KEY = "sehat-review-token";

const formatDate = (value: string | null | undefined) => {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const statusLabel = (value: string) => value.replaceAll("_", " ");

async function reviewFetch(path: string, token: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const payload = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(
      typeof payload.error === "string" ? payload.error : "Request failed.",
    );
  }
  return payload;
}

export function ReviewConsole() {
  const [token, setToken] = useState(() =>
    typeof window === "undefined"
      ? ""
      : (sessionStorage.getItem(TOKEN_KEY) ?? ""),
  );
  const [tokenInput, setTokenInput] = useState("");
  const [queue, setQueue] = useState<PmdcReviewQueueItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PmdcReviewCaseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [candidateForm, setCandidateForm] = useState({
    registrationNumber: "",
    practitionerName: "",
    fatherName: "",
    qualification: "",
    medicalCollege: "",
    pmdcStatus: "" as "" | PmdcLicenseStatus,
    validUntil: "",
    matchEvidence: "",
    sourceUrl: OFFICIAL_PMDC_SOURCE_URL,
  });
  const [decisionForm, setDecisionForm] = useState({
    decision: "needs_more_information" as PmdcReviewDecisionName,
    reviewerLabel: "",
    notes: "",
    candidateId: "",
  });

  const loadQueue = useCallback(async (accessToken: string) => {
    const payload = await reviewFetch("/api/review/queue", accessToken);
    return payload.queue as PmdcReviewQueueItem[];
  }, []);

  const loadDetail = useCallback(async (accessToken: string, doctorId: string) => {
    const payload = await reviewFetch(
      `/api/review/doctors/${doctorId}`,
      accessToken,
    );
    return payload.detail as PmdcReviewCaseDetail;
  }, []);

  useEffect(() => {
    if (!token) return;
    let active = true;
    void loadQueue(token).then(
      (nextQueue) => {
        if (!active) return;
        setQueue(nextQueue);
        setSelectedId((current) => current ?? nextQueue[0]?.doctorId ?? null);
      },
      (caught: unknown) => {
        if (!active) return;
        setError(caught instanceof Error ? caught.message : "Queue failed.");
        setToken("");
        sessionStorage.removeItem(TOKEN_KEY);
      },
    );
    return () => {
      active = false;
    };
  }, [loadQueue, token]);

  useEffect(() => {
    if (!token || !selectedId) return;
    let active = true;
    void loadDetail(token, selectedId).then(
      (nextDetail) => {
        if (active) setDetail(nextDetail);
      },
      (caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Case failed.");
        }
      },
    );
    return () => {
      active = false;
    };
  }, [loadDetail, selectedId, token]);

  const counts = useMemo(() => {
    return queue.reduce(
      (summary, item) => {
        summary[item.pmdcReviewStatus] += 1;
        return summary;
      },
      {
        pending_review: 0,
        verified: 0,
        unmatched: 0,
        ambiguous: 0,
        needs_more_information: 0,
        rejected: 0,
      },
    );
  }, [queue]);

  const unlock = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await reviewFetch("/api/review/session", tokenInput, { method: "POST" });
      sessionStorage.setItem(TOKEN_KEY, tokenInput);
      setToken(tokenInput);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Access denied.");
    } finally {
      setBusy(false);
    }
  };

  const saveCandidate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !selectedId) return;
    setBusy(true);
    setError(null);
    try {
      await reviewFetch(`/api/review/doctors/${selectedId}/candidates`, token, {
        method: "POST",
        body: JSON.stringify({
          registrationNumber: candidateForm.registrationNumber || null,
          practitionerName: candidateForm.practitionerName || null,
          fatherName: candidateForm.fatherName || null,
          qualification: candidateForm.qualification || null,
          medicalCollege: candidateForm.medicalCollege || null,
          pmdcStatus: candidateForm.pmdcStatus || null,
          validUntil: candidateForm.validUntil || null,
          matchEvidence: { note: candidateForm.matchEvidence || null },
          sourceUrl: candidateForm.sourceUrl || OFFICIAL_PMDC_SOURCE_URL,
        }),
      });
      setDetail(await loadDetail(token, selectedId));
      setCandidateForm({
        registrationNumber: "",
        practitionerName: "",
        fatherName: "",
        qualification: "",
        medicalCollege: "",
        pmdcStatus: "",
        validUntil: "",
        matchEvidence: "",
        sourceUrl: OFFICIAL_PMDC_SOURCE_URL,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Candidate failed.");
    } finally {
      setBusy(false);
    }
  };

  const saveDecision = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !selectedId) return;
    setBusy(true);
    setError(null);
    try {
      const payload = await reviewFetch(
        `/api/review/doctors/${selectedId}/decisions`,
        token,
        {
          method: "POST",
          body: JSON.stringify({
            decision: decisionForm.decision,
            reviewerLabel: decisionForm.reviewerLabel,
            notes: decisionForm.notes,
            candidateId: decisionForm.candidateId || null,
          }),
        },
      );
      setDetail(payload.detail as PmdcReviewCaseDetail);
      const nextQueue = await loadQueue(token);
      setQueue(nextQueue);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Decision failed.");
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <main className="review-shell">
        <form className="review-gate" onSubmit={unlock}>
          <ShieldCheck size={28} />
          <h1>PMDC review queue</h1>
          <p>
            Internal reviewers only. This page is not part of the public
            directory and never publishes unresolved PMDC data.
          </p>
          <label>
            Review access token
            <input
              suppressHydrationWarning
              type="password"
              value={tokenInput}
              onChange={(event) => setTokenInput(event.target.value)}
              autoComplete="off"
            />
          </label>
          {error && <p className="review-error">{error}</p>}
          <button type="submit" disabled={busy || !tokenInput.trim()}>
            Open queue
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="review-shell">
      <header className="review-header">
        <div>
          <span className="kicker">Internal review</span>
          <h1>PMDC verification queue</h1>
          <p>
            Record official register findings here. Trusted PMDC fields are
            written only after an explicit <b>verified</b> decision.
          </p>
        </div>
        <div className="review-counts">
          {Object.entries(counts).map(([status, count]) => (
            <span key={status}>
              <b>{count}</b>
              {statusLabel(status)}
            </span>
          ))}
        </div>
      </header>

      {error && <div className="review-banner">{error}</div>}

      <section className="review-layout">
        <aside className="review-list">
          {queue.map((item) => (
            <button
              type="button"
              key={item.doctorId}
              className={item.doctorId === selectedId ? "active" : ""}
              onClick={() => setSelectedId(item.doctorId)}
            >
              <strong>{item.fullName}</strong>
              <small>{item.fatherName ? `S/O or D/O ${item.fatherName}` : "Father not recorded"}</small>
              <em>{item.facilityName ?? "Facility pending"}</em>
              <span className={`review-pill ${item.pmdcReviewStatus}`}>
                {statusLabel(item.pmdcReviewStatus)}
              </span>
            </button>
          ))}
        </aside>

        {detail && (
          <div className="review-detail">
            <section className="review-card">
              <h2>{detail.fullName}</h2>
              <p>
                {detail.designation} · {detail.specialty}
              </p>
              <div className="review-dimensions">
                <article>
                  <b>Government employment</b>
                  <span>{statusLabel(detail.governmentEmploymentStatus)}</span>
                </article>
                <article>
                  <b>PMDC</b>
                  <span>{statusLabel(detail.pmdcReviewStatus)}</span>
                </article>
                <article>
                  <b>Facility</b>
                  <span>
                    {statusLabel(
                      detail.posting?.facilityVerificationStatus ?? "unknown",
                    )}
                  </span>
                </article>
                <article>
                  <b>Hajj attestation</b>
                  <span>{statusLabel(detail.hajjAttestationStatus)}</span>
                </article>
              </div>
              <dl className="review-facts">
                <div>
                  <dt>Father&apos;s name</dt>
                  <dd>{detail.fatherName ?? "Not recorded"}</dd>
                </div>
                <div>
                  <dt>Qualification</dt>
                  <dd>{detail.qualification ?? "Not recorded in government source"}</dd>
                </div>
                <div>
                  <dt>Government posting</dt>
                  <dd>
                    {detail.posting?.facilityName ?? "Not recorded"}
                    {detail.posting?.designation
                      ? ` · ${detail.posting.designation}`
                      : ""}
                  </dd>
                </div>
                <div>
                  <dt>Source document</dt>
                  <dd>{detail.posting?.sourceName ?? "Not recorded"}</dd>
                </div>
                <div>
                  <dt>Government-record date</dt>
                  <dd>{formatDate(detail.posting?.sourceDocumentDate)}</dd>
                </div>
                <div>
                  <dt>Trusted PMDC number</dt>
                  <dd>
                    {detail.trustedCredential
                      ? `${detail.trustedCredential.registrationNumber} · ${detail.trustedCredential.status}`
                      : "None. Unresolved candidate numbers stay untrusted."}
                  </dd>
                </div>
              </dl>
              {detail.posting?.sourceUrl && (
                <a
                  className="review-link"
                  href={detail.posting.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open government source <ExternalLink size={14} />
                </a>
              )}
            </section>

            <section className="review-card">
              <h3>
                <FileSearch size={18} /> Candidate PMDC results
              </h3>
              <p>
                Candidates are untrusted notes from the official public register.
                They do not populate directory fields until a verified decision
                is recorded.
              </p>
              <a
                className="review-link"
                href={OFFICIAL_PMDC_SOURCE_URL}
                target="_blank"
                rel="noreferrer"
              >
                Open official PM&amp;DC search <ExternalLink size={14} />
              </a>
              {detail.candidates.length === 0 ? (
                <p className="review-empty">No candidate results recorded.</p>
              ) : (
                <ul className="review-candidates">
                  {detail.candidates.map((candidate) => (
                    <li key={candidate.id}>
                      <strong>
                        {candidate.registrationNumber ?? "No registration number recorded"}
                      </strong>
                      <span>
                        {candidate.practitionerName ?? "Name not recorded"} · Father:{" "}
                        {candidate.fatherName ?? "not recorded"}
                      </span>
                      <span>
                        Status: {candidate.pmdcStatus ?? "not recorded"}
                        {candidate.validUntil
                          ? ` until ${formatDate(candidate.validUntil)}`
                          : ""}
                      </span>
                      <em>Untrusted candidate</em>
                    </li>
                  ))}
                </ul>
              )}
              <form className="review-form" onSubmit={saveCandidate}>
                <label>
                  PMDC registration number
                  <input
                    suppressHydrationWarning
                    value={candidateForm.registrationNumber}
                    onChange={(event) =>
                      setCandidateForm((current) => ({
                        ...current,
                        registrationNumber: event.target.value,
                      }))
                    }
                    placeholder="Only if shown on the official register"
                  />
                </label>
                <label>
                  Practitioner name
                  <input
                    suppressHydrationWarning
                    value={candidateForm.practitionerName}
                    onChange={(event) =>
                      setCandidateForm((current) => ({
                        ...current,
                        practitionerName: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Father&apos;s name
                  <input
                    suppressHydrationWarning
                    value={candidateForm.fatherName}
                    onChange={(event) =>
                      setCandidateForm((current) => ({
                        ...current,
                        fatherName: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Qualification
                  <input
                    suppressHydrationWarning
                    value={candidateForm.qualification}
                    onChange={(event) =>
                      setCandidateForm((current) => ({
                        ...current,
                        qualification: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Medical college
                  <input
                    suppressHydrationWarning
                    value={candidateForm.medicalCollege}
                    onChange={(event) =>
                      setCandidateForm((current) => ({
                        ...current,
                        medicalCollege: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Official PMDC status
                  <select
                    suppressHydrationWarning
                    value={candidateForm.pmdcStatus}
                    onChange={(event) =>
                      setCandidateForm((current) => ({
                        ...current,
                        pmdcStatus: event.target.value as "" | PmdcLicenseStatus,
                      }))
                    }
                  >
                    <option value="">Not recorded</option>
                    <option value="valid">valid</option>
                    <option value="expired">expired</option>
                    <option value="suspended">suspended</option>
                    <option value="unknown">unknown</option>
                  </select>
                </label>
                <label>
                  Validity / expiry
                  <input
                    suppressHydrationWarning
                    type="date"
                    value={candidateForm.validUntil}
                    onChange={(event) =>
                      setCandidateForm((current) => ({
                        ...current,
                        validUntil: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="review-wide">
                  Matching evidence
                  <textarea
                    suppressHydrationWarning
                    value={candidateForm.matchEvidence}
                    onChange={(event) =>
                      setCandidateForm((current) => ({
                        ...current,
                        matchEvidence: event.target.value,
                      }))
                    }
                    placeholder="How the official result was compared with the government record"
                  />
                </label>
                <button type="submit" disabled={busy}>
                  Save untrusted candidate
                </button>
              </form>
            </section>

            <section className="review-card">
              <h3>
                <ClipboardCheck size={18} /> Reviewer decision
              </h3>
              <form className="review-form" onSubmit={saveDecision}>
                <label>
                  Decision
                  <select
                    suppressHydrationWarning
                    value={decisionForm.decision}
                    onChange={(event) =>
                      setDecisionForm((current) => ({
                        ...current,
                        decision: event.target.value as PmdcReviewDecisionName,
                      }))
                    }
                  >
                    {PMDC_REVIEW_DECISIONS.map((decision) => (
                      <option key={decision} value={decision}>
                        {statusLabel(decision)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Candidate result
                  <select
                    suppressHydrationWarning
                    value={decisionForm.candidateId}
                    onChange={(event) =>
                      setDecisionForm((current) => ({
                        ...current,
                        candidateId: event.target.value,
                      }))
                    }
                  >
                    <option value="">None</option>
                    {detail.candidates.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.registrationNumber ?? "No number"} ·{" "}
                        {candidate.practitionerName ?? "unnamed"}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Reviewer
                  <input
                    suppressHydrationWarning
                    value={decisionForm.reviewerLabel}
                    onChange={(event) =>
                      setDecisionForm((current) => ({
                        ...current,
                        reviewerLabel: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="review-wide">
                  Notes
                  <textarea
                    suppressHydrationWarning
                    value={decisionForm.notes}
                    onChange={(event) =>
                      setDecisionForm((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <button type="submit" disabled={busy}>
                  Record decision
                </button>
              </form>
              <p className="review-help">
                <CircleAlert size={16} /> Verified writes trusted PMDC fields.
                Unmatched, ambiguous, needs more information, and rejected do
                not. Government, facility, and Hajj statuses stay unchanged.
              </p>
              <ol className="review-history">
                {detail.decisions.map((decision) => (
                  <li key={decision.id}>
                    <span className={`review-pill ${decision.decision}`}>
                      {statusLabel(decision.decision)}
                    </span>
                    <strong>{decision.reviewerLabel}</strong>
                    <small>{formatDateTime(decision.decidedAt)}</small>
                    <p>{decision.notes}</p>
                    <em>
                      {decision.verificationMethod} · {decision.sourceName}
                    </em>
                  </li>
                ))}
              </ol>
            </section>

            <section className="review-card muted">
              <p>
                <BadgeCheck size={16} /> Public visibility is unchanged. A
                doctor remains hidden until current government employment, a
                valid trusted PMDC match, a verified facility, and Hajj
                attestation are all satisfied.
              </p>
              <p>
                <Building2 size={16} /> Publication status: {detail.publicationStatus}.
                Overall review flag: {statusLabel(detail.overallVerificationStatus)}.
              </p>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
