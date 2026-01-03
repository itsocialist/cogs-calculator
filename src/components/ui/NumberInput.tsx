

interface NumberInputProps {
    label?: string;
    value: number;
    onChange: (value: number) => void;
    prefix?: string;
    suffix?: string;
    step?: number;
    className?: string;
}

export const NumberInput = ({ label, value, onChange, prefix = "", suffix = "", step = 1, className = "" }: NumberInputProps) => (
    <div className={`flex flex-col gap-1 ${className}`}>
        {label && <label className="text-[10px] font-bold text-amber-200/60 uppercase tracking-wider print:text-black">{label}</label>}
        <div className="relative">
            {prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-300/60 text-xs font-medium print:text-black">{prefix}</span>}
            <input
                type="number"
                value={value}
                step={step}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                className={`w-full bg-stone-800/60 border border-stone-600/50 rounded-lg py-1.5 text-sm font-mono text-amber-50
                    hover:border-amber-500/40 hover:bg-stone-800/80
                    focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 focus:outline-none focus:bg-stone-800
                    transition-all 
                    print:bg-white print:border-none print:pl-0 print:text-black
                    ${prefix ? 'pl-6' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'}`}
            />
            {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-300/60 text-xs font-medium print:text-black">{suffix}</span>}
        </div>
    </div>
);
