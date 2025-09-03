import React from 'react';
import type { CalculatedFees } from '../types';

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
  if (!fees) {
    return (
      <div className="bg-light-card dark:bg-dark-card p-8 rounded-lg shadow-lg h-full flex items-center justify-center">
        <p className="text-light-secondary dark:text-dark-secondary text-center">Enter project details to see the fee estimation.</p>
      </div>
    );
  }

  // If total is zero, show a message instead of an empty breakdown
  if (fees.total === 0) {
    return (
        <div className="bg-light-card dark:bg-dark-card p-8 rounded-lg shadow-lg h-full flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-5 text-center">Fee Estimation Breakdown</h2>
            <p className="text-light-secondary dark:text-dark-secondary text-center">No fees are applicable for the current project details.</p>
        </div>
    );
  }

  return (
    <div className="bg-light-card dark:bg-dark-card p-5 sm:p-6 rounded-lg shadow-lg h-full">
      <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-5">Fee Estimation Breakdown</h2>

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
    </div>
  );
};

export default FeeDisplay;