import { useState, useCallback, useMemo } from "react";
import { siteConfig } from "@/config/site";
import {
  buildInquiryBody,
  getWhatsappBaseUrl,
  appendTextToWhatsappUrl,
  buildInquiryMailto,
} from "@/lib/inquiry-brief";
import {
  Send,
  CheckCircle,
  Mail,
  MessageCircle,
  Copy,
} from "lucide-react";

const PROJECT_TYPE_OPTIONS = [
  { value: "landing", label: "Landing page" },
  { value: "mvp", label: "MVP / Web app" },
  { value: "mobile_flutter", label: "Mobile app (Flutter)" },
  { value: "saas", label: "SaaS product" },
  { value: "ai", label: "AI integration" },
  { value: "three_d", label: "3D / interactive web" },
  { value: "shoppos_license", label: "Product licensing (ShopPOS)" },
  { value: "custom", label: "Custom development" },
  { value: "unsure", label: "Not sure yet" },
] as const;

const TIMELINE_OPTIONS = [
  { value: "asap_week", label: "ASAP (this week)" },
  { value: "within_month", label: "Within 1 month" },
  { value: "one_to_three", label: "1–3 months" },
  { value: "three_plus", label: "3+ months / exploring" },
] as const;

const BUDGET_OPTIONS = [
  { value: "under_500", label: "Under $500" },
  { value: "500_2000", label: "$500 – $2,000" },
  { value: "2000_5000", label: "$2,000 – $5,000" },
  { value: "5000_10000", label: "$5,000 – $10,000" },
  { value: "10000_plus", label: "$10,000+" },
  { value: "discuss", label: "Not sure / open to discuss" },
] as const;

type FormData = {
  name: string;
  email: string;
  company: string;
  projectType: string;
  timeline: string;
  budget: string;
  goal: string;
  extras: string;
};

