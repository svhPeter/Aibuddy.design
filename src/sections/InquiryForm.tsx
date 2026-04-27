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
  Save,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  ImagePlus,
  X,
  Mail,
  MessageCircle,
  Copy,
} from "lucide-react";

const projectTypes = [
  { value: "web", label: "WEB & PRODUCT" },
  { value: "mobile", label: "MOBILE" },
  { value: "ai", label: "AI & AUTOMATION" },
  { value: "design", label: "DESIGN & UX" },
  { value: "infra", label: "DEVOPS & INFRA" },
  { value: "other", label: "OTHER" },
] as const;

const budgetRanges = [
  { value: "under5k", label: "UNDER $5,000" },
  { value: "5to10k", label: "$5,000 — $10,000" },
  { value: "10to25k", label: "$10,000 — $25,000" },
  { value: "25to50k", label: "$25,000 — $50,000" },
  { value: "over50k", label: "OVER $50,000" },
  { value: "undisclosed", label: "PREFER NOT TO SAY" },
] as const;

const rightsOptions = [
  { value: "project", label: "PROJECT-BASED" },
  { value: "retainer", label: "RETAINER / ONGOING" },
  { value: "license", label: "LICENSE & IP" },
  { value: "workForHire", label: "WORK FOR HIRE" },
  { value: "toBeDiscussed", label: "TO BE DISCUSSED" },
] as const;

const deliverableOptions = [
  "UI / design system",
  "Web frontend",
  "Mobile app",
  "API / backend",
  "AI integration",
  "DevOps & hosting",
  "Strategy / copy",
] as const;

type FormData = {
  title: string;
  projectType: string;
  description: string;
  deliverables: string[];
  deadline: string;
  budget: string;
  rightsUsage: string;
  visualReferences: string[];
};

const initialForm: FormData = {
  title: "",
  projectType: "",
  description: "",
  deliverables: [],
  deadline: "",
  budget: "undisclosed",
  rightsUsage: "toBeDiscussed",
  visualReferences: [],
};

