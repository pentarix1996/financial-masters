import React, { useState, useEffect, useMemo, useContext, createContext } from 'react';
import * as LucideIcons from 'lucide-react';

import { translations } from './translations';
import AdBanner from './components/AdBanner';

// --- THEME & LANGUAGE CONTEXT ---
const ThemeContext = createContext();
const LanguageContext = createContext();

const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('es');

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            if (saved) return saved;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// --- COMPONENTS ---

const Icon = ({ name, size = 20, className = "" }) => {
    // Convert kebab-case to PascalCase for Lucide
    const pascalName = name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');

    // Access icons from the imported object
    const IconComponent = LucideIcons[pascalName];

    if (!IconComponent) {
        console.warn(`Icon not found: ${name} -> ${pascalName}`);
        return <span style={{ width: size, height: size, display: 'inline-block' }}></span>;
    }

    return <IconComponent size={size} className={className} strokeWidth={2} />;
};

const Tooltip = ({ text }) => (
    <div className="group relative inline-block ml-2 cursor-help">
        <Icon name="info" size={16} className="text-gray-400 hover:text-blue-500 transition-colors" />
        <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg py-2 px-3 z-50 transition-all shadow-xl text-center pointer-events-none">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
        </div>
    </div>
);

const InputField = ({ label, value, onChange, type = "number", iconName, suffix, tooltipText, helpText }) => (
    <div className="mb-5">
        <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {label}
            {tooltipText && <Tooltip text={tooltipText} />}
        </label>
        <div className="relative rounded-lg shadow-sm">
            {iconName && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name={iconName} className="text-gray-400" size={18} />
                </div>
            )}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                className={`block w-full rounded-lg border-gray-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 py-3 
                ${iconName ? 'pl-10' : 'pl-3'} ${suffix ? 'pr-12' : 'pr-3'} 
                border bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors`}
                placeholder="0"
            />
            {suffix && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">{suffix}</span>
                </div>
            )}
        </div>
        {helpText && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>}
    </div>
);

const ResultCard = ({ title, value, subtitle, highlight = false, colorClass = "blue" }) => {
    const colors = {
        blue: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
        green: "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
        purple: "text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
        default: "text-gray-900 dark:text-white bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700"
    };

    const styleClass = highlight ? colors[colorClass] : colors.default;

    return (
        <div className={`p-5 rounded-xl border shadow-sm fade-in ${styleClass}`}>
            <p className="text-xs font-bold uppercase tracking-wide opacity-70 mb-1">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="text-xs opacity-70 mt-2">{subtitle}</p>}
        </div>
    );
};

