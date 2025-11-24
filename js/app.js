const { useState, useEffect, useMemo, useContext, createContext } = React;

// --- THEME CONTEXT ---
const ThemeContext = createContext();

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
    const [svgString, setSvgString] = useState("");

    useEffect(() => {
        if (window.lucide && window.lucide.icons) {
            // Convert kebab-case (e.g. "trending-up") to PascalCase (e.g. "TrendingUp")
            const pascalName = name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');

            const iconNode = window.lucide.icons[pascalName];

            if (iconNode) {
                const svg = iconNode.toSvg({
                    class: className,
                    width: size,
                    height: size,
                    "stroke-width": 2
                });
                setSvgString(svg);
            } else {
                console.warn(`Icon not found: ${name} -> ${pascalName}`);
            }
        }
    }, [name, size, className]);

    if (!svgString) return <span style={{ width: size, height: size, display: 'inline-block' }}></span>;

    return <span dangerouslySetInnerHTML={{ __html: svgString }} style={{ display: 'inline-flex', alignItems: 'center' }} />;
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
                    <Icon name="sliders-horizontal" size={18} /> Parámetros de Inversión
                </h3>
                <InputField label="Inversión Inicial" value={initial} onChange={setInitial} iconName="dollar-sign" />
                <InputField label="Aportación Mensual" value={monthly} onChange={setMonthly} iconName="wallet" />
                <InputField label="Retorno Anual Estimado" value={rate} onChange={setRate} iconName="percent" suffix="%" tooltipText="La media histórica del S&P500 es aprox 8-10%." />
                <InputField label="Horizonte Temporal" value={years} onChange={setYears} iconName="calendar" suffix="Años" />
            </div>

            <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 flex flex-col justify-center space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Proyección de Patrimonio</h3>
                <ResultCard title="Capital Final" value={`$${result.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} highlight={true} colorClass="blue" />

                <div className="grid grid-cols-2 gap-4">
                    <ResultCard title="Tus Aportaciones" value={`$${result.totalContributed.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
                    <ResultCard title="Beneficio Generado" value={`$${result.interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} subtitle="Efecto Bola de Nieve" highlight={true} colorClass="green" />
                </div>

                <div className="mt-6">
                    <div className="flex justify-between text-xs mb-2 text-gray-500 dark:text-gray-400 font-medium">
                        <span>Principal ($ {result.totalContributed.toLocaleString()})</span>
                        <span>Interés ($ {result.interest.toLocaleString()})</span>
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

// --- CALCULADORA 2: SALARIO NETO (NUEVA) ---
const NetSalaryCalc = () => {
    const [grossSalary, setGrossSalary] = useState(50000);
    const [taxRate, setTaxRate] = useState(20);
    const [deductions, setDeductions] = useState(0);
    const [payments, setPayments] = useState(12);

    const result = useMemo(() => {
        const taxable = Math.max(0, grossSalary - deductions);
        const taxAmount = taxable * (taxRate / 100);
        const netAnnual = grossSalary - taxAmount;
        const netMonthly = netAnnual / payments;
        return { netAnnual, netMonthly, taxAmount };
    }, [grossSalary, taxRate, deductions, payments]);

    return (
        <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <Icon name="banknote" size={18} /> Datos Salariales
                </h3>
                <InputField label="Salario Bruto Anual" value={grossSalary} onChange={setGrossSalary} iconName="dollar-sign" />
                <InputField label="Tasa de Impuestos Global" value={taxRate} onChange={setTaxRate} iconName="percent" suffix="%" />
                <InputField
                    label="Deducciones (SS, Aportaciones...)"
                    value={deductions}
                    onChange={setDeductions}
                    iconName="minus-circle"
                    tooltipText="Gastos que reducen tu base imponible: Seguridad Social, planes de pensiones, etc."
                    helpText="Introduce el total anual que se resta antes de aplicar impuestos."
                />
                <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Número de Pagas</label>
                    <div className="flex gap-4">
                        <button onClick={() => setPayments(12)} className={`flex-1 py-2 rounded-lg border transition-colors ${payments === 12 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600'}`}>12 Pagas</button>
                        <button onClick={() => setPayments(14)} className={`flex-1 py-2 rounded-lg border transition-colors ${payments === 14 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600'}`}>14 Pagas</button>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 flex flex-col justify-center space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Tu Salario Neto</h3>
                <ResultCard title="Salario Neto Anual" value={`$${result.netAnnual.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} highlight={true} colorClass="green" />
                <ResultCard title={`Salario Neto Mensual (${payments} pagas)`} value={`$${result.netMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} highlight={true} colorClass="blue" />
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-red-800 dark:text-red-300">Impuestos Estimados</span>
                        <span className="font-bold text-red-800 dark:text-red-300">$ {result.taxAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- CALCULADORA 3: FIRE ---
const FireCalc = () => {
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
                        <span><strong>Consejo Pro:</strong> La independencia financiera se logra cuando tus inversiones cubren tus gastos.</span>
                    </p>
                </div>

                <InputField label="Gastos Anuales Necesarios" value={annualSpend} onChange={setAnnualSpend} iconName="dollar-sign" />
                <InputField label="Patrimonio Actual" value={currentSavings} onChange={setCurrentSavings} iconName="briefcase" />
                <InputField label="Ahorro Mensual" value={monthlySavings} onChange={setMonthlySavings} iconName="coins" />

                <InputField
                    label="Retorno Anual Esperado (Real)"
                    value={roi}
                    onChange={setRoi}
                    iconName="percent"
                    suffix="%"
                    tooltipText="Rentabilidad media de la bolsa (8%) menos Inflación media (3%) = 5%. Usar un valor entre 4% y 6% es prudente."
                    helpText="* Este es el retorno descontando la inflación. Es clave para calcular tu poder adquisitivo real futuro."
                />
            </div>

            <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Tu Ruta a la Libertad (FIRE)</h3>

                <ResultCard
                    title="Tu Número de Libertad"
                    value={`$${result.fireNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    highlight={true}
                    colorClass="purple"
                    subtitle={`Objetivo para vivir con el ${withdrawalRate}% anual`}
                />

                <div className="mt-6 p-5 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Tiempo estimado para jubilarte</p>
                    <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
                        {result.years >= 99 ? "Nunca (Aumenta tu ahorro)" : `${result.years} Años`}
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- CALCULADORA 4: SIMULADOR DE PENSIÓN / RETIRO ---
const RetirementCalc = () => {
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
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Calcula cuánto durarán tus ahorros complementando tu pensión pública.</p>
                <InputField label="Ahorro Acumulado al Jubilarse" value={savings} onChange={setSavings} iconName="landmark" />
                <InputField label="Gasto Mensual Deseado" value={monthlySpend} onChange={setMonthlySpend} iconName="credit-card" />
                <InputField label="Pensión Pública Estimada" value={pension} onChange={setPension} iconName="scroll-text" />

                <div className="grid grid-cols-2 gap-4">
                    <InputField label="Inflación Estimada" value={inflation} onChange={setInflation} iconName="trending-up" suffix="%" />
                    <InputField label="Rentabilidad Ahorros" value={investmentReturn} onChange={setInvestmentReturn} iconName="percent" suffix="%" tooltipText="En fase de retiro, se recomienda ser conservador (2-5%)." />
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Longevidad de tus Ahorros</h3>

                <ResultCard
                    title="Déficit Mensual a Cubrir"
                    value={`$${Math.max(0, monthlySpend - pension).toLocaleString()}`}
                    subtitle="Dinero que debe salir de tus ahorros cada mes"
                />

                <div className={`mt-6 p-6 rounded-xl border ${result.sustainable ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'}`}>
                    <p className="font-medium mb-1">El dinero te durará:</p>
                    <p className="text-4xl font-bold">
                        {result.years} Años
                    </p>
                    <p className="text-xs mt-2 opacity-80">
                        {result.sustainable
                            ? "¡Enhorabuena! Tus ahorros cubren un retiro estándar."
                            : "Precaución: Podrías quedarte sin fondos en vida."}
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

    const tabs = [
        { id: 'compound', label: 'Interés Compuesto', icon: 'trending-up' },
        { id: 'salary', label: 'Salario Neto', icon: 'banknote' }, // NUEVO
        { id: 'fire', label: 'Calculadora FIRE', icon: 'flame' },
        { id: 'pension', label: 'Duración Pensión', icon: 'hourglass' },
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
        compound: "Calculadora de Interés Compuesto",
        salary: "Calculadora de Salario Neto", // NUEVO
        fire: "Simulador de Independencia Financiera (FIRE)",
        pension: "Simulador de Retiro y Longevidad"
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
            </header>

            {/* Main Content */}
            <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">

                <section className="mb-8 md:mb-12 text-center max-w-2xl mx-auto fade-in">
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                        {titles[activeTab]}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Herramientas profesionales gratuitas para tomar el control de tu futuro financiero.
                    </p>
                </section>

                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-200 dark:border-slate-800 p-6 md:p-10 fade-in">
                    {renderContent()}
                </div>

                {/* SEO Content Block */}
                <article className="mt-16 prose prose-lg prose-blue dark:prose-invert max-w-4xl mx-auto">
                    <h2>¿Por qué utilizar simuladores financieros?</h2>
                    <p>
                        La planificación financiera requiere precisión. Nuestras calculadoras utilizan fórmulas matemáticas estándar del sector para ofrecerte:
                    </p>
                    <ul>
                        <li><strong>Proyecciones Realistas:</strong> Incorporando variables como la inflación y el retorno real.</li>
                        <li><strong>Privacidad Total:</strong> Los cálculos se realizan en tu navegador. Ningún dato se envía a servidores.</li>
                        <li><strong>Claridad:</strong> Visualiza el impacto del interés compuesto y el ahorro sistemático.</li>
                    </ul>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 not-prose mt-8">
                        <h3 className="text-blue-800 dark:text-blue-300 font-bold text-lg mb-2">Nota sobre el "Retorno Real"</h3>
                        <p className="text-blue-700 dark:text-blue-200 text-sm">
                            En finanzas, el enemigo silencioso es la inflación. Cuando calcules tu jubilación o FIRE, utiliza siempre el
                            <strong> retorno real</strong> (Retorno Inversión - Inflación). Por ejemplo, si esperas ganar un 8% en bolsa y la inflación es del 3%, tu capacidad de compra crecerá solo un 5%.
                        </p>
                    </div>
                </article>

            </main>

            <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 mt-20 transition-colors">
                <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="mb-4 md:mb-0">
                        <span className="font-bold text-gray-900 dark:text-white text-lg">FinanzasMaster</span>
                        <p className="mt-1">Empoderando tus decisiones financieras.</p>
                    </div>
                    <div className="flex gap-6">
                        <a href="privacy.html" className="hover:text-blue-600 transition-colors">Privacidad</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const App = () => (
    <ThemeProvider>
        <AppContent />
    </ThemeProvider>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
