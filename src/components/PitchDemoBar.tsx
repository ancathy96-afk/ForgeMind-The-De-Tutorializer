import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  ShieldCheck,
  Zap,
  Play
} from 'lucide-react';
import { EvaluationVerdict } from '../types';

export interface PitchDemoBarProps {
  conceptId: string;
  conceptName: string;
  stage: 'confidence' | 'attempt' | 'submitted';
  confidence: number;
  response: string;
  verdict: EvaluationVerdict | null;
  hintTier: number;
  isEvaluating: boolean;
  onSetConfidenceAndStart: (conf: number) => void;
  onFillAttempt: (text: string) => void;
  onUnlockHintAndRetry: () => void;
  onGoToEvidence: () => void;
}

// Canonical demo text payloads for the Buildathon Pitch Path
const DEMO_SCRIPTS: Record<
  string,
  {
    step1Title: string;
    attempt1Label: string;
    attempt1Desc: string;
    attempt1Text: string;
    attempt2Label: string;
    attempt2Desc: string;
    attempt2Text: string;
  }
> = {
  'rice-prioritization': {
    step1Title: 'Primary Pitch: Overconfidence (5/5) & Latent Blindspot',
    attempt1Label: '1. Insert Attempt 1 (Common Pitfall: Raw RICE & 100% Sales Faith)',
    attempt1Desc: 'Calculates raw RICE correctly, but falls for unadjusted accounts and verbal sales claims.',
    attempt1Text: `Executive Prioritization Brief

1) Raw RICE Calculation:
Applying RICE = (Reach × Impact × Confidence) / Effort:
- Project Titan (Subcontractor Punch-List Mobile Sync):
  Reach = 520 accounts | Impact = 2 | Confidence = 80% (0.8) | Effort = 4 engineer-months
  Score = (520 × 2 × 0.8) / 4 = 208.0

- Project Bedrock (Predictive Hydraulic Alerts):
  Reach = 148 accounts | Impact = 3 | Confidence = 50% (0.5) | Effort = 3 engineer-months
  Score = (148 × 3 × 0.5) / 3 = 74.0

- Project Apex (Enterprise ERP Multi-Entity Billing):
  Reach = 5 accounts | Impact = 3 | Confidence = 100% (1.0) guaranteed by Sales Director | Effort = 2 engineer-months
  Score = (5 × 3 × 1.0) / 2 = 7.5

2) Ranking & Capacity Cut:
Ranking by score: 1. Titan (208.0), 2. Bedrock (74.0), 3. Apex (7.5).
Our engineering capacity is capped at 6 engineer-months.
Delivering Titan (4 mo) + Bedrock (3 mo) = 7 mo (exceeds capacity).
Therefore, we must deliver Project Titan (4 mo) + Project Apex (2 mo) = 6 engineer-months.
Project Bedrock must be cut for Q3 due to engineering capacity.`,
    attempt2Label: '2. Insert Retry Attempt 2 (Mastery: Fleet Normalization & Inversion Threshold)',
    attempt2Desc: 'Normalizes sensor fleet volume, applies 40% sales discount, and defines sensitivity thresholds.',
    attempt2Text: `Executive Prioritization Brief (Revised: Fleet Normalization & Pipeline Discount)

1) Unit Normalization & Pipeline Discount Rationale:
A. Unit of Analysis Mismatch: Measuring Reach purely by legal entities distorts the portfolio. Titan touches 520 accounts (~20,800 sensors, $3.12M ARR), whereas Bedrock covers 62% of active sensors (~20,336 sensors across enterprise fleet), and Apex commands $1.2M renewal ARR across 5 conglomerates.
B. Sales Confidence Discount: Uncontracted verbal sales claims of 100% must be penalized to an empirical B2B pipeline discount factor of 40% (0.40).

2) Normalized RICE Formulation:
- Project Titan:
  Reach: 520 accounts | Impact: 2 | Conf: 0.80 | Effort: 4 mo
  Score = (520 × 2 × 0.80) / 4 = 208.0
- Project Bedrock (Normalized by Sensor Fleet Exposure):
  Reach: 62% sensor volume (or 148 accounts with 62% density) | Impact: 3 | Conf: 0.50 | Effort: 3 mo
  Account Basis = (148 × 3 × 0.50) / 3 = 74.0 | Sensor-weighted RICE = (62 × 3 × 0.50) / 3 = 31.0
- Project Apex (Discounted Confidence):
  Reach: 5 accounts ($1.2M ARR) | Impact: 3 | Conf: 0.40 (discounted from 100%) | Effort: 2 mo
  Account Basis = (5 × 3 × 0.40) / 2 = 3.0 | ARR Basis ($100k units) = (12 × 3 × 0.40) / 2 = 7.2

3) Capacity Packaging (6 Engineer-Months Ceiling):
Package: Titan (4 mo) + Apex (2 mo) = 6 mo. Titan protects mid-market churn, Apex secures the $1.2M renewal. Bedrock deferred to Q4 due to 50% prototype variance.

4) Inversion Sensitivity Threshold:
Our decision inverts in favor of Bedrock + Apex if:
a) Enterprise renewal churn risk exceeds 25% ARR attrition, OR
b) Bedrock field hardware telemetry validates above 75% confidence, OR
c) Titan effort expands beyond 4.5 months, breaking the 6-month capacity ceiling.`
  },
  'sql-joins': {
    step1Title: 'SQL Library Path: Relational Multi-Join Cardinality',
    attempt1Label: '1. Insert Attempt 1 (Common Pitfall: Cartesian Row Explosion)',
    attempt1Desc: 'Direct multi-table join that causes Cartesian fan-out across 1-to-many child tables.',
    attempt1Text: `-- Naive Multi-Join Query (Exhibits Cartesian Fan-Out)
SELECT 
  m.merchant_id,
  m.business_name,
  SUM(t.gross_amount) AS total_gross,
  SUM(r.refunded_amount) AS total_refunded,
  SUM(f.fee_amount) AS total_fees
FROM merchants m
LEFT JOIN transactions t ON m.merchant_id = t.merchant_id
LEFT JOIN refunds r ON m.merchant_id = r.merchant_id
LEFT JOIN fee_surcharges f ON m.merchant_id = f.merchant_id
GROUP BY m.merchant_id, m.business_name;`,
    attempt2Label: '2. Insert Retry Attempt 2 (Mastery: CTE Pre-Aggregation & COALESCE)',
    attempt2Desc: 'Isolates child records in CTEs before joining parent records to maintain cardinality.',
    attempt2Text: `-- Production Pre-Aggregation Pattern
WITH tx_agg AS (
  SELECT merchant_id, SUM(gross_amount) AS total_gross
  FROM transactions
  GROUP BY merchant_id
),
refund_agg AS (
  SELECT merchant_id, SUM(refunded_amount) AS total_refunded
  FROM refunds
  GROUP BY merchant_id
),
fee_agg AS (
  SELECT merchant_id, SUM(fee_amount) AS total_fees
  FROM fee_surcharges
  GROUP BY merchant_id
)
SELECT 
  m.merchant_id,
  m.business_name,
  COALESCE(t.total_gross, 0) AS total_gross,
  COALESCE(r.total_refunded, 0) AS total_refunded,
  COALESCE(f.total_fees, 0) AS total_fees
FROM merchants m
LEFT JOIN tx_agg t ON m.merchant_id = t.merchant_id
LEFT JOIN refund_agg r ON m.merchant_id = r.merchant_id
LEFT JOIN fee_agg f ON m.merchant_id = f.merchant_id;`
  }
};

