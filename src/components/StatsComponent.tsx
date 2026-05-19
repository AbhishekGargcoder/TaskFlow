import type { ComponentType } from 'react';

interface StatsComponentProps {
    value: string | number;
    Icon: ComponentType<{ className?: string }>;
    info: string;
    about: string;
    completionRate?: number | string
}

export default function StatsComponent({ value, Icon, info, about, completionRate }: StatsComponentProps) {
    return (
        <div className="backdrop-blur-xl bg-white/70 border border-white/60 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{info}</span>
                <span className={`p-1 rounded-md ${info === "pending" ? " bg-amber-50 text-amber-600 border border-amber-100" : " bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
                    <Icon className={`w-3.5 h-3.5 ${info === 'pending' ? 'animate-pulse' : ''}`} />
                </span>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">
                {value}
                {completionRate !== undefined && (
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-100/60 px-1 rounded">
                        {completionRate}%
                    </span>
                )}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{about}</p>
        </div>
    )
}