

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
        {label && <label className="text-[10px] font-bold text-neutral-500 uppercase print:text-black">{label}</label>}
        <div className="relative">
            {prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 text-xs print:text-black">{prefix}</span>}
            <input
                type="number"
                value={value}
                step={step}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                className={`w-full bg-neutral-50 border border-neutral-300 rounded-lg py-1.5 text-sm font-mono focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-all print:bg-white print:border-none print:pl-0 ${prefix ? 'pl-6' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'}`}
            />
            {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 text-xs print:text-black">{suffix}</span>}
        </div>
    </div>
);
