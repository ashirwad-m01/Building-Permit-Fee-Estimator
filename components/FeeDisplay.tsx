import React from 'react';
import type { CalculatedFees } from '../types.ts';

interface FeeDisplayProps {
  fees: CalculatedFees | null;
  shelterFeeApplicable: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatCurrencyForText = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const FeeRow: React.FC<{ label: string; value: number; highlight?: boolean; note?: string }> = ({ label, value, highlight = false, note }) => (
  <div className={`flex justify-between items-center py-2.5 px-4 ${highlight ? 'bg-accent/10 rounded-lg' : 'border-b border-light-border dark:border-dark-border'}`}>
    <div>
      <p className={`text-sm ${highlight ? 'font-bold text-accent' : 'font-medium text-light-text dark:text-dark-text'}`}>{label}</p>
      {note && <p className="text-xs text-light-secondary dark:text-dark-secondary mt-1">{note}</p>}
    </div>
    <p className={`text-sm ${highlight ? 'font-bold text-accent' : 'text-light-secondary dark:text-dark-secondary'}`}>{formatCurrency(value)}</p>
  </div>
);

const SubtotalRow: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="flex justify-between items-center pt-3 mt-3 px-4 border-t border-light-border dark:border-dark-border">
      <p className="text-sm font-semibold text-light-secondary dark:text-dark-secondary">{label}</p>
      <p className="text-sm font-semibold text-light-text dark:text-dark-text">{formatCurrency(value)}</p>
    </div>
  );

const FeeSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="flex flex-col">
        <h3 className="text-lg font-semibold text-light-secondary dark:text-dark-secondary border-b-2 border-accent/30 pb-2 mb-3">{title}</h3>
        <div className="space-y-1 flex-grow">
            {children}
        </div>
    </div>
);


const FeeDisplay: React.FC<FeeDisplayProps> = ({ fees, shelterFeeApplicable }) => {

  const handleExportText = () => {
    if (!fees) return;

    const shelterNote = shelterFeeApplicable ? "Applicable for projects with more than 8 dwelling units. (Manual calculation required)" : "Not applicable";
    
    let textContent = `Building Permit Fee Estimation Breakdown\n`;
    textContent += `=======================================\n\n`;

    if (fees.scrutinySubtotal > 0) {
        textContent += `A) Scrutiny Fees\n`;
        textContent += `----------------\n`;
        if (fees.landDevelopment > 0) textContent += `Land Development Fee: INR ${formatCurrencyForText(fees.landDevelopment)}\n`;
        if (fees.buildingOperation > 0) textContent += `Building Operation Fee: INR ${formatCurrencyForText(fees.buildingOperation)}\n`;
        textContent += `Scrutiny Fees Subtotal: INR ${formatCurrencyForText(fees.scrutinySubtotal)}\n\n`;
    }

    if (fees.permitSubtotal > 0) {
        textContent += `B) Permit Fees\n`;
        textContent += `--------------\n`;
        if (fees.sanction > 0) textContent += `Sanction Fees: INR ${formatCurrencyForText(fees.sanction)}\n`;
        if (fees.cwwc > 0) textContent += `Construction Worker Welfare Cess (CWWC): INR ${formatCurrencyForText(fees.cwwc)}\n`;
        if (fees.shelter > 0) textContent += `Shelter Fees: INR ${formatCurrencyForText(fees.shelter)} (${shelterNote})\n`;
        if (fees.temporaryRetention > 0) textContent += `Temporary Retention Fees: INR ${formatCurrencyForText(fees.temporaryRetention)}\n`;
        if (fees.securityDeposit > 0) textContent += `Security Deposit: INR ${formatCurrencyForText(fees.securityDeposit)}\n`;
        if (fees.purchasableFAR > 0) textContent += `Purchasable FAR: INR ${formatCurrencyForText(fees.purchasableFAR)}\n`;
        if (fees.eidp > 0) textContent += `EIDP Fee: INR ${formatCurrencyForText(fees.eidp)}\n`;
        textContent += `Permit Fees Subtotal: INR ${formatCurrencyForText(fees.permitSubtotal)}\n\n`;
    }

    textContent += `=======================================\n`;
    textContent += `Total Estimated Fee: INR ${formatCurrencyForText(fees.total)}\n`;
    textContent += `=======================================\n\n`;
    textContent += `Disclaimer: This is an estimate for informational purposes only. Actual fees may vary.\n`;
    
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'fee-estimation.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };
  
  if (!fees) {
    return (
      <div className="bg-light-card dark:bg-dark-card p-8 rounded-lg shadow-lg h-full flex items-center justify-center">
        <p className="text-light-secondary dark:text-dark-secondary text-center">Enter project details to see the fee estimation.</p>
      </div>
    );
  }

  return (
    <div className="bg-light-card dark:bg-dark-card p-5 sm:p-6 rounded-lg shadow-lg h-full">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">Fee Estimation Breakdown</h2>
        {fees.total > 0 && (
          <button
            onClick={handleExportText}
            className="flex items-center gap-2 px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-accent bg-accent/10 hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
            aria-label="Export to Text"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export</span>
          </button>
        )}
      </div>

      {fees.total === 0 ? (
        <div className="h-full flex flex-col items-center justify-center py-10">
          <p className="text-light-secondary dark:text-dark-secondary text-center">No fees are applicable for the current project details.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8 gap-y-4">
            {fees.scrutinySubtotal > 0 && (
                <FeeSection title="A) Scrutiny Fees">
                    {fees.landDevelopment > 0 && <FeeRow label="Land Development Fee" value={fees.landDevelopment} />}
                    {fees.buildingOperation > 0 && <FeeRow label="Building Operation Fee" value={fees.buildingOperation} />}
                    <SubtotalRow label="Scrutiny Fees Subtotal" value={fees.scrutinySubtotal} />
                </FeeSection>
            )}
            
            {fees.permitSubtotal > 0 && (
                <FeeSection title="B) Permit Fees">
                    {fees.sanction > 0 && <FeeRow label="Sanction Fees" value={fees.sanction} />}
                    {fees.cwwc > 0 && <FeeRow label="Construction Worker Welfare Cess (CWWC)" value={fees.cwwc} />}
                    {fees.shelter > 0 && <FeeRow 
                        label="Shelter Fees" 
                        value={fees.shelter} 
                        note={shelterFeeApplicable ? "Applicable for projects with more than 8 dwelling units. (Manual calculation required)" : "Not applicable"}
                    />}
                    {fees.temporaryRetention > 0 && <FeeRow label="Temporary Retention Fees" value={fees.temporaryRetention} />}
                    {fees.securityDeposit > 0 && <FeeRow label="Security Deposit" value={fees.securityDeposit} />}
                    {fees.purchasableFAR > 0 && <FeeRow label="Purchasable FAR" value={fees.purchasableFAR} />}
                    {fees.eidp > 0 && <FeeRow label="EIDP Fee" value={fees.eidp} />}
                    <SubtotalRow label="Permit Fees Subtotal" value={fees.permitSubtotal} />
                </FeeSection>
            )}
          </div>

          <div className="mt-6 pt-3 border-t-2 border-dashed border-light-border dark:border-dark-border">
            <FeeRow label="Total Estimated Fee" value={fees.total} highlight={true} />
          </div>
          <p className="text-xs text-light-secondary dark:text-dark-secondary mt-4 text-center">Disclaimer: This is an estimate for informational purposes only. Actual fees may vary.</p>
        </>
      )}
    </div>
  );
};

export default FeeDisplay;