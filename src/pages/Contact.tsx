import SimplePage from "./SimplePage";
import { siteConfig } from "@/config/site";

export default function Contact() {
  return (
    <SimplePage
      eyebrow="Contact"
      title="LET’S TALK"
      body={`Email: ${siteConfig.links.email} — quick replies, scope-first conversation.`}
    />
  );
}

