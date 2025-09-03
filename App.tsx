import React, { useState, useEffect, useCallback } from 'react';
import type { SubOccupancy, CalculatedFees } from './types.ts';
import { OCCUPANCY_DATA, FEE_RATES } from './constants.ts';
import InputField from './components/InputField.tsx';
import SelectField from './components/SelectField.tsx';
import FeeDisplay from './components/FeeDisplay.tsx';
import ToggleSwitch from './components/ToggleSwitch.tsx';

const INITIAL_STATE = {
    plotArea: '100',
    builtUpArea: '150',
    dwellingUnits: '1',
    tempSheds: '0',
    tempRccArea: '0',
    purchasableFarCost: '0',
    projectBefore2018: false,
};


const App: React.FC = () => {
    // Theme state
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme) return storedTheme;
            const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
            if (userMedia.matches) return 'dark';
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    // Input State
    const [occupancyId, setOccupancyId] = useState<string>('');
    const [subOccupancyId, setSubOccupancyId] = useState<string>('');
    const [plotArea, setPlotArea] = useState<string>(INITIAL_STATE.plotArea);
    const [builtUpArea, setBuiltUpArea] = useState<string>(INITIAL_STATE.builtUpArea);
    const [dwellingUnits, setDwellingUnits] = useState<string>(INITIAL_STATE.dwellingUnits);
    const [tempSheds, setTempSheds] = useState<string>(INITIAL_STATE.tempSheds);
    const [tempRccArea, setTempRccArea] = useState<string>(INITIAL_STATE.tempRccArea);
    const [purchasableFarCost, setPurchasableFarCost] = useState<string>(INITIAL_STATE.purchasableFarCost);
    const [projectBefore2018, setProjectBefore2018] = useState<boolean>(INITIAL_STATE.projectBefore2018);

    // Derived State
    const [subOccupancies, setSubOccupancies] = useState<SubOccupancy[]>([]);
    const [selectedSubOccupancy, setSelectedSubOccupancy] = useState<SubOccupancy | null>(null);

    // Output State
    const [fees, setFees] = useState<CalculatedFees | null>(null);

    const handleOccupancyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newOccupancyId = e.target.value;
        setOccupancyId(newOccupancyId);
        setSubOccupancyId('');
        setSelectedSubOccupancy(null);
        const newSubOccupancies = OCCUPANCY_DATA.find(o => o.id === newOccupancyId)?.subOccupancies || [];
        setSubOccupancies(newSubOccupancies);
        if (newSubOccupancies.length > 0) {
            setSubOccupancyId(newSubOccupancies[0].id);
        }
    };
    
    const handleSubOccupancyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSubOccupancyId(e.target.value);
    };

    const resetForm = useCallback(() => {
        setPlotArea(INITIAL_STATE.plotArea);
        setBuiltUpArea(INITIAL_STATE.builtUpArea);
        setDwellingUnits(INITIAL_STATE.dwellingUnits);
        setTempSheds(INITIAL_STATE.tempSheds);
        setTempRccArea(INITIAL_STATE.tempRccArea);
        setPurchasableFarCost(INITIAL_STATE.purchasableFarCost);
        setProjectBefore2018(INITIAL_STATE.projectBefore2018);

        // Reset occupancy and sub-occupancy to the first available option
        if (OCCUPANCY_DATA.length > 0) {
            const firstOccupancy = OCCUPANCY_DATA[0];
            setOccupancyId(firstOccupancy.id);
            const firstSubOccupancies = firstOccupancy.subOccupancies || [];
            setSubOccupancies(firstSubOccupancies);
            if (firstSubOccupancies.length > 0) {
                setSubOccupancyId(firstSubOccupancies[0].id);
            } else {
                setSubOccupancyId('');
            }
        }
    }, []);

    const calculateFees = useCallback(() => {
        if (!selectedSubOccupancy) return;

        const pArea = parseFloat(plotArea) || 0;
        const bArea = parseFloat(builtUpArea) || 0;
        const dUnits = parseInt(dwellingUnits, 10) || 0;
        const tSheds = parseInt(tempSheds, 10) || 0;
        const tRccArea = parseFloat(tempRccArea) || 0;
        const pFarCost = parseFloat(purchasableFarCost) || 0;
        
        // A) Scrutiny Fees
        const landDevelopment = pArea * FEE_RATES.LAND_DEVELOPMENT;
        let buildingOperation = 0;
        if (bArea <= 100) {
            buildingOperation = 250;
        } else if (bArea <= 300) {
            buildingOperation = 250 + (bArea - 100) * 15;
        } else {
            buildingOperation = 250 + (200 * 15) + (bArea - 300) * 10;
        }
        const scrutinySubtotal = landDevelopment + buildingOperation;

        // B) Permit Fees
        const sanction = bArea * selectedSubOccupancy.sanctionFeeRate;
        const cwwc = bArea * FEE_RATES.CWWC;
        const shelter = 0; // Formula not provided, kept as 0
        const temporaryRetention = (tSheds * FEE_RATES.TEMP_SHED) + (tRccArea * FEE_RATES.TEMP_RCC);
        const securityDeposit = selectedSubOccupancy.eligibleForSecurityDeposit ? bArea * FEE_RATES.SECURITY_DEPOSIT : 0;
        const purchasableFAR = pFarCost;
        const eidp = projectBefore2018 
            ? cwwc * FEE_RATES.EIDP_CWWC_PERCENTAGE_BEFORE_2018
            : cwwc * FEE_RATES.EIDP_CWWC_PERCENTAGE_2018_ONWARDS;
        const permitSubtotal = sanction + cwwc + shelter + temporaryRetention + securityDeposit + purchasableFAR + eidp;

        const total = scrutinySubtotal + permitSubtotal;

        setFees({
            landDevelopment,
            buildingOperation,
            scrutinySubtotal,
            sanction,
            cwwc,
            shelter,
            temporaryRetention,
            securityDeposit,
            purchasableFAR,
            eidp,
            permitSubtotal,
            total,
        });

    }, [selectedSubOccupancy, plotArea, builtUpArea, dwellingUnits, tempSheds, tempRccArea, purchasableFarCost, projectBefore2018]);

    useEffect(() => {
        const foundSubOccupancy = subOccupancies.find(so => so.id === subOccupancyId) || null;
        setSelectedSubOccupancy(foundSubOccupancy);
    }, [subOccupancyId, subOccupancies]);

    useEffect(() => {
        // Auto-select first occupancy on load
        if(!occupancyId && OCCUPANCY_DATA.length > 0) {
            const firstOccupancy = OCCUPANCY_DATA[0];
            setOccupancyId(firstOccupancy.id);
            setSubOccupancies(firstOccupancy.subOccupancies);
            if (firstOccupancy.subOccupancies.length > 0) {
                setSubOccupancyId(firstOccupancy.subOccupancies[0].id);
            }
        }
    }, [occupancyId]);

    useEffect(() => {
        calculateFees();
    }, [calculateFees]);


    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg font-sans text-light-text dark:text-dark-text">
            <header className="bg-light-card dark:bg-dark-card shadow-sm">
                <div className="max-w-screen-xl mx-auto py-4 px-4 sm:px-6">
                   <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold leading-tight text-accent">Building Permit Fee Estimator</h1>
                            <p className="text-sm text-light-secondary dark:text-dark-secondary mt-1">An easy-to-use tool for estimating building approval costs for SUJOG Odisha.</p>
                        </div>
                        <button 
                            onClick={toggleTheme} 
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent bg-light-bg dark:bg-dark-bg"
                        >
                            {theme === 'light' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-light-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-dark-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            )}
                        </button>
                   </div>
                </div>
            </header>
            <main className="max-w-screen-xl mx-auto py-4 px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    
                    <div className="lg:col-span-2">
                        <div className="bg-light-card dark:bg-dark-card p-5 rounded-lg shadow-lg space-y-4">
                            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">Project Details</h2>
                            
                            <div className="grid grid-cols-1 gap-4">
                               <SelectField label="Occupancy" id="occupancy" value={occupancyId} onChange={handleOccupancyChange} options={OCCUPANCY_DATA} />
                               <SelectField label="Sub-Occupancy" id="subOccupancy" value={subOccupancyId} onChange={handleSubOccupancyChange} options={subOccupancies} disabled={!occupancyId} />
                            </div>
                            
                            <hr className="border-light-border dark:border-dark-border" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="Plot Area" id="plotArea" value={plotArea} onChange={e => setPlotArea(e.target.value)} unit="sqm" />
                                <InputField label="Built-up Area (BUA)" id="builtUpArea" value={builtUpArea} onChange={e => setBuiltUpArea(e.target.value)} unit="sqm" />
                                {selectedSubOccupancy?.requiresDwellingUnits && (
                                     <InputField label="Dwelling Units" id="dwellingUnits" value={dwellingUnits} onChange={e => setDwellingUnits(e.target.value)} unit="units" />
                                )}
                            </div>

                             <hr className="border-light-border dark:border-dark-border" />
                             <h3 className="text-lg font-semibold text-light-secondary dark:text-dark-secondary pt-1">Additional Fees</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="Temp. Sheds" id="tempSheds" value={tempSheds} onChange={e => setTempSheds(e.target.value)} unit="units" />
                                <InputField label="Temp. RCC Area" id="tempRccArea" value={tempRccArea} onChange={e => setTempRccArea(e.target.value)} unit="sqm" />
                                <InputField label="Purchasable FAR Cost" id="purchasableFarCost" value={purchasableFarCost} onChange={e => setPurchasableFarCost(e.target.value)} unit="₹" />
                                <div className="sm:col-span-2">
                                     <ToggleSwitch label="Project before 2018" enabled={projectBefore2018} setEnabled={setProjectBefore2018} />
                                </div>
                             </div>

                             <div className="mt-6 pt-4 border-t border-light-border dark:border-dark-border">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="w-full py-2 px-4 border border-light-border dark:border-dark-border text-sm font-medium rounded-md text-light-secondary dark:text-dark-secondary hover:bg-light-border/40 dark:hover:bg-dark-border/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
                                >
                                    Reset Form
                                </button>
                            </div>

                        </div>
                    </div>

                    <div className="lg:col-span-3">
                       <FeeDisplay fees={fees} shelterFeeApplicable={(parseInt(dwellingUnits, 10) || 0) > 8 && selectedSubOccupancy?.requiresDwellingUnits === true} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;