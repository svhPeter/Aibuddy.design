import { useCallback, useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { ArrowLeftRight, Loader2 } from "lucide-react";

const API = "https://api.frankfurter.dev/v1";

type CurrenciesRes = Record<string, string>;

type LatestRes = {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
};

/**
 * Free ECB-backed rates via Frankfurter (https://www.frankfurter.app/) — public, no key, CORS-enabled.
 * Good for “currency converter” search traffic; rates are for informational use.
 */
export function CurrencyConverter() {
  const [currencies, setCurrencies] = useState<Record<string, string>>({});
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [amount, setAmount] = useState("100");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    value: number;
    date: string;
    from: string;
    to: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingCurrencies(true);
      try {
        const res = await fetch(`${API}/currencies`);
        if (!res.ok) throw new Error("Failed to load currencies");
        const data: CurrenciesRes = await res.json();
        if (!cancelled) setCurrencies(data);
      } catch {
        if (!cancelled) {
          setCurrencies(fallbackCurrencies);
        }
      } finally {
        if (!cancelled) setLoadingCurrencies(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const convert = useCallback(async () => {
    setError(null);
    const n = parseFloat(String(amount).replace(/,/g, "."));
    if (Number.isNaN(n) || n < 0) {
      setError("Enter a valid amount (0 or more).");
      setResult(null);
      return;
    }
    if (from === to) {
      setResult({ value: n, date: new Date().toISOString().slice(0, 10), from, to });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const params = new URLSearchParams({
        from,
        to,
        amount: String(n),
      });
      const res = await fetch(`${API}/latest?${params.toString()}`);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Conversion failed");
      }
      const data: LatestRes = await res.json();
      const key = to;
      const v = data.rates[key];
      if (v === undefined) {
        throw new Error("No rate for this pair.");
      }
      setResult({
        value: v,
        date: data.date,
        from: data.base,
        to: key,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [amount, from, to]);

  const codes = Object.keys(currencies).sort();
  const swap = () => {
    setFrom(to);
    setTo(from);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <p className="font-inter text-sm text-[#1a1a1a]/70 leading-relaxed">
        Live <strong>official ECB reference rates</strong> via the         open{" "}
        <a
          className="underline font-semibold"
          href="https://frankfurter.dev/v1/"
          target="_blank"
          rel="noreferrer"
        >
          Frankfurter
        </a>{" "}
        API — <strong>no sign-up, no API key</strong>, runs in your browser. Share the
        link:{" "}
        <a
          className="underline font-semibold"
          href="https://aibuddy.design/tools/currency-converter"
        >
          aibuddy.design/tools/currency-converter
        </a>
        .
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2"
            htmlFor="cc-from"
          >
            From
          </label>
          <select
            id="cc-from"
            className="input-brutal w-full"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setResult(null);
            }}
            disabled={loadingCurrencies}
          >
            {loadingCurrencies ? (
              <option>Loading…</option>
            ) : (
              codes.map((c) => (
                <option key={c} value={c}>
                  {c} — {currencies[c]}
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <label
            className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2"
            htmlFor="cc-to"
          >
            To
          </label>
          <select
            id="cc-to"
            className="input-brutal w-full"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setResult(null);
            }}
            disabled={loadingCurrencies}
          >
            {loadingCurrencies ? (
              <option>Loading…</option>
            ) : (
              codes.map((c) => (
                <option key={c} value={c}>
                  {c} — {currencies[c]}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="flex-1">
          <label
            className="font-oswald text-xs font-bold uppercase tracking-widest block mb-2"
            htmlFor="cc-amount"
          >
            Amount
          </label>
          <input
            id="cc-amount"
            type="text"
            inputMode="decimal"
            className="input-brutal w-full"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setResult(null);
            }}
            placeholder="e.g. 100"
          />
        </div>
        <button
          type="button"
          onClick={swap}
          className="btn-brutal border-[3px] border-black bg-white px-4 flex items-center justify-center gap-2 h-[48px] shrink-0"
          title="Swap currencies"
        >
          <ArrowLeftRight size={18} />
        </button>
        <button
          type="button"
          onClick={() => void convert()}
          disabled={loading || loadingCurrencies}
          className="btn-brutal btn-brutal-yellow px-6 h-[48px] min-w-[140px]"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              Converting
            </span>
          ) : (
            "Convert"
          )}
        </button>
      </div>

      {error ? (
        <p className="font-inter text-sm text-[#FF0004] border-[3px] border-black p-3 bg-white">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="border-[3px] border-black p-5 bg-[#F9FF00]">
          <p className="font-oswald text-xs font-bold uppercase tracking-widest text-black/60 mb-1">
            Result · ECB date {result.date}
          </p>
          <p className="font-oswald text-2xl md:text-3xl font-bold uppercase tracking-tight">
            {result.value.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}{" "}
            <span className="text-lg">{result.to}</span>
          </p>
          <p className="font-inter text-xs text-black/50 mt-2">
            {amount} {result.from} → {result.to} (reference rate, not a trading
            offer). Questions:{" "}
            <a className="underline font-medium" href={`mailto:${siteConfig.links.email}`}>
              {siteConfig.links.email}
            </a>
          </p>
        </div>
      ) : null}
    </div>
  );
}

const fallbackCurrencies: Record<string, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  JPY: "Japanese Yen",
  CHF: "Swiss Franc",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  INR: "Indian Rupee",
  PKR: "Pakistani Rupee",
  AED: "UAE Dirham",
  SAR: "Saudi Riyal",
};
