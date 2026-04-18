import type { Metadata } from "next";

import { RealEstateDemoPageContent } from "@/components/demos/real-estate/real-estate-demo-page";

export const metadata: Metadata = {
  title: "Real estate demo",
  description:
    "Demonstration brokerage UI — fictional listings. Sample experience for buyer questions and lead capture.",
  robots: { index: true, follow: true },
};

export default function RealEstateDemoPage() {
  return <RealEstateDemoPageContent />;
}