export const PitchDemoBar: React.FC<PitchDemoBarProps> = ({
  conceptId,
  conceptName,
  stage,
  confidence,
  response,
  verdict,
  hintTier,
  isEvaluating,
  onSetConfidenceAndStart,
  onFillAttempt,
  onUnlockHintAndRetry,
  onGoToEvidence
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const scriptKey = conceptId.includes('sql') ? 'sql-joins' : 'rice-prioritization';
  const script = DEMO_SCRIPTS[scriptKey] || DEMO_SCRIPTS['rice-prioritization'];
  const isRicePitch = conceptId === 'rice-prioritization';

  // Determine current active milestone in the pitch chain:
  // 1: Stored Challenge
  // 2: Confidence 5/5
  // 3: Attempt 1
  // 4: Evaluation Partial
  // 5: Hint Ladder
  // 6: Retry Attempt 2
  // 7: Correct Verdict
  // 8: Evidence Ledger
  let activeStep = 1;
  if (stage === 'confidence') {
    activeStep = confidence === 5 ? 2 : 1;
  } else if (stage === 'attempt') {
    activeStep = hintTier > 0 ? 6 : 3;
  } else if (stage === 'submitted') {
    if (isEvaluating) {
      activeStep = hintTier > 0 ? 6 : 4;
    } else if (verdict === 'CORRECT') {
      activeStep = 7;
    } else if (verdict === 'PARTIALLY_CORRECT') {
      activeStep = hintTier > 0 ? 5 : 4;
    } else {
      activeStep = 4;
    }
  }

  const pitchSteps = [
    { num: 1, label: 'Stored Challenge', desc: 'No Gemini generation' },
    { num: 2, label: 'Confidence 5/5', desc: 'Predicted mastery' },
    { num: 3, label: 'Attempt 1', desc: 'Independent solve' },
    { num: 4, label: 'Partially Correct', desc: 'Diagnostic verdict' },
    { num: 5, label: 'Hint Ladder', desc: 'Tier 1 scaffold' },
    { num: 6, label: 'Retry Synthesis', desc: 'Refined reasoning' },
    { num: 7, label: 'Correct', desc: 'Milestone verified' },
    { num: 8, label: 'Evidence', desc: 'Proof ledger' }
  ];

  return (
    <div
      id="pitch-demo-controller"
      className="mb-6 rounded-xl border border-amber-500/30 bg-gradient-to-r from-[#14120e] via-[#101117] to-[#12141c] p-4 shadow-xl text-xs transition-all"
    >
      {/* Top Bar: Title, Badge, Collapse */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
        <div className="flex items-center space-x-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-400/20 text-amber-300 font-bold">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-zinc-100 font-serif text-sm">
            {isRicePitch ? 'Primary Pitch Demo Flow' : 'Content Library Demo Flow'}
          </span>
          <span className="rounded bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 font-mono text-[10px] text-amber-300">
            {conceptName}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[11px] text-zinc-400 hidden sm:inline font-mono">
            Step {activeStep} of 8
          </span>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center space-x-1 rounded bg-zinc-800/80 hover:bg-zinc-800 px-2 py-1 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <span className="text-[10px] uppercase font-mono">{isCollapsed ? 'Expand Pitch Helper' : 'Minimize'}</span>
            {isCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="mt-3">
          {/* Step Progress Indicators */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 py-1">
            {pitchSteps.map((step) => {
              const isPast = activeStep > step.num;
              const isCurrent = activeStep === step.num;
              return (
                <div
                  key={step.num}
                  className={`rounded-md p-1.5 text-center transition-all ${
                    isCurrent
                      ? 'border border-amber-400/60 bg-amber-400/15 text-amber-200 font-semibold shadow-sm ring-1 ring-amber-400/30'
                      : isPast
                      ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border border-zinc-800/80 bg-zinc-900/40 text-zinc-500'
                  }`}
                >
                  <div className="text-[10px] font-mono leading-none">
                    {isPast ? '✓' : `0${step.num}`}
                  </div>
                  <div className="mt-1 font-medium truncate text-[10px] leading-tight">
                    {step.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contextual Pitch Actions based on Active Stage */}
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800/90 bg-[#0a0b0f] p-3">
            <div className="flex-1 min-w-[200px]">
              {stage === 'confidence' && (
                <div>
                  <span className="text-zinc-400 block text-[11px]">
                    Pitch Narrative:{' '}
                    <strong className="text-zinc-200 font-medium">
                      Demonstrate illusion of competence.
                    </strong>{' '}
                    The learner sets confidence to 5/5, certain they know the concept.
                  </span>
                </div>
              )}

              {stage === 'attempt' && hintTier === 0 && (
                <div>
                  <span className="text-zinc-400 block text-[11px]">
                    Pitch Narrative:{' '}
                    <strong className="text-zinc-200 font-medium">Attempt 1 (Bias Pitfall).</strong>{' '}
                    Submits an answer that calculates formulas correctly but overlooks real-world bias.
                  </span>
                </div>
              )}

              {stage === 'attempt' && hintTier > 0 && (
                <div>
                  <span className="text-zinc-400 block text-[11px]">
                    Pitch Narrative:{' '}
                    <strong className="text-zinc-200 font-medium">Attempt 2 (Retry with Hint).</strong>{' '}
                    Applies the unlocked diagnostic scaffold to resolve the unit mismatch and sensitivity.
                  </span>
                </div>
              )}

              {stage === 'submitted' && verdict === 'PARTIALLY_CORRECT' && (
                <div>
                  <span className="text-zinc-400 block text-[11px]">
                    Pitch Narrative:{' '}
                    <strong className="text-amber-300 font-medium">Evaluated PARTIALLY_CORRECT.</strong>{' '}
                    Notice the exact missing capabilities and cited quotes. Now unlock Tier 1 hint and retry!
                  </span>
                </div>
              )}

              {stage === 'submitted' && verdict === 'CORRECT' && (
                <div>
                  <span className="text-zinc-400 block text-[11px]">
                    Pitch Narrative:{' '}
                    <strong className="text-emerald-300 font-medium">Evaluated CORRECT!</strong>{' '}
                    All capabilities verified. Open the Evidence Ledger to see the proof of mastery.
                  </span>
                </div>
              )}
            </div>

            {/* Quick-Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {stage === 'confidence' && (
                <button
                  id="pitch-quick-set-confidence-btn"
                  onClick={() => onSetConfidenceAndStart(5)}
                  className="flex items-center space-x-1.5 rounded-lg bg-amber-400 px-3.5 py-1.5 font-semibold text-zinc-950 hover:bg-amber-300 transition-all shadow-sm active:scale-95 text-xs"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>Set 5/5 Confidence & Start</span>
                </button>
              )}

              {stage === 'attempt' && (
                <>
                  <button
                    id="pitch-fill-attempt-1-btn"
                    onClick={() => onFillAttempt(script.attempt1Text)}
                    title={script.attempt1Desc}
                    className="flex items-center space-x-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 font-medium text-amber-300 hover:bg-amber-500/20 transition-all text-xs"
                  >
                    <span>⚡ Fill Attempt 1 (Common Pitfall)</span>
                  </button>

                  <button
                    id="pitch-fill-attempt-2-btn"
                    onClick={() => onFillAttempt(script.attempt2Text)}
                    title={script.attempt2Desc}
                    className="flex items-center space-x-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 font-medium text-emerald-300 hover:bg-emerald-500/20 transition-all text-xs"
                  >
                    <span>⚡ Fill Attempt 2 (Mastery Retry)</span>
                  </button>
                </>
              )}

              {stage === 'submitted' && verdict === 'PARTIALLY_CORRECT' && (
                <button
                  id="pitch-unlock-hint-retry-btn"
                  onClick={onUnlockHintAndRetry}
                  className="flex items-center space-x-1.5 rounded-lg bg-amber-400 px-3.5 py-1.5 font-semibold text-zinc-950 hover:bg-amber-300 transition-all text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Unlock Hint Tier 1 & Retry</span>
                </button>
              )}

              {stage === 'submitted' && verdict === 'CORRECT' && (
                <button
                  id="pitch-view-evidence-btn"
                  onClick={onGoToEvidence}
                  className="flex items-center space-x-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 font-semibold text-zinc-950 hover:bg-emerald-400 transition-all text-xs shadow-sm"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>View Capability Evidence Ledger</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