// --- CALCULADORA 1: INTERÉS COMPUESTO ---
const CompoundInterest = () => {
    const { t } = useContext(LanguageContext);
    const [initial, setInitial] = useState(1000);
    const [monthly, setMonthly] = useState(200);
    const [rate, setRate] = useState(7);
    const [years, setYears] = useState(10);

    const result = useMemo(() => {
        let total = initial;
        let totalContributed = initial;
        const monthlyRate = (rate / 100) / 12;
        const months = years * 12;

        for (let i = 1; i <= months; i++) {
            total = total * (1 + monthlyRate) + monthly;
            totalContributed += monthly;
        }

        return { total, totalContributed, interest: total - totalContributed };
    }, [initial, monthly, rate, years]);

    return (
        <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <Icon name="sliders-horizontal" size={18} /> {t('investmentParams')}
                </h3>
                <InputField label={t('initialInvestment')} value={initial} onChange={setInitial} iconName="dollar-sign" />
                <InputField label={t('monthlyContribution')} value={monthly} onChange={setMonthly} iconName="wallet" />
                <InputField label={t('annualReturn')} value={rate} onChange={setRate} iconName="percent" suffix="%" tooltipText={t('sp500Tooltip')} />
                <InputField label={t('timeHorizon')} value={years} onChange={setYears} iconName="calendar" suffix={t('years')} />
            </div>

            <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 flex flex-col justify-center space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t('wealthProjection')}</h3>
                <ResultCard title={t('finalCapital')} value={`$${result.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} highlight={true} colorClass="blue" />

                <div className="grid grid-cols-2 gap-4">
                    <ResultCard title={t('yourContributions')} value={`$${result.totalContributed.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
                    <ResultCard title={t('generatedProfit')} value={`$${result.interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} subtitle={t('snowballEffect')} highlight={true} colorClass="green" />
                </div>

                <div className="mt-6">
                    <div className="flex justify-between text-xs mb-2 text-gray-500 dark:text-gray-400 font-medium">
                        <span>{t('principal')} ($ {result.totalContributed.toLocaleString()})</span>
                        <span>{t('interest')} ($ {result.interest.toLocaleString()})</span>
                    </div>
                    <div className="w-full h-6 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                        <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(result.totalContributed / result.total) * 100}%` }}></div>
                        <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${(result.interest / result.total) * 100}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- CALCULADORA 2: SALARIO NETO (IRPF ESPAÑA 2025) ---
const NetSalaryCalc = () => {
    const { t } = useContext(LanguageContext);
    // Estado General
    const [grossSalary, setGrossSalary] = useState(30000);
    const [payments, setPayments] = useState(12);
    const [age, setAge] = useState(30);
    const [disability, setDisability] = useState(0); // 0, 33, 65
    const [familySituation, setFamilySituation] = useState("single"); // single, married, divorced, widowed

    // Estado Dependientes
    const [dependents, setDependents] = useState([]);
    const [showDependentForm, setShowDependentForm] = useState(false);
    const [editingId, setEditingId] = useState(null); // ID of dependent being edited
    const [newDependent, setNewDependent] = useState({ age: 0, type: 'descendant', disability: 0 });

    // Constantes y Ayudantes de Cálculo
    const calculateIRPF = useMemo(() => {
        // 1. Seguridad Social (6.48% total trabajador)
        // Contingencias comunes (4.7%) + Desempleo (1.55% general) + FP (0.1%) + MEI (0.13% aprox) -> Usamos 6.48% como media estándar
        const socialSecurity = grossSalary * 0.0648;
        const netIncome = grossSalary - socialSecurity - 2000; // 2000€ reducción general gastos deducibles

        if (netIncome <= 0) return { netAnnual: grossSalary - socialSecurity, netMonthly: (grossSalary - socialSecurity) / payments, taxAmount: 0, socialSecurity, retentionRate: 0 };

        // 2. Mínimos Personales y Familiares
        let personalMin = 5550;

        // Por edad del contribuyente
        if (age > 65) personalMin += 1150;
        if (age > 75) personalMin += 1400;

        // Por discapacidad del contribuyente
        if (disability >= 33 && disability < 65) personalMin += 3000;
        if (disability >= 65) personalMin += 9000 + 3000; // +3000 asistencia

        // Por descendientes y ascendientes
        let familyMin = 0;
        let descendantsCount = 0;

        dependents.forEach(dep => {
            if (dep.type === 'descendant') {
                descendantsCount++;
                let amount = 0;
                if (descendantsCount === 1) amount = 2400;
                else if (descendantsCount === 2) amount = 2700;
                else if (descendantsCount === 3) amount = 4000;
                else amount = 4500;

                if (dep.age < 3) amount += 2800;
                familyMin += amount;
            } else if (dep.type === 'ascendant') {
                let amount = 1150;
                if (dep.age > 75) amount += 1400;
                familyMin += amount;
            }

            // Discapacidad del dependiente
            if (dep.disability >= 33 && dep.disability < 65) familyMin += 3000;
            if (dep.disability >= 65) familyMin += 9000 + 3000;
        });

        // Situación familiar (Tributación conjunta no simulada aquí, asumimos individual optimizada o monoparental)
        // En este simulador simplificado, la situación familiar afecta principalmente si hay declaración conjunta, 
        // pero para el cálculo de retenciones (que es lo que busca el usuario), se usan estos mínimos.

        const totalMin = personalMin + familyMin;

        // 3. Tramos IRPF (Estatal + Autonómico aproximado 50/50)
        // Escala general 2024/2025 (simplificada para simulación)
        const brackets = [
            { limit: 12450, rate: 0.19 },
            { limit: 20200, rate: 0.24 },
            { limit: 35200, rate: 0.30 },
            { limit: 60000, rate: 0.37 },
            { limit: 300000, rate: 0.45 },
            { limit: Infinity, rate: 0.47 }
        ];

        const calculateQuota = (amount) => {
            let quota = 0;
            let remaining = amount;
            let prevLimit = 0;

            for (let bracket of brackets) {
                if (remaining <= 0) break;
                const taxableAtThisBracket = Math.min(remaining, bracket.limit - prevLimit);
                quota += taxableAtThisBracket * bracket.rate;
                remaining -= taxableAtThisBracket;
                prevLimit = bracket.limit;
            }
            return quota;
        };

        const quotaIntegra = calculateQuota(netIncome);
        const quotaMinimos = calculateQuota(totalMin);

        // Cuota líquida (Impuesto final)
        const taxAmount = Math.max(0, quotaIntegra - quotaMinimos);
        const netAnnual = grossSalary - socialSecurity - taxAmount;
        const netMonthly = netAnnual / payments;
        const retentionRate = (taxAmount / grossSalary) * 100;

        return { netAnnual, netMonthly, taxAmount, socialSecurity, retentionRate };

    }, [grossSalary, payments, age, disability, dependents]);

    // Handlers
    const addDependent = () => {
        if (editingId) {
            setDependents(dependents.map(dep => dep.id === editingId ? { ...newDependent, id: editingId } : dep));
            setEditingId(null);
        } else {
            setDependents([...dependents, { ...newDependent, id: Date.now() }]);
        }
        setNewDependent({ age: 0, type: 'descendant', disability: 0 });
        setShowDependentForm(false);
    };

    const editDependent = (dep) => {
        setNewDependent({ ...dep });
        setEditingId(dep.id);
        setShowDependentForm(true);
    };

    const removeDependent = (id) => {
        setDependents(dependents.filter(d => d.id !== id));
    };

    const cancelEdit = () => {
        setNewDependent({ age: 0, type: 'descendant', disability: 0 });
        setEditingId(null);
        setShowDependentForm(false);
    };

    return (
        <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Icon name="user" size={18} /> {t('personalData')}
                    </h3>
                    <InputField label={t('grossAnnualSalary')} value={grossSalary} onChange={setGrossSalary} iconName="dollar-sign" />

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <InputField label={t('age')} value={age} onChange={setAge} iconName="calendar" />
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('numPayments')}</label>
                            <select
                                value={payments}
                                onChange={(e) => setPayments(Number(e.target.value))}
                                className="w-full rounded-lg border-gray-300 dark:border-slate-600 py-3 px-3 border bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            >
                                <option value={12}>{t('payments12')}</option>
                                <option value={14}>{t('payments14')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('familySituation')}</label>
                            <select
                                value={familySituation}
                                onChange={(e) => setFamilySituation(e.target.value)}
                                className="w-full rounded-lg border-gray-300 dark:border-slate-600 py-3 px-3 border bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            >
                                <option value="single">{t('single')}</option>
                                <option value="married">{t('married')}</option>
                                <option value="divorced">{t('divorced')}</option>
                                <option value="widowed">{t('widowed')}</option>
                            </select>
                        </div>
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('disability')}</label>
                            <select
                                value={disability}
                                onChange={(e) => setDisability(Number(e.target.value))}
                                className="w-full rounded-lg border-gray-300 dark:border-slate-600 py-3 px-3 border bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            >
                                <option value={0}>{t('noDisability')}</option>
                                <option value={33}>{t('disability33')}</option>
                                <option value={65}>{t('disability65')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Icon name="users" size={18} /> {t('dependents')}
                    </h3>

                    {dependents.length > 0 && (
                        <div className="mb-4 space-y-2">
                            {dependents.map(dep => (
                                <div key={dep.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                    <div className="text-sm">
                                        <span className="font-bold">{dep.type === 'descendant' ? t('child') : t('parent')}</span>
                                        <span className="mx-2 text-gray-400">|</span>
                                        <span>{dep.age} {t('years')}</span>
                                        {dep.disability > 0 && <span className="ml-2 text-blue-600 text-xs bg-blue-100 px-2 py-0.5 rounded-full">{t('discAbbr')} {dep.disability}%</span>}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => editDependent(dep)} className="text-blue-500 hover:text-blue-700">
                                            <Icon name="pencil" size={16} />
                                        </button>
                                        <button onClick={() => removeDependent(dep.id)} className="text-red-500 hover:text-red-700">
                                            <Icon name="trash-2" size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!showDependentForm ? (
                        <button
                            onClick={() => setShowDependentForm(true)}
                            className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                        >
                            <Icon name="plus" size={16} /> {t('addDependent')}
                        </button>
                    ) : (
                        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="text-xs font-semibold block mb-1 text-gray-700 dark:text-gray-300">{t('type')}</label>
                                    <select
                                        value={newDependent.type}
                                        onChange={(e) => setNewDependent({ ...newDependent, type: e.target.value })}
                                        className="w-full rounded border-gray-300 dark:border-slate-600 text-sm py-1.5 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="descendant">{t('descendant')}</option>
                                        <option value="ascendant">{t('ascendant')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold block mb-1 text-gray-700 dark:text-gray-300">{t('age')}</label>
                                    <input
                                        type="number"
                                        value={newDependent.age}
                                        onChange={(e) => setNewDependent({ ...newDependent, age: Number(e.target.value) })}
                                        className="w-full rounded border-gray-300 dark:border-slate-600 text-sm py-1.5 px-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="text-xs font-semibold block mb-1 text-gray-700 dark:text-gray-300">{t('disability')}</label>
                                <select
                                    value={newDependent.disability}
                                    onChange={(e) => setNewDependent({ ...newDependent, disability: Number(e.target.value) })}
                                    className="w-full rounded border-gray-300 dark:border-slate-600 text-sm py-1.5 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                >
                                    <option value={0}>{t('noDisability')}</option>
                                    <option value={33}>{t('disability33')}</option>
                                    <option value={65}>{t('disability65')}</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={addDependent} className="flex-1 bg-blue-600 text-white py-1.5 rounded text-sm hover:bg-blue-700">
                                    {editingId ? t('update') : t('save')}
                                </button>
                                <button onClick={cancelEdit} className="flex-1 bg-gray-200 text-gray-700 py-1.5 rounded text-sm hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600">
                                    {t('cancel')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 flex flex-col justify-center space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t('estimatedNetSalary')}</h3>
                <ResultCard title={t('netAnnualSalary')} value={`$${calculateIRPF.netAnnual.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} highlight={true} colorClass="green" />
                <ResultCard title={`${t('netMonthlySalary')} (${payments} ${t('numPayments').toLowerCase().replace('nº ', '')})`} value={`$${calculateIRPF.netMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} highlight={true} colorClass="blue" />

                <div className="mt-4 space-y-3">
                    <div className="flex justify-between items-center text-sm p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800/30">
                        <span className="text-red-800 dark:text-red-300">{t('irpfRetention')} {calculateIRPF.retentionRate.toFixed(1)}%)</span>
                        <span className="font-bold text-red-800 dark:text-red-300">$ {calculateIRPF.taxAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800/30">
                        <span className="text-orange-800 dark:text-orange-300">{t('socialSecurity')} (6.48%)</span>
                        <span className="font-bold text-orange-800 dark:text-orange-300">$ {calculateIRPF.socialSecurity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                        <strong>{t('note')}:</strong> {t('salaryNote')}
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- CALCULADORA 3: FIRE ---
const FireCalc = () => {
    const { t } = useContext(LanguageContext);
    const [annualSpend, setAnnualSpend] = useState(24000);
    const [currentSavings, setCurrentSavings] = useState(10000);
    const [monthlySavings, setMonthlySavings] = useState(1000);
    const [roi, setRoi] = useState(5);
    const [withdrawalRate, setWithdrawalRate] = useState(4);

    const result = useMemo(() => {
        const fireNumber = annualSpend / (withdrawalRate / 100);
        let months = 0;
        let balance = currentSavings;
        const monthlyRate = Math.pow(1 + roi / 100, 1 / 12) - 1;

        if (monthlySavings <= 0 && currentSavings < fireNumber) return { fireNumber, years: 999 };
        if (balance >= fireNumber) return { fireNumber, years: 0 };

        while (balance < fireNumber && months < 1200) {
            balance = balance * (1 + monthlyRate) + monthlySavings;
            months++;
        }
        return { fireNumber, years: (months / 12).toFixed(1) };
    }, [annualSpend, currentSavings, monthlySavings, roi, withdrawalRate]);

    return (
        <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-2">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-100 dark:border-yellow-800 mb-4">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 flex gap-2">
                        <Icon name="lightbulb" size={16} />
                        <span><strong>{t('proTip')}:</strong> {t('fireTip')}</span>
                    </p>
                </div>

                <InputField label={t('annualExpenses')} value={annualSpend} onChange={setAnnualSpend} iconName="dollar-sign" />
                <InputField label={t('currentNetWorth')} value={currentSavings} onChange={setCurrentSavings} iconName="briefcase" />
                <InputField label={t('monthlySavings')} value={monthlySavings} onChange={setMonthlySavings} iconName="coins" />

                <InputField
                    label={t('realAnnualReturn')}
                    value={roi}
                    onChange={setRoi}
                    iconName="percent"
                    suffix="%"
                    tooltipText={t('realReturnTooltip')}
                    helpText={t('realReturnHelp')}
                />
            </div>

            <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">{t('roadToFreedom')}</h3>

                <ResultCard
                    title={t('freedomNumber')}
                    value={`$${result.fireNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    highlight={true}
                    colorClass="purple"
                    subtitle={`${t('freedomGoal')} ${withdrawalRate}%`}
                />

                <div className="mt-6 p-5 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{t('timeToRetire')}</p>
                    <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
                        {result.years >= 99 ? t('never') : `${result.years} ${t('years')}`}
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- CALCULADORA 4: SIMULADOR DE PENSIÓN / RETIRO ---
const RetirementCalc = () => {
    const { t } = useContext(LanguageContext);
    const [savings, setSavings] = useState(150000);
    const [monthlySpend, setMonthlySpend] = useState(2500);
    const [pension, setPension] = useState(1200);
    const [inflation, setInflation] = useState(3);
    const [investmentReturn, setInvestmentReturn] = useState(4);

    const result = useMemo(() => {
        let currentBalance = savings;
        let currentSpend = monthlySpend;
        let months = 0;

        if (pension >= monthlySpend) return { years: "Infinito", sustainable: true };

        const realReturnMonthly = Math.pow(1 + (investmentReturn - inflation) / 100, 1 / 12) - 1;
        const gap = monthlySpend - pension;

        while (currentBalance > 0 && months < 600) {
            currentBalance = currentBalance * (1 + realReturnMonthly);
            currentBalance -= gap;
            months++;
        }

        const years = (months / 12).toFixed(1);
        return { years: years >= 50 ? "+50" : years, sustainable: months >= 360 };
    }, [savings, monthlySpend, pension, investmentReturn, inflation]);

    return (
        <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('pensionIntro')}</p>
                <InputField label={t('savingsAtRetirement')} value={savings} onChange={setSavings} iconName="landmark" />
                <InputField label={t('desiredMonthlySpend')} value={monthlySpend} onChange={setMonthlySpend} iconName="credit-card" />
                <InputField label={t('estimatedPension')} value={pension} onChange={setPension} iconName="scroll-text" />

                <div className="grid grid-cols-2 gap-4">
                    <InputField label={t('estimatedInflation')} value={inflation} onChange={setInflation} iconName="trending-up" suffix="%" />
                    <InputField label={t('savingsReturn')} value={investmentReturn} onChange={setInvestmentReturn} iconName="percent" suffix="%" tooltipText={t('savingsReturnTooltip')} />
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">{t('savingsLongevity')}</h3>

                <ResultCard
                    title={t('monthlyDeficit')}
                    value={`$${Math.max(0, monthlySpend - pension).toLocaleString()}`}
                    subtitle={t('deficitSubtitle')}
                />

                <div className={`mt-6 p-6 rounded-xl border ${result.sustainable ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'}`}>
                    <p className="font-medium mb-1">{t('moneyWillLast')}</p>
                    <p className="text-4xl font-bold">
                        {result.years} {t('years')}
                    </p>
                    <p className="text-xs mt-2 opacity-80">
                        {result.sustainable
                            ? t('congrats')
                            : t('caution')}
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- APP PRINCIPAL ---
const AppContent = () => {
    const [activeTab, setActiveTab] = useState('compound');
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { t, language, setLanguage } = useContext(LanguageContext);

    const tabs = [
        { id: 'compound', label: t('tabCompound'), icon: 'trending-up' },
        { id: 'salary', label: t('tabSalary'), icon: 'banknote' },
        { id: 'fire', label: t('tabFire'), icon: 'flame' },
        { id: 'pension', label: t('tabPension'), icon: 'hourglass' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'compound': return <CompoundInterest />;
            case 'salary': return <NetSalaryCalc />; // NUEVO
            case 'fire': return <FireCalc />;
            case 'pension': return <RetirementCalc />;
            default: return <CompoundInterest />;
        }
    };

    const titles = {
        compound: t('compoundTitle'),
        salary: t('salaryTitle'),
        fire: t('fireTitle'),
        pension: t('pensionTitle')
    };

    return (
        <div className="min-h-screen flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                <Icon name="calculator" size={24} className="text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                                FinanzasMaster
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-4">
                                <nav className="hidden md:flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === tab.id
                                                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                                }`}
                                        >
                                            <Icon name={tab.icon} size={16} />
                                            {tab.label}
                                        </button>
                                    ))}
                                </nav>

                                <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                                    <button
                                        onClick={() => setLanguage('es')}
                                        className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${language === 'es' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}
                                    >
                                        ES
                                    </button>
                                    <button
                                        onClick={() => setLanguage('en')}
                                        className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${language === 'en' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}
                                    >
                                        EN
                                    </button>
                                </div>

                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 transition-colors"
                                    aria-label="Toggle Dark Mode"
                                >
                                    <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Tabs */}
                    <div className="md:hidden border-t border-gray-100 dark:border-slate-800 overflow-x-auto hide-scroll bg-white dark:bg-slate-900">
                        <div className="flex px-4 py-3 space-x-3 min-w-max">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700'
                                        }`}
                                >
                                    <Icon name={tab.icon} size={14} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">

                <section className="mb-8 md:mb-12 text-center max-w-2xl mx-auto fade-in">
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                        {titles[activeTab]}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        {t('heroSubtitle')}
                    </p>
                </section>

                <div className="flex flex-col xl:flex-row gap-8 items-start">

                    {/* LEFT SIDEBAR - DESKTOP ONLY */}
                    <aside className="hidden xl:block w-[160px] flex-shrink-0 sticky top-24">
                        <div className="text-xs text-center text-gray-400 mb-2">Publicidad</div>
                        <AdBanner
                            slot="4322222107"
                            format="vertical"
                            style={{ minHeight: '600px', width: '160px' }}
                        />
                    </aside>

                    {/* CENTER CONTENT */}
                    <div className="flex-1 w-full min-w-0">

                        {/* MOBILE/TABLET TOP AD (Hidden on Desktop) */}
                        <div className="xl:hidden">
                            <AdBanner
                                slot="4322222107"
                                format="horizontal"
                                style={{ marginBottom: '2rem' }}
                            />
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-200 dark:border-slate-800 p-6 md:p-10 fade-in">
                            {renderContent()}
                        </div>

                        {/* MOBILE/TABLET BOTTOM AD (Hidden on Desktop) */}
                        <div className="xl:hidden">
                            <AdBanner
                                slot="4322222107"
                                format="auto"
                                style={{ margin: '3rem 0' }}
                            />
                        </div>

                        {/* SEO Content Block */}
                        <article className="mt-16 prose prose-lg prose-blue dark:prose-invert max-w-4xl mx-auto">
                            <h2>{t('whySimulators')}</h2>
                            <p>
                                {t('seoText1')}
                            </p>
                            <ul>
                                <li><strong>{t('seoLi1')}:</strong> {t('seoLi1Text')}</li>
                                <li><strong>{t('seoLi2')}:</strong> {t('seoLi2Text')}</li>
                                <li><strong>{t('seoLi3')}:</strong> {t('seoLi3Text')}</li>
                            </ul>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 not-prose mt-8">
                                <h3 className="text-blue-800 dark:text-blue-300 font-bold text-lg mb-2">{t('realReturnNoteTitle')}</h3>
                                <p className="text-blue-700 dark:text-blue-200 text-sm">
                                    {t('realReturnNoteText')}
                                </p>
                            </div>
                        </article>
                    </div>

                    {/* RIGHT SIDEBAR - DESKTOP ONLY */}
                    <aside className="hidden xl:block w-[160px] flex-shrink-0 sticky top-24">
                        <div className="text-xs text-center text-gray-400 mb-2">Publicidad</div>
                        <AdBanner
                            slot="4322222107"
                            format="vertical"
                            style={{ minHeight: '600px', width: '160px' }}
                        />
                    </aside>

                </div>

            </main>

            <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 mt-20 transition-colors">
                <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="mb-4 md:mb-0">
                        <span className="font-bold text-gray-900 dark:text-white text-lg">FinanzasMaster</span>
                        <p className="mt-1">{t('empowering')}</p>
                    </div>
                    <div className="flex gap-6">
                        <a href="privacy.html" className="hover:text-blue-600 transition-colors">{t('privacy')}</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const App = () => {
    return (
        <LanguageProvider>
            <ThemeProvider>
                <AppContent />
            </ThemeProvider>
        </LanguageProvider>
    );
};

export default App;
