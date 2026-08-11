import React, { useMemo, useState } from 'react';
import { runPostTaxSWPSimulation } from '../utils/swpEngine'; // Adjust path as needed
import { SWPInput } from './../types/swpTypes';

export const SWPCalculator: React.FC = () => {
  // 1. User Input States with Defaults
  const [inputs, setInputs] = useState<SWPInput>({
    initialCorpus: 10000000, // ₹1 Crore
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

  // 2. Compute Simulation Output dynamically when inputs change
  const report = useMemo(() => {
    return runPostTaxSWPSimulation(inputs);
  }, [inputs]);

  const handleInputChange = (field: keyof SWPInput, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px', fontFamily: 'sans-serif' }}>
      <h2>Post-Tax SWP & Inflation-Adjusted Simulator</h2>

      {/* Input Controls Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div>
          <label>Initial Corpus ({inputs.baseCurrency}):</label>
          <input
            type="number"
            value={inputs.initialCorpus}
            onChange={(e) => handleInputChange('initialCorpus', Number(e.target.value))}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        <div>
          <label>Monthly Withdrawal (Today's Value):</label>
          <input
            type="number"
            value={inputs.initialMonthlyWithdrawal}
            onChange={(e) => handleInputChange('initialMonthlyWithdrawal', Number(e.target.value))}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        <div>
          <label>Expected Return (% p.a.):</label>
          <input
            type="number"
            step="0.5"
            value={inputs.expectedAnnualReturn * 100}
            onChange={(e) => handleInputChange('expectedAnnualReturn', Number(e.target.value) / 100)}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        <div>
          <label>Expected Inflation (% p.a.):</label>
          <input
            type="number"
            step="0.5"
            value={inputs.expectedAnnualInflation * 100}
            onChange={(e) => handleInputChange('expectedAnnualInflation', Number(e.target.value) / 100)}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        <div>
          <label>Duration (Years):</label>
          <input
            type="number"
            value={inputs.swpDurationYears}
            onChange={(e) => handleInputChange('swpDurationYears', Number(e.target.value))}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#f4f6f8', padding: '16px', borderRadius: '8px' }}>
          <small>Total Gross Withdrawn</small>
          <h3>₹{Math.round(report.totalGrossWithdrawn).toLocaleString()}</h3>
        </div>

        <div style={{ background: '#fff0f0', padding: '16px', borderRadius: '8px' }}>
          <small>Total Tax Paid</small>
          <h3 style={{ color: '#d32f2f' }}>₹{Math.round(report.totalTaxPaid).toLocaleString()}</h3>
        </div>

        <div style={{ background: '#e8f5e9', padding: '16px', borderRadius: '8px' }}>
          <small>Total Net Cash Received</small>
          <h3 style={{ color: '#2e7d32' }}>₹{Math.round(report.totalNetWithdrawn).toLocaleString()}</h3>
        </div>

        <div style={{ background: '#e3f2fd', padding: '16px', borderRadius: '8px' }}>
          <small>Final Remaining Corpus</small>
          <h3>
            {report.exhaustionMonth
              ? `Exhausted in Month ${report.exhaustionMonth}`
              : `₹${Math.round(report.finalCorpusValue).toLocaleString()}`}
          </h3>
        </div>
      </div>

      {/* Yearly Summary Table */}
      <h3>Yearly Projection Breakdown</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f0f0f0', borderBottom: '2px solid #ccc' }}>
              <th style={{ padding: '8px' }}>Year</th>
              <th style={{ padding: '8px' }}>Gross Withdrawal</th>
              <th style={{ padding: '8px' }}>Tax Paid</th>
              <th style={{ padding: '8px' }}>Net Received</th>
              <th style={{ padding: '8px' }}>Ending Corpus</th>
            </tr>
          </thead>
          <tbody>
            {report.monthlyLogs
              .filter((log) => log.month % 12 === 0 || log.isCorpusExhausted) // Annual snapshot
              .map((log) => (
                <tr key={log.month} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>Year {Math.ceil(log.month / 12)}</td>
                  <td style={{ padding: '8px' }}>₹{Math.round(log.grossWithdrawal * 12).toLocaleString()}</td>
                  <td style={{ padding: '8px', color: '#d32f2f' }}>
                    ₹{Math.round(log.taxPaid * 12).toLocaleString()}
                  </td>
                  <td style={{ padding: '8px', color: '#2e7d32' }}>
                    ₹{Math.round(log.netWithdrawal * 12).toLocaleString()}
                  </td>
                  <td style={{ padding: '8px' }}>₹{Math.round(log.endingCorpusValue).toLocaleString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};