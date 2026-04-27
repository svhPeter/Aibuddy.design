import { useState, useCallback } from "react";
import { siteConfig } from "@/config/site";
import {
  Send,
  Save,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  ImagePlus,
  X,
} from "lucide-react";

const projectTypes = [
  { value: "web", label: "WEB DEVELOPMENT" },
  { value: "mobile", label: "MOBILE APPS" },
  { value: "ai", label: "AI INTEGRATION" },
  { value: "automation", label: "AUTOMATION" },
  { value: "design", label: "UI/UX DESIGN" },
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
  { value: "oneTime", label: "ONE-TIME USE" },
  { value: "limited", label: "LIMITED LICENSE" },
  { value: "exclusive", label: "EXCLUSIVE LICENSE" },
  { value: "fullBuyout", label: "FULL BUYOUT" },
  { value: "toBeDiscussed", label: "TO BE DISCUSSED" },
] as const;

const deliverableOptions = [
  "Landing Page / Marketing Site",
  "Web App (Dashboard / Admin)",
  "Mobile App (iOS / Android)",
  "API / Backend",
  "AI Feature (Chat / Gen / Vision)",
  "Automation / Integrations",
  "Performance / SEO",
  "Maintenance / Iteration",
];

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

  const handleSaveDraft = () => {
    if (!form.title || !form.projectType) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section id="inquiry" className="py-16 md:py-24 border-b-[3px] border-black">
        <div className="px-6 md:px-12 lg:px-16 max-w-2xl mx-auto text-center">
          <div className="border-[3px] border-black p-12">
            <CheckCircle size={48} className="mx-auto mb-6 text-[#F9FF00]" />
            <h3 className="font-oswald text-3xl md:text-4xl font-bold uppercase tracking-[-0.02em] mb-4">
              INQUIRY RECEIVED
            </h3>
            <p className="font-inter text-sm leading-relaxed text-[#1a1a1a]/70 mb-8">
              Thanks — we received your inquiry. We’ll reply by email with next
              steps (typically within 48 hours).
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href={`mailto:${siteConfig.links.email}?subject=${encodeURIComponent(
                  `Project inquiry: ${form.title}`,
                )}`}
                className="btn-brutal btn-brutal-yellow"
              >
                EMAIL DETAILS
              </a>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm(initialForm);
                  setStep(0);
                }}
                className="btn-brutal btn-brutal-black"
              >
                NEW REQUEST
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

  return (
    <section id="inquiry" className="border-b-[3px] border-black">
      {/* Section Header */}
      <div className="border-b-[3px] border-black px-6 md:px-12 lg:px-16 py-12">
        <span className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#FF0004] block mb-2">
          Start a Project
        </span>
        <h2 className="font-oswald text-4xl md:text-6xl font-bold uppercase tracking-[-0.03em]">
          INQUIRY
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column - Instructions */}
        <div className="lg:col-span-3 border-r-[3px] border-black border-b-[3px] lg:border-b-0 px-6 md:px-8 py-8 bg-[#fafafa]">
          <h3 className="font-oswald text-lg font-bold uppercase tracking-tight mb-4">
            INSTRUCTIONS
          </h3>
          <p className="font-inter text-xs leading-relaxed text-[#1a1a1a]/70 mb-6">
            Share what you want to build. We’ll respond with a scoped plan,
            timeline, and estimate.
          </p>

          {/* Step indicator */}
          <div className="space-y-0">
            {steps.map((s) => (
              <button
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
              Use the chat widget in the bottom right corner to ask questions
              about the commission process.
            </p>
          </div>
        </div>

        {/* Middle Column - Form */}
        <div className="lg:col-span-6 border-r-[3px] border-black px-6 md:px-10 py-8">

          {/* Step 1: Project */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  className="input-brutal"
                  placeholder="e.g., SaaS dashboard + billing + admin"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                />
              </div>

              <div>
                <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
                  Project Type *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-0 border-[3px] border-black">
                  {projectTypes.map((pt) => (
                    <button
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
                  Project Description
                </label>
                <textarea
                  className="input-brutal min-h-[120px] resize-none"
                  placeholder="Describe the product, users, and what success looks like..."
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
                  Deliverables
                </label>
                <div className="flex flex-wrap gap-2">
                  {deliverableOptions.map((d) => (
                    <button
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
                  Target Deadline
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
                  Visual References
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    className="input-brutal flex-1"
                    placeholder="Paste image URL..."
                    value={refInput}
                    onChange={(e) => setRefInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addReference()}
                  />
                  <button
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
                        <button onClick={() => removeReference(i)}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Budget */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2">
                  Budget Range
                </label>
                <div className="space-y-0 border-[3px] border-black">
                  {budgetRanges.map((br) => (
                    <button
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
                  Rights Usage
                </label>
                <div className="grid grid-cols-1 gap-0 border-[3px] border-black">
                  {rightsOptions.map((ro) => (
                    <button
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

          {/* Step 4: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-oswald text-xl font-bold uppercase tracking-tight mb-4">
                REVIEW YOUR INQUIRY
              </h3>
              <div className="border-[3px] border-black">
                <ReviewRow label="Title" value={form.title} />
                <ReviewRow
                  label="Type"
                  value={
                    projectTypes.find((p) => p.value === form.projectType)
                      ?.label || ""
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
                    ""
                  }
                />
                <ReviewRow
                  label="Rights"
                  value={
                    rightsOptions.find((r) => r.value === form.rightsUsage)
                      ?.label || ""
                  }
                />
                <ReviewRow
                  label="References"
                  value={
                    form.visualReferences.length > 0
                      ? `${form.visualReferences.length} reference(s)`
                      : "—"
                  }
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
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
                  onClick={handleSaveDraft}
                  disabled={!form.title}
                  className="btn-brutal flex items-center gap-2 bg-white border-[3px] border-black"
                >
                  <Save size={16} />
                  SAVE
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="btn-brutal btn-brutal-yellow flex items-center gap-2"
                >
                  NEXT
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={false}
                  className="btn-brutal btn-brutal-yellow flex items-center gap-2"
                >
                  <Send size={16} />
                  SUBMIT INQUIRY
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Decorative / Info */}
        <div className="lg:col-span-3 px-6 md:px-8 py-8 bg-[#1a1a1a] text-white">
          <div className="mb-8">
            <h4 className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#F9FF00] mb-3">
              Typical Timeline
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#F9FF00] text-black flex items-center justify-center font-oswald text-xs font-bold flex-shrink-0">
                  24h
                </div>
                <div>
                  <p className="font-inter text-xs font-medium">
                    Initial Response
                  </p>
                  <p className="font-inter text-[10px] text-white/50">
                    Review + clarifying questions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#FF0004] text-white flex items-center justify-center font-oswald text-xs font-bold flex-shrink-0">
                  48h
                </div>
                <div>
                  <p className="font-inter text-xs font-medium">
                    Scope + Estimate
                  </p>
                  <p className="font-inter text-[10px] text-white/50">
                    Plan, timeline, and cost
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-oswald text-xs font-bold flex-shrink-0">
                  7d
                </div>
                <div>
                  <p className="font-inter text-xs font-medium">
                    First Delivery
                  </p>
                  <p className="font-inter text-[10px] text-white/50">
                    Working build or prototype
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