const initialForm: FormData = {
  name: "",
  email: "",
  company: "",
  projectType: "",
  timeline: "",
  budget: "",
  goal: "",
  extras: "",
};

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function InquiryForm() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [transportError, setTransportError] = useState("");
  const [draftCopied, setDraftCopied] = useState(false);

  const waBase = useMemo(() => getWhatsappBaseUrl(), []);

  const projectTypeLabel =
    PROJECT_TYPE_OPTIONS.find((p) => p.value === form.projectType)?.label ||
    "";

  const timelineLabel =
    TIMELINE_OPTIONS.find((t) => t.value === form.timeline)?.label || "";

  const budgetLabel =
    BUDGET_OPTIONS.find((b) => b.value === form.budget)?.label || "";

  const briefInput = useMemo(
    () => ({
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim(),
      projectTypeLabel,
      timelineLabel,
      budgetLabel,
      goal: form.goal,
      extras: form.extras,
    }),
    [
      form.name,
      form.email,
      form.company,
      form.goal,
      form.extras,
      projectTypeLabel,
      timelineLabel,
      budgetLabel,
    ]
  );

  const inquiryBody = useMemo(
    () => buildInquiryBody(briefInput),
    [briefInput]
  );

  const mailtoHref = useMemo(
    () =>
      buildInquiryMailto(
        siteConfig.links.email,
        `AIBuddy inquiry — ${form.name.trim() || "Project"}`,
        inquiryBody
      ),
    [inquiryBody, form.name]
  );

  const whatsappHref = useMemo(() => {
    if (!waBase) return undefined;
    return appendTextToWhatsappUrl(waBase, inquiryBody);
  }, [waBase, inquiryBody]);

  const setField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const isValid =
    form.name.trim().length > 0 &&
    validateEmail(form.email) &&
    form.projectType.length > 0 &&
    form.timeline.length > 0 &&
    form.budget.length > 0 &&
    form.goal.trim().length > 0;

  const runSubmit = async () => {
    setTransportError("");
    setValidationMessage("");
    if (!form.name.trim()) {
      setValidationMessage("Enter your name.");
      return;
    }
    if (!validateEmail(form.email)) {
      setValidationMessage("Enter a valid email address.");
      return;
    }
    if (!form.projectType) {
      setValidationMessage("Select a project type.");
      return;
    }
    if (!form.timeline) {
      setValidationMessage("Select a timeline.");
      return;
    }
    if (!form.budget) {
      setValidationMessage("Select a budget range.");
      return;
    }
    if (!form.goal.trim()) {
      setValidationMessage("Describe what this should accomplish.");
      return;
    }
    setSubmitted(true);
  };

  const handleCopyBrief = async () => {
    if (!isValid) {
      setValidationMessage("Fill all required fields before copying.");
      return;
    }
    try {
      await navigator.clipboard.writeText(inquiryBody);
      setDraftCopied(true);
      setTimeout(() => setDraftCopied(false), 2500);
      setTransportError("");
    } catch {
      setTransportError(
        `Something broke. Email me directly: ${siteConfig.links.email}`
      );
    }
  };

  const contactEmailPhrase = useMemo(() => siteConfig.links.email, []);

  if (submitted) {
    return (
      <section id="inquiry" className="py-16 md:py-24 border-b-[3px] border-black">
        <div className="px-6 md:px-12 lg:px-16 max-w-2xl mx-auto text-center">
          <div className="border-[3px] border-black p-12">
            <CheckCircle size={48} className="mx-auto mb-6 text-[#F9FF00]" />
            <p className="font-inter text-base md:text-lg leading-relaxed text-[#1a1a1a] mb-6">
              Got it. I&apos;ll respond within 24 hours.
            </p>
            <p className="font-inter text-xs text-[#1a1a1a]/60 mb-8">
              Send this brief by WhatsApp or email (same outline), or copy the
              text — no account needed.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-brutal btn-brutal-yellow inline-flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </a>
              ) : null}
              <a
                href={mailtoHref}
                className="btn-brutal btn-brutal-black inline-flex items-center justify-center gap-2"
              >
                <Mail size={18} />
                Email
              </a>
              <button
                type="button"
                onClick={() => void handleCopyBrief()}
                className="btn-brutal flex items-center justify-center gap-2 border-[3px] border-black bg-white"
              >
                <Copy size={18} />
                Copy brief
              </button>
            </div>
            {transportError ? (
              <p className="font-inter text-sm text-[#FF0004] mt-6">
                {transportError}
              </p>
            ) : null}
            <div className="mt-8">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setForm(initialForm);
                  setTransportError("");
                }}
                className="font-oswald text-xs font-bold uppercase tracking-widest underline"
              >
                New inquiry
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="inquiry" className="border-b-[3px] border-black">
      <div className="border-b-[3px] border-black px-6 md:px-12 lg:px-16 py-12">
        <span className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#FF0004] block mb-2">
          Start a project
        </span>
        <h2 className="font-oswald text-4xl md:text-6xl font-bold uppercase tracking-[-0.03em]">
          INQUIRY
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-3 border-r-[3px] border-black border-b-[3px] lg:border-b-0 px-6 md:px-8 py-8 bg-[#fafafa]">
          <h3 className="font-oswald text-lg font-bold uppercase tracking-tight mb-4">
            Instructions
          </h3>
          <p className="font-inter text-xs leading-relaxed text-[#1a1a1a]/70 mb-6">
            Fill the required fields. On submit, we generate a clean brief you can
            send by email or WhatsApp (or just copy/paste).
          </p>

          <div className="border-[3px] border-black p-4 bg-white">
            <h4 className="font-oswald text-xs font-bold uppercase tracking-widest mb-2">
              Need help?
            </h4>
            <p className="font-inter text-[11px] leading-relaxed text-[#1a1a1a]/60">
              Use the chat widget, email {siteConfig.links.email}, or send the
              brief from WhatsApp or email using the buttons after submit.
            </p>
          </div>
        </div>

        <div className="lg:col-span-6 border-r-[3px] border-black px-6 md:px-10 py-8">
          <div className="mb-6 bg-[#F9FF00] border-[3px] border-black p-4">
            <p className="font-inter text-sm">
              <strong className="font-oswald uppercase">Note:</strong> No
              account needed — after submit use WhatsApp, email, or copy the
              brief. If your project doesn&apos;t match the categories, pick the
              closest one and explain it — we&apos;ll scope it with you.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
                Name *
              </label>
              <input
                type="text"
                autoComplete="name"
                className="input-brutal"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
              />
            </div>

            <div>
              <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
                Email *
              </label>
              <input
                type="email"
                autoComplete="email"
                className="input-brutal"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
              />
            </div>

            <div>
              <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
                Company / role
              </label>
              <input
                type="text"
                className="input-brutal"
                placeholder="(optional)"
                value={form.company}
                onChange={(e) => setField("company", e.target.value)}
              />
            </div>

            <div>
              <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
                Project type *
              </label>
              <select
                className="input-brutal w-full bg-white appearance-none cursor-pointer pr-10"
                value={form.projectType}
                onChange={(e) => setField("projectType", e.target.value)}
                aria-required
              >
                <option value="">Select…</option>
                {PROJECT_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
                Timeline *
              </label>
              <select
                className="input-brutal w-full bg-white appearance-none cursor-pointer pr-10"
                value={form.timeline}
                onChange={(e) => setField("timeline", e.target.value)}
                aria-required
              >
                <option value="">Select…</option>
                {TIMELINE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
                Budget range *
              </label>
              <select
                className="input-brutal w-full bg-white appearance-none cursor-pointer pr-10"
                value={form.budget}
                onChange={(e) => setField("budget", e.target.value)}
                aria-required
              >
                <option value="">Select…</option>
                {BUDGET_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
                Project goal *
              </label>
              <textarea
                className="input-brutal min-h-[4.5rem] resize-none"
                rows={3}
                placeholder="What should this thing accomplish?"
                value={form.goal}
                onChange={(e) => setField("goal", e.target.value)}
              />
            </div>

            <div>
              <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
                Anything else?
              </label>
              <textarea
                className="input-brutal min-h-[4.5rem] resize-none"
                rows={3}
                placeholder="Links, references, sketches, constraints..."
                value={form.extras}
                onChange={(e) => setField("extras", e.target.value)}
              />
            </div>
          </div>

          {validationMessage ? (
            <p className="font-inter text-sm text-[#FF0004] mt-6">
              {validationMessage}
            </p>
          ) : null}
          {!validationMessage ? (
            transportError ? (
              <p className="font-inter text-sm text-[#FF0004] mt-6">
                {transportError}
              </p>
            ) : null
          ) : null}

          <div className="flex flex-wrap items-center justify-between mt-8 gap-3">
            <button
              type="button"
              onClick={() => void handleCopyBrief()}
              disabled={!isValid}
              className={`btn-brutal flex items-center gap-2 bg-white border-[3px] border-black ${
                !isValid ? "opacity-30 cursor-not-allowed" : ""
              }`}
            >
              <Copy size={16} />
              {draftCopied ? "Copied" : "Copy brief"}
            </button>
            <button
              type="button"
              onClick={() => void runSubmit()}
              disabled={!isValid}
              className={`btn-brutal flex items-center gap-2 ${
                isValid ? "btn-brutal-yellow" : "opacity-30 cursor-not-allowed"
              }`}
            >
              <Send size={16} />
              Send inquiry&nbsp;→
            </button>
          </div>

          {!isValid ? (
            <p className="font-inter text-[11px] text-[#1a1a1a]/50 mt-3">
              If anything fails technically, email{" "}
              <a
                href={`mailto:${contactEmailPhrase}`}
                className="underline font-medium"
              >
                {contactEmailPhrase}
              </a>
              .
            </p>
          ) : null}
        </div>

        <div className="lg:col-span-3 px-6 md:px-8 py-8 bg-[#1a1a1a] text-white">
          <div className="mb-8">
            <h4 className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#F9FF00] mb-3">
              Typical timeline
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#F9FF00] text-black flex items-center justify-center font-oswald text-xs font-bold flex-shrink-0">
                  24h
                </div>
                <div>
                  <p className="font-inter text-xs font-medium">First reply</p>
                  <p className="font-inter text-[10px] text-white/50">
                    We confirm fit and next questions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#FF0004] text-white flex items-center justify-center font-oswald text-xs font-bold flex-shrink-0">
                  48h
                </div>
                <div>
                  <p className="font-inter text-xs font-medium">Estimate</p>
                  <p className="font-inter text-[10px] text-white/50">
                    Rough scope, options, and timeline
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-oswald text-xs font-bold flex-shrink-0">
                  7d
                </div>
                <div>
                  <p className="font-inter text-xs font-medium">Kickoff</p>
                  <p className="font-inter text-[10px] text-white/50">
                    When you are ready to align on a plan
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-6">
            <h4 className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#F9FF00] mb-3">
              Contact
            </h4>
            <p className="font-inter text-xs text-white/70 leading-relaxed">
              {siteConfig.links.email}
              <br />
              {siteConfig.domain}
            </p>
            {waBase ? (
              <a
                href={waBase}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex font-oswald text-xs font-bold uppercase tracking-wider text-[#F9FF00] underline"
              >
                WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
