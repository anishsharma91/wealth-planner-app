import React, { useMemo, useState } from 'react';
import { SWPInput } from '../types/swpTypes';
import { parseShorthandNumber } from '../utils/formatters';
import { runPostTaxSWPSimulation } from '../utils/swpEngine';

interface ShorthandTextInputProps {
  label: string;
  initialValue: number | string;
  placeholder?: string;
  onValueParsed: (numericValue: number) => void;
  isPercentage?: boolean;
}

const ShorthandTextInput: React.FC<ShorthandTextInputProps> = ({
  label,
  initialValue,
  placeholder,
  onValueParsed,
  isPercentage = false,
}) => {
  // Store raw string locally to isolate typing state from parent re-renders
  const [rawText, setRawText] = useState<string>(String(initialValue));

  const handleBlur = () => {
    // 1. Parse string shorthand (e.g., "1L", "1.5Cr", "50k")
    const parsed = parseShorthandNumber(rawText);
    const finalNumeric = isPercentage ? parsed / 100 : parsed;

    // 2. Pass parsed numeric result to SWP simulation engine
    onValueParsed(finalNumeric);
  };

  return (
    <div>
      <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
        {label}
      </label>
      <input
        type="text"
        inputMode="text"
        autoComplete="off"
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid #CBD5E1',
          fontSize: '14px',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />
    </div>
  );
};

export const SWPCalculator: React.FC = () => {
  // 1. Simulation Input State (Numbers only for swpEngine)
  const [inputs, setInputs] = useState<SWPInput>({
    initialCorpus: 10000000, // ₹1 Crore default
    initialUnitNAV: 100,
    expectedAnnualReturn: 0.10, // 10%
    expectedAnnualInflation: 0.05, // 5%
    initialMonthlyWithdrawal: 50000, // ₹50,000 / month
    swpDurationYears: 15,
    annualLTCGExemption: 125000, // ₹1.25 Lakh
    ltcgTaxRate: 0.125, // 12.5%
    stcgTaxRate: 0.20, // 20%
    baseCurrency: 'INR',
  });

  // 2. Compute Simulation Output dynamically
  const report = useMemo(() => {
    return runPostTaxSWPSimulation(inputs);
  }, [inputs]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px', fontFamily: 'sans-serif' }}>
      
      {/* Title Header & Visible Hint Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#0F172A' }}>Post-Tax SWP & Inflation-Adjusted Simulator</h2>
        <div
          style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            color: '#1D4ED8',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>💡</span> Hint: Type "10k", "1.5L", "2Cr", "50cr"
        </div>
      </div>

      {/* Input Controls Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        <ShorthandTextInput
          label={`Initial Corpus (${inputs.baseCurrency}):`}
          initialValue="1Cr"
          placeholder="e.g. 1Cr, 50L, 10k"
          onValueParsed={(val) => setInputs((prev) => ({ ...prev, initialCorpus: val }))}
        />

        <ShorthandTextInput
          label="Monthly Withdrawal (Today's Value):"
          initialValue="50k"
          placeholder="e.g. 50k, 1L"
          onValueParsed={(val) => setInputs((prev) => ({ ...prev, initialMonthlyWithdrawal: val }))}
        />

        <ShorthandTextInput
          label="Expected Return (% p.a.):"
          initialValue="10"
          placeholder="10"
          isPercentage={true}
          onValueParsed={(val) => setInputs((prev) => ({ ...prev, expectedAnnualReturn: val }))}
        />

        <ShorthandTextInput
          label="Expected Inflation (% p.a.):"
          initialValue="5"
          placeholder="5"
          isPercentage={true}
          onValueParsed={(val) => setInputs((prev) => ({ ...prev, expectedAnnualInflation: val }))}
        />

        <ShorthandTextInput
          label="Duration (Years):"
          initialValue="15"
          placeholder="15"
          onValueParsed={(val) => setInputs((prev) => ({ ...prev, swpDurationYears: val }))}
        />

      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <small style={{ color: '#64748B' }}>Total Gross Withdrawn</small>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', color: '#0F172A' }}>
            ₹{Math.round(report.totalGrossWithdrawn).toLocaleString('en-IN')}
          </h3>
        </div>

        <div style={{ background: '#FEF2F2', padding: '16px', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
          <small style={{ color: '#991B1B' }}>Total Tax Paid</small>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', color: '#DC2626' }}>
            ₹{Math.round(report.totalTaxPaid).toLocaleString('en-IN')}
          </h3>
        </div>

        <div style={{ background: '#F0FDF4', padding: '16px', borderRadius: '8px', border: '1px solid #86EFAC' }}>
          <small style={{ color: '#166534' }}>Total Net Cash Received</small>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', color: '#16A34A' }}>
            ₹{Math.round(report.totalNetWithdrawn).toLocaleString('en-IN')}
          </h3>
        </div>

        <div style={{ background: '#EFF6FF', padding: '16px', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
          <small style={{ color: '#1E40AF' }}>Final Remaining Corpus</small>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', color: '#2563EB' }}>
            {report.exhaustionMonth
              ? `Exhausted in Month ${report.exhaustionMonth}`
              : `₹${Math.round(report.finalCorpusValue).toLocaleString('en-IN')}`}
          </h3>
        </div>
      </div>

      {/* Yearly Projection Breakdown */}
      <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#0F172A' }}>Yearly Projection Breakdown</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#F1F5F9', borderBottom: '2px solid #CBD5E1' }}>
              <th style={{ padding: '10px' }}>Year</th>
              <th style={{ padding: '10px' }}>Gross Withdrawal</th>
              <th style={{ padding: '10px' }}>Tax Paid</th>
              <th style={{ padding: '10px' }}>Net Received</th>
              <th style={{ padding: '10px' }}>Ending Corpus</th>
            </tr>
          </thead>
          <tbody>
            {report.monthlyLogs
              .filter((log) => log.month % 12 === 0 || log.isCorpusExhausted)
              .map((log) => (
                <tr key={log.month} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '10px' }}>Year {Math.ceil(log.month / 12)}</td>
                  <td style={{ padding: '10px' }}>
                    ₹{Math.round(log.grossWithdrawal * 12).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '10px', color: '#DC2626' }}>
                    ₹{Math.round(log.taxPaid * 12).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '10px', color: '#16A34A' }}>
                    ₹{Math.round(log.netWithdrawal * 12).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '10px' }}>
                    ₹{Math.round(log.endingCorpusValue).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};