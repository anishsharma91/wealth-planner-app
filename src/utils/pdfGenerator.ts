// utils/pdfGenerator.ts
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { CalculationResult } from './compoundMath';

interface ExportOptions {
  result: CalculationResult;
  currencySymbol: string;
  formattedCorpus: string;
  formattedInvested: string;
  formattedGrowth: string;
  monthlyPassive: string;
  realValue: string;
}

export async function exportWealthReport(options: ExportOptions) {
  const {
    result,
    currencySymbol,
    formattedCorpus,
    formattedInvested,
    formattedGrowth,
    monthlyPassive,
    realValue,
  } = options;

  const rowsHtml = result.yearlyBreakdown
    .map(
      (row) => `
      <tr>
        <td>Year ${row.year}</td>
        <td>${currencySymbol}${row.investedCapital.toLocaleString()}</td>
        <td style="color: #059669;">+${currencySymbol}${row.wealthGenerated.toLocaleString()}</td>
        <td><strong>${currencySymbol}${row.totalCorpus.toLocaleString()}</strong></td>
      </tr>`
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #1e293b; }
          .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #0f172a; margin: 0; }
          .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
          .card { background: #0f172a; color: white; border-radius: 12px; padding: 18px; margin-bottom: 20px; }
          .card-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
          .card-value { font-size: 28px; font-weight: bold; margin: 6px 0 14px 0; }
          .grid { display: flex; justify-content: space-between; gap: 12px; }
          .grid-item { flex: 1; }
          .grid-label { font-size: 11px; color: #94a3b8; }
          .grid-val { font-size: 14px; font-weight: 600; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { text-align: left; font-size: 11px; color: #64748b; border-bottom: 1px solid #cbd5e1; padding: 8px 4px; }
          td { font-size: 12px; border-bottom: 1px solid #f1f5f9; padding: 8px 4px; }
          .footer { margin-top: 30px; font-size: 10px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">⚡ WealthPulse Plan</div>
          <div class="subtitle">Generated Investment Report</div>
        </div>

        <div class="card">
          <div class="card-label">Target Corpus Goal</div>
          <div class="card-value">${formattedCorpus}</div>
          <div class="grid">
            <div class="grid-item">
              <div class="grid-label">Total Invested</div>
              <div class="grid-val">${formattedInvested}</div>
            </div>
            <div class="grid-item">
              <div class="grid-label">Wealth Generated</div>
              <div class="grid-val" style="color: #34d399;">+${formattedGrowth}</div>
            </div>
          </div>
          <hr style="border: 0; border-top: 1px solid #334155; margin: 12px 0;" />
          <div class="grid">
            <div class="grid-item">
              <div class="grid-label">Est. Monthly Passive Income</div>
              <div class="grid-val" style="color: #38bdf8;">${monthlyPassive}/mo</div>
            </div>
            <div class="grid-item">
              <div class="grid-label">Inflation Adjusted Value</div>
              <div class="grid-val">${realValue}</div>
            </div>
          </div>
        </div>

        <h3>Yearly Growth Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th>Invested</th>
              <th>Growth</th>
              <th>Total Corpus</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          WealthPulse Report • Figures are projections based on continuous compounding.
        </div>
      </body>
    </html>
  `;

  try {
    if (Platform.OS === 'web') {
      // Direct browser print prompt on web
      await Print.printAsync({ html: htmlContent });
    } else {
      // Mobile print-to-file and native share prompt
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const canShare = await Sharing.isAvailableAsync();
      
      if (canShare) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'Export Investment Projection PDF',
        });
      } else {
        // Fallback print modal if native sharing is unavailable (e.g. simulator)
        await Print.printAsync({ uri });
      }
    }
  } catch (error) {
    console.warn('PDF export fallback executed:', error);
  }
}