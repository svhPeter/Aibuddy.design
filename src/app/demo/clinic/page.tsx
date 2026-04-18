import type { Metadata } from "next";

import { ClinicDemoPageContent } from "@/components/demos/clinic/clinic-demo-page";

export const metadata: Metadata = {
  title: "Clinic demo",
  description:
    "Demonstration healthcare microsite — not a real clinic. Sample UI for outreach: intake patterns and scripted assistant.",
  robots: { index: true, follow: true },
};

export default function ClinicDemoPage() {
  return <ClinicDemoPageContent />;
}
