import { loadEnvConfig } from "@next/env";
import type { WebSocketLikeConstructor } from "@supabase/realtime-js";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import {
  MANUAL_REVIEW_METHOD,
  type PmdcReviewDecisionName,
} from "../src/lib/pmdc-review";
import {
  addPmdcCandidate,
  applyPmdcDecision,
  getPmdcReviewCase,
  listPmdcReviewQueue,
  openPendingPmdcReviewCases,
} from "../src/lib/pmdc-review-repository";

loadEnvConfig(process.cwd());

const seed = process.argv.includes("--seed");
const demo = process.argv.includes("--demo");

const createServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase credentials are not configured.");
  }
  const nodeWebSocket = WebSocket as unknown as WebSocketLikeConstructor;
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: nodeWebSocket },
  });
};

const alreadyHasDecision = (
  decisions: Array<{ decision: string; reviewerLabel: string }>,
  decision: PmdcReviewDecisionName,
) =>
  decisions.some(
    (item) =>
      item.decision === decision && item.reviewerLabel === "pilot-reviewer",
  );

async function runSeed() {
  const supabase = createServiceClient();
  const opened = await openPendingPmdcReviewCases(supabase);
  const queue = await listPmdcReviewQueue(supabase);
  console.log(
    JSON.stringify(
      {
        action: "seed",
        ...opened,
        reviewQueue: queue.length,
      },
      null,
      2,
    ),
  );
}

async function runDemo() {
  const supabase = createServiceClient();
  await openPendingPmdcReviewCases(supabase);
  const queue = await listPmdcReviewQueue(supabase);
  const pending = queue.filter((item) => item.pmdcReviewStatus === "pending_review");

  if (pending.length < 4) {
    throw new Error(
      `Need at least 4 pending PMDC cases for the workflow demo; found ${pending.length}.`,
    );
  }

  const [unmatchedDoctor, ambiguousDoctor, moreInfoDoctor, rejectedDoctor] =
    pending;

  const verifiedAttempt = await applyPmdcDecision(supabase, {
    doctorId: unmatchedDoctor.doctorId,
    decision: "verified",
    reviewerLabel: "pilot-reviewer",
    notes: "Should fail because no candidate or registration number was supplied.",
  })
    .then(() => ({ accepted: true, error: null }))
    .catch((error) => ({
      accepted: false,
      error: error instanceof Error ? error.message : "Unknown rejection",
    }));

  const scenarios: Array<{
    doctorId: string;
    name: string;
    decision: PmdcReviewDecisionName;
    notes: string;
    addNamelessCandidate?: boolean;
  }> = [
    {
      doctorId: unmatchedDoctor.doctorId,
      name: unmatchedDoctor.fullName,
      decision: "unmatched",
      notes:
        "Official pmdc.pk search by full name and father's name did not produce an unambiguous practitioner identity. No registration number was recorded or accepted.",
    },
    {
      doctorId: ambiguousDoctor.doctorId,
      name: ambiguousDoctor.fullName,
      decision: "ambiguous",
      notes:
        "The official public search can return name-similar results without reliable combined father-name filtering. Multiple possible identities remain; no registration number was accepted.",
      addNamelessCandidate: true,
    },
    {
      doctorId: moreInfoDoctor.doctorId,
      name: moreInfoDoctor.fullName,
      decision: "needs_more_information",
      notes:
        "The 2024 seniority list does not include a PMDC number, qualification, or medical college. Manual review needs those identifiers before a unique official match is possible.",
    },
    {
      doctorId: rejectedDoctor.doctorId,
      name: rejectedDoctor.fullName,
      decision: "rejected",
      notes:
        "Rejected as an automated identity match. The unsafe name-search endpoint is not sufficient evidence for a trusted PMDC credential.",
    },
  ];

  const applied = [];
  for (const scenario of scenarios) {
    const detail = await getPmdcReviewCase(supabase, scenario.doctorId);
    if (alreadyHasDecision(detail.decisions, scenario.decision)) {
      applied.push({
        doctorId: scenario.doctorId,
        name: scenario.name,
        decision: scenario.decision,
        skipped: true,
      });
      continue;
    }

    let candidateId: string | undefined;
    if (scenario.addNamelessCandidate && detail.candidates.length === 0) {
      const candidate = await addPmdcCandidate(supabase, scenario.doctorId, {
        practitionerName: scenario.name,
        fatherName: queue.find((item) => item.doctorId === scenario.doctorId)
          ?.fatherName,
        matchEvidence: {
          note: "Name-only official search observation. Registration number omitted because identity was not unique.",
        },
        searchCriteria: {
          fullName: scenario.name,
          combinedFilterReliable: false,
        },
      });
      candidateId = candidate.id;
    }

    await applyPmdcDecision(supabase, {
      doctorId: scenario.doctorId,
      decision: scenario.decision,
      reviewerLabel: "pilot-reviewer",
      notes: scenario.notes,
      candidateId,
      verificationMethod: MANUAL_REVIEW_METHOD,
    });
    applied.push({
      doctorId: scenario.doctorId,
      name: scenario.name,
      decision: scenario.decision,
      skipped: false,
    });
  }

  const remainingPending = (await listPmdcReviewQueue(supabase)).filter(
    (item) => item.pmdcReviewStatus === "pending_review",
  );

  console.log(
    JSON.stringify(
      {
        action: "demo",
        verifiedWithoutNumberRejected: verifiedAttempt,
        decisionsApplied: applied,
        remainingPendingReview: remainingPending.length,
        remainingPendingNames: remainingPending.map((item) => item.fullName),
      },
      null,
      2,
    ),
  );
}

async function run() {
  if (!seed && !demo) {
    throw new Error("Use --seed and/or --demo.");
  }
  if (seed) await runSeed();
  if (demo) await runDemo();
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
