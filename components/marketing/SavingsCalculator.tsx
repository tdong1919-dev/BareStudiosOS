"use client";
/**
 * SavingsCalculator — two-tab ROI tool for the salon landing page.
 *   Tab 1 (Fee savings): credit-card processing fees today vs. with ACH wallets.
 *   Tab 2 (Revenue lift): extra-visit revenue from retention + breakage − promo cost.
 * A "Total annual revenue" anchor card sits above the tabs so every other figure
 * can be read against the salon's overall revenue. Conservative on purpose:
 * wallet bonus credit is costed at full face value.
 */
import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList,
} from "recharts";

const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

const INK = "#161615";
const CLAY = "#B05B49";
const SAGE = "#4B7A63";
const SAGE_LIGHT = "#7BA890";
const GOLD = "#9A7B4F";
const MUTED = "#A39A8D";
const LABEL = "#6E665C";

function Slider({
  label, value, suffix, min, max, step, onChange,
}: {
  label: string; value: number; suffix: string; min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm text-text-secondary mb-1.5">
        <span>{label}</span>
        <span className="font-medium text-text-primary">{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[#161615]"
      />
    </div>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "danger" | "success" | "gold" }) {
  const color =
    tone === "danger" ? "text-error" : tone === "success" ? "text-success" : tone === "gold" ? "text-[#9A7B4F]" : "text-text-primary";
  return (
    <div className="rounded-lg bg-surface-elevated px-4 py-3">
      <p className="text-xs text-text-secondary mb-1">{label}</p>
      <p className={`text-xl font-medium m-0 ${color}`}>{value}</p>
    </div>
  );
}

const tooltipStyle = { background: "#FFFFFF", border: "1px solid #E6E0D6", borderRadius: 8, color: "#1A1815" };

export default function SavingsCalculator() {
  const [mounted, setMounted] = useState(false);
  const [cli, setCli] = useState(200);
  const [tic, setTic] = useState(75);
  const [vis, setVis] = useState(12);
  const [rate, setRate] = useState(2.9);
  const [adopt, setAdopt] = useState(60);
  const [freq, setFreq] = useState(15);
  const [bonus, setBonus] = useState(10);
  const [brk, setBrk] = useState(4);
  const [tab, setTab] = useState<"fees" | "rev">("fees");

  useEffect(() => {
    setMounted(true);
  }, []);

  const m = useMemo(() => {
    const r = rate / 100, a = adopt / 100, f = freq / 100, b = bonus / 100, k = brk / 100;
    const totalRevenue = cli * tic * vis;
    const wClients = cli * a, cClients = cli - wClients;
    const oldFees = cli * vis * (tic * r + 0.3);
    const cardPart = cClients * vis * (tic * r + 0.3);
    const loads = 4, perClientYear = tic * vis, loadAmt = perClientYear / loads;
    const achPerLoad = Math.min(loadAmt * 0.008, 5);
    const achPart = wClients * loads * achPerLoad;
    const newFees = cardPart + achPart;
    const feeSave = oldFees - newFees;

    const extraRev = wClients * vis * tic * f;
    const annualSpend = tic * vis * (1 + f);
    const loaded = wClients * annualSpend;
    const breakRev = loaded * k;
    const promoCost = b * loaded;
    const net = extraRev + breakRev + feeSave - promoCost;

    return { totalRevenue, oldFees, newFees, feeSave, extraRev, breakRev, promoCost, net };
  }, [cli, tic, vis, rate, adopt, freq, bonus, brk]);

  const feeData = [
    { name: "Card fees today", value: Math.round(m.oldFees), fill: CLAY },
    { name: "With ACH wallet", value: Math.round(m.newFees), fill: SAGE },
  ];
  const revData = [
    { name: "Extra visits", value: Math.round(m.extraRev), fill: SAGE },
    { name: "Breakage", value: Math.round(m.breakRev), fill: SAGE_LIGHT },
    { name: "Fee savings", value: Math.round(m.feeSave), fill: GOLD },
    { name: "Promo cost", value: -Math.round(m.promoCost), fill: CLAY },
    { name: "Net upside", value: Math.round(m.net), fill: INK },
  ];

  const pctOfRev = (n: number) => (m.totalRevenue ? ((n / m.totalRevenue) * 100).toFixed(1) + "% of revenue" : "");

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <p className="text-xs uppercase tracking-[0.18em] text-text-muted mb-3">Your salon</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <Slider label="Active clients" value={cli} suffix={`${cli}`} min={20} max={2000} step={10} onChange={setCli} />
        <Slider label="Avg ticket" value={tic} suffix={`$${tic}`} min={20} max={400} step={5} onChange={setTic} />
        <Slider label="Visits / client / year" value={vis} suffix={`${vis}`} min={2} max={52} step={1} onChange={setVis} />
        <Slider label="Card rate" value={rate} suffix={`${rate.toFixed(2)}%`} min={2.0} max={4.0} step={0.05} onChange={setRate} />
        <div className="sm:col-span-2">
          <Slider label="Clients who adopt the wallet" value={adopt} suffix={`${adopt}%`} min={0} max={100} step={5} onChange={setAdopt} />
        </div>
      </div>

      {/* Total revenue anchor — context for every other figure */}
      <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-border bg-surface-elevated px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-text-muted mb-1">Total annual revenue</p>
          <p className="text-[11px] text-text-muted">clients × avg ticket × visits</p>
        </div>
        <p className="font-serif text-3xl font-medium text-text-primary">{fmt(m.totalRevenue)}</p>
      </div>

      <div className="flex border-b border-border mb-5">
        <button
          type="button"
          onClick={() => setTab("fees")}
          className={`flex-1 py-2.5 text-sm border-b-2 -mb-px transition-colors ${tab === "fees" ? "text-text-primary border-text-primary" : "text-text-secondary border-transparent"}`}
        >
          Fee savings
        </button>
        <button
          type="button"
          onClick={() => setTab("rev")}
          className={`flex-1 py-2.5 text-sm border-b-2 -mb-px transition-colors ${tab === "rev" ? "text-text-primary border-text-primary" : "text-text-secondary border-transparent"}`}
        >
          Revenue lift
        </button>
      </div>

      {tab === "fees" ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <Metric label="Card fees today" value={fmt(m.oldFees)} tone="danger" />
            <Metric label="Fees with wallet" value={fmt(m.newFees)} />
            <Metric label="Saved / year" value={fmt(m.feeSave)} tone="gold" />
            <Metric label="Over 5 years" value={fmt(m.feeSave * 5)} tone="success" />
          </div>
          <div style={{ width: "100%", height: 180 }}>
            {mounted && (
              <ResponsiveContainer>
                <BarChart data={feeData} layout="vertical" margin={{ left: 8, right: 56, top: 4, bottom: 4 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fill: LABEL, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#1614150a" }} contentStyle={tooltipStyle} formatter={(value) => [fmt(Number(value)) + " / year", ""]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={42}>
                    {feeData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    <LabelList dataKey="value" position="right" formatter={(value) => fmt(Number(value))} fill={LABEL} fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <p className="text-xs text-text-muted mt-3 leading-relaxed">
            Card fees today are <span className="text-text-secondary">{pctOfRev(m.oldFees)}</span>. Card path: your rate + $0.30 per visit. Wallet path: adopters fund credit via ACH at 0.8% (capped $5/load, ~4 loads a year); the rest stay on cards.
          </p>
        </>
      ) : (
        <>
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted mb-3">Wallet promotion &amp; loyalty assumptions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="sm:col-span-2">
              <Slider label="Extra visits from retention (wallet members)" value={freq} suffix={`+${freq}%`} min={0} max={50} step={1} onChange={setFreq} />
            </div>
            <Slider label={'"Load & get bonus" promo'} value={bonus} suffix={`${bonus}%`} min={0} max={25} step={1} onChange={setBonus} />
            <Slider label="Breakage (unspent credit)" value={brk} suffix={`${brk}%`} min={0} max={12} step={1} onChange={setBrk} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <Metric label="Extra-visit revenue" value={fmt(m.extraRev)} tone="success" />
            <Metric label="Breakage credit" value={fmt(m.breakRev)} tone="success" />
            <Metric label="Promo cost" value={fmt(m.promoCost)} tone="danger" />
            <Metric label="Net annual upside" value={fmt(m.net)} tone="gold" />
          </div>
          <div style={{ width: "100%", height: 230 }}>
            {mounted && (
              <ResponsiveContainer>
                <BarChart data={revData} margin={{ left: 0, right: 8, top: 16, bottom: 4 }}>
                  <XAxis dataKey="name" tick={{ fill: LABEL, fontSize: 11 }} interval={0} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: MUTED, fontSize: 11 }} tickFormatter={(v: number) => (v < 0 ? "-$" : "$") + Math.abs(v / 1000) + "k"} axisLine={false} tickLine={false} width={44} />
                  <Tooltip cursor={{ fill: "#1614150a" }} contentStyle={tooltipStyle} formatter={(value) => [fmt(Number(value)) + " / year", ""]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={48}>
                    {revData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <p className="text-xs text-text-muted mt-3 leading-relaxed">
            Net upside is <span className="text-text-secondary">{pctOfRev(m.net)}</span>. Net = extra-visit revenue + breakage + ACH fee savings − promo cost. Bonus credit is counted at full face value (conservative; your real cost to deliver it is lower). Prepaid balances are regulated like gift cards — many states limit expiration and require escheatment of breakage, so treat breakage as upside, not a guarantee.
          </p>
        </>
      )}
    </div>
  );
}
