import type { Metadata } from "next";
import { ReviewConsole } from "./review-console";

export const metadata: Metadata = {
  title: "Doctor review queue — Sehat Directory",
  robots: { index: false, follow: false },
};

export default function ReviewPage() {
  return <ReviewConsole />;
}