export function InquiryForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [refInput, setRefInput] = useState("");
  const [draftCopied, setDraftCopied] = useState(false);

  const waBase = useMemo(() => getWhatsappBaseUrl(), []);

  const briefInput = useMemo(
    () => ({
      title: form.title,
      projectTypeLabel:
        projectTypes.find((p) => p.value === form.projectType)?.label || "—",
      description: form.description,
      deliverables: form.deliverables,
      deadline: form.deadline,
      budgetLabel:
        budgetRanges.find((b) => b.value === form.budget)?.label || "—",
      rightsLabel:
        rightsOptions.find((r) => r.value === form.rightsUsage)?.label || "—",
      visualReferences: form.visualReferences,
    }),
    [form]
  );

  const inquiryBody = useMemo(
    () => buildInquiryBody(briefInput),
    [briefInput]
  );

  const mailtoHref = useMemo(
    () =>
      buildInquiryMailto(
        siteConfig.links.email,
        `AIBuddy inquiry: ${form.title || "New project"}`,
        inquiryBody
      ),
    [inquiryBody, form.title]
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

  const toggleDeliverable = (d: string) => {
    setForm((prev) => ({
      ...prev,
      deliverables: prev.deliverables.includes(d)
        ? prev.deliverables.filter((x) => x !== d)
        : [...prev.deliverables, d],
    }));
  };

  const addReference = () => {
    if (refInput.trim()) {
      setForm((prev) => ({
        ...prev,
        visualReferences: [...prev.visualReferences, refInput.trim()],
      }));
      setRefInput("");
    }
  };

  const removeReference = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      visualReferences: prev.visualReferences.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = () => {
    if (!form.title || !form.projectType) return;
    setSubmitted(true);
  };

  const handleCopyBrief = async () => {
    try {
      await navigator.clipboard.writeText(inquiryBody);
    } catch {
      return;
    }
  };

  const handleSaveDraft = () => {
    if (!form.title) return;
    void (async () => {
      try {
        await navigator.clipboard.writeText(inquiryBody);
        setDraftCopied(true);
        setTimeout(() => setDraftCopied(false), 2500);
      } catch {
        // ignore
      }
    })();
  };

  if (submitted) {
    return (
      <section id="inquiry" className="py-16 md:py-24 border-b-[3px] border-black">
        <div className="px-6 md:px-12 lg:px-16 max-w-2xl mx-auto text-center">
          <div className="border-[3px] border-black p-12">
            <CheckCircle size={48} className="mx-auto mb-6 text-[#F9FF00]" />
            <h3 className="font-oswald text-3xl md:text-4xl font-bold uppercase tracking-[-0.02em] mb-4">
              BRIEF READY
            </h3>
            <p className="font-inter text-sm leading-relaxed text-[#1a1a1a]/70 mb-8">
              Send the same project brief through WhatsApp or email — or copy
              the text. No account is required. We will reply at{" "}
              <a
                className="underline font-semibold"
                href={`mailto:${siteConfig.links.email}`}
              >
                {siteConfig.links.email}
              </a>
              .
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
                  WHATSAPP
                </a>
              ) : null}
              <a
                href={mailtoHref}
                className="btn-brutal btn-brutal-black inline-flex items-center justify-center gap-2"
              >
                <Mail size={18} />
                EMAIL
              </a>
              <button
                type="button"
                onClick={() => void handleCopyBrief()}
                className="btn-brutal flex items-center justify-center gap-2 border-[3px] border-black bg-white"
              >
                <Copy size={18} />
                COPY BRIEF
              </button>
            </div>
            <div className="mt-8">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setForm(initialForm);
                  setStep(0);
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

  const steps = [
    { label: "PROJECT", num: 0 },
    { label: "DETAILS", num: 1 },
    { label: "BUDGET", num: 2 },
    { label: "REVIEW", num: 3 },
  ];

  const canAdvance =
    form.title.trim().length > 0 && form.projectType.length > 0;
  const saveOrCopyEnabled = canAdvance;

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
            INSTRUCTIONS
          </h3>
          <p className="font-inter text-xs leading-relaxed text-[#1a1a1a]/70 mb-6">
            Work through the steps, then on submit we will prepare your brief for
            WhatsApp and email. You can also copy the brief to your clipboard at
            any time after the project title and type are set.
          </p>

          <div className="space-y-0">
            {steps.map((s) => (
              <button
                type="button"
                key={s.num}
                onClick={() => setStep(s.num)}
                className={`w-full text-left px-4 py-3 border-[3px] border-black mb-[-3px] relative transition-colors ${
                  step === s.num
                    ? "bg-[#F9FF00] z-10"
                    : step > s.num
                    ? "bg-[#1a1a1a] text-white"
                    : "bg-white hover:bg-[#F9FF00]/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-oswald text-sm font-bold uppercase tracking-wider">
                    {s.label}
                  </span>
                  {step > s.num && <CheckCircle size={14} />}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 border-[3px] border-black p-4 bg-white">
            <h4 className="font-oswald text-xs font-bold uppercase tracking-widest mb-2">
              NEED HELP?
            </h4>
            <p className="font-inter text-[11px] leading-relaxed text-[#1a1a1a]/60">
              Use the chat widget, email {siteConfig.links.email}, or finish the
              form and send the brief on WhatsApp or by email in the last step.
            </p>
          </div>
        </div>

        <div className="lg:col-span-6 border-r-[3px] border-black px-6 md:px-10 py-8">
          <div className="mb-6 bg-[#F9FF00] border-[3px] border-black p-4">
            <p className="font-inter text-sm">
              <strong className="font-oswald uppercase">Note:</strong> No
              account needed — use WhatsApp or email from the last step, or copy
              the brief.
            </p>
          </div>

          {step === 0 && (
            <div className="space-y-6">
              <div>
                <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
                  Project title *
                </label>
                <input
                  type="text"
                  className="input-brutal"
                  placeholder="e.g. Customer portal MVP, AI support workflow"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                />
              </div>

              <div>
                <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
                  Project type *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-0 border-[3px] border-black">
                  {projectTypes.map((pt) => (
                    <button
                      type="button"
                      key={pt.value}
                      onClick={() => setField("projectType", pt.value)}
                      className={`px-3 py-3 font-oswald text-xs font-bold uppercase tracking-wider border-[3px] border-black m-[-1.5px] relative transition-colors ${
                        form.projectType === pt.value
                          ? "bg-[#F9FF00] z-10"
                          : "bg-white hover:bg-[#F9FF00]/30"
                      }`}
                    >
                      {pt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
                  Project description
                </label>
                <textarea
                  className="input-brutal min-h-[120px] resize-none"
                  placeholder="Goals, users, integrations, and constraints…"
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
                  Deliverables
                </label>
                <div className="flex flex-wrap gap-2">
                  {deliverableOptions.map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => toggleDeliverable(d)}
                      className={`px-3 py-2 font-inter text-xs border-[3px] border-black transition-colors ${
                        form.deliverables.includes(d)
                          ? "bg-[#1a1a1a] text-white"
                          : "bg-white hover:bg-[#F9FF00]"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
                  Target deadline
                </label>
                <input
                  type="date"
                  className="input-brutal"
                  value={form.deadline}
                  onChange={(e) => setField("deadline", e.target.value)}
                />
              </div>

              <div>
                <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
                  Links &amp; references
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    className="input-brutal flex-1"
                    placeholder="Figma, repo, or doc URL…"
                    value={refInput}
                    onChange={(e) => setRefInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addReference()}
                  />
                  <button
                    type="button"
                    onClick={addReference}
                    className="btn-brutal btn-brutal-black px-4"
                  >
                    <ImagePlus size={18} />
                  </button>
                </div>
                {form.visualReferences.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.visualReferences.map((ref, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1 bg-[#fafafa] border-[3px] border-black px-2 py-1"
                      >
                        <span className="font-inter text-[10px] truncate max-w-[200px]">
                          {ref}
                        </span>
                        <button type="button" onClick={() => removeReference(i)}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
                  Budget range
                </label>
                <div className="space-y-0 border-[3px] border-black">
                  {budgetRanges.map((br) => (
                    <button
                      type="button"
                      key={br.value}
                      onClick={() => setField("budget", br.value)}
                      className={`w-full text-left px-4 py-3 border-b-[3px] border-black last:border-b-0 font-oswald text-sm uppercase tracking-wider transition-colors ${
                        form.budget === br.value
                          ? "bg-[#F9FF00]"
                          : "bg-white hover:bg-[#F9FF00]/30"
                      }`}
                    >
                      {br.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
                  Engagement / terms
                </label>
                <div className="grid grid-cols-1 gap-0 border-[3px] border-black">
                  {rightsOptions.map((ro) => (
                    <button
                      type="button"
                      key={ro.value}
                      onClick={() => setField("rightsUsage", ro.value)}
                      className={`text-left px-4 py-3 border-b-[3px] border-black last:border-b-0 font-oswald text-sm uppercase tracking-wider transition-colors ${
                        form.rightsUsage === ro.value
                          ? "bg-[#1a1a1a] text-white"
                          : "bg-white hover:bg-[#1a1a1a]/5"
                      }`}
                    >
                      {ro.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-oswald text-xl font-bold uppercase tracking-tight mb-4">
                Review your inquiry
              </h3>
              <div className="border-[3px] border-black">
                <ReviewRow label="Title" value={form.title} />
                <ReviewRow
                  label="Type"
                  value={
                    projectTypes.find((p) => p.value === form.projectType)
                      ?.label || "—"
                  }
                />
                <ReviewRow
                  label="Description"
                  value={form.description || "—"}
                />
                <ReviewRow
                  label="Deliverables"
                  value={
                    form.deliverables.length > 0
                      ? form.deliverables.join(", ")
                      : "—"
                  }
                />
                <ReviewRow label="Deadline" value={form.deadline || "—"} />
                <ReviewRow
                  label="Budget"
                  value={
                    budgetRanges.find((b) => b.value === form.budget)?.label ||
                    "—"
                  }
                />
                <ReviewRow
                  label="Engagement"
                  value={
                    rightsOptions.find((r) => r.value === form.rightsUsage)
                      ?.label || "—"
                  }
                />
                <ReviewRow
                  label="Links"
                  value={
                    form.visualReferences.length > 0
                      ? `${form.visualReferences.length} link(s)`
                      : "—"
                  }
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className={`btn-brutal flex items-center gap-2 ${
                step === 0
                  ? "opacity-30 cursor-not-allowed"
                  : "btn-brutal-black"
              }`}
            >
              <ArrowLeft size={16} />
              BACK
            </button>

            <div className="flex gap-3">
              {step < 3 && (
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={!saveOrCopyEnabled}
                  className="btn-brutal flex items-center gap-2 bg-white border-[3px] border-black"
                >
                  <Save size={16} />
                  {draftCopied ? "COPIED" : "COPY BRIEF"}
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!canAdvance) return;
                    setStep(step + 1);
                  }}
                  disabled={!canAdvance}
                  className={`btn-brutal flex items-center gap-2 ${
                    canAdvance
                      ? "btn-brutal-yellow"
                      : "opacity-30 cursor-not-allowed"
                  }`}
                >
                  NEXT
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canAdvance}
                  className={`btn-brutal flex items-center gap-2 ${
                    canAdvance
                      ? "btn-brutal-yellow"
                      : "opacity-30 cursor-not-allowed"
                  }`}
                >
                  <Send size={16} />
                  SUBMIT
                </button>
              )}
            </div>
          </div>
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

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex border-b-[3px] border-black last:border-b-0">
      <div className="w-1/3 px-4 py-3 bg-[#fafafa] border-r-[3px] border-black">
        <span className="font-oswald text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/50">
          {label}
        </span>
      </div>
      <div className="w-2/3 px-4 py-3">
        <span className="font-inter text-sm">{value}</span>
      </div>
    </div>
  );
}
