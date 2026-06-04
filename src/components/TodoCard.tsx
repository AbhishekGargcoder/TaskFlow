import { Trash2, Check, ChevronDown, ChevronUp, ExternalLink, Calendar,Copy} from 'lucide-react'
import type { Todo } from '../types';
import { Link ,useNavigate} from 'react-router-dom';
import { useState } from 'react';

interface TodoCardProps {
    todo: Todo;
    handleDeleteTodo: (id: string) => void;
    handleToggleDone: (todo: Todo) => void;
    isExpanded: boolean;
    toggleExpand: (id: string) => void;
}

export default function TodoCard({ todo, handleDeleteTodo, handleToggleDone, isExpanded, toggleExpand }: TodoCardProps) {
    const hasLongDescription = todo.description.length > 95;
    const navigate = useNavigate();

    let [copied,setCopied] = useState(false);

  async function handlecopiedText() {
        const text = todo.description;

        await navigator.clipboard.writeText(text); // async operation
        setCopied(true); // set copied to true immediately after copying
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }

    return (
        <div
            key={todo.id}
            className={`task-card-enter backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 relative group flex flex-col justify-between ${todo.done
                ? 'bg-white/50 border-stone-200/60 shadow-xs opacity-85'
                : 'bg-white/80 border-white shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-rose-200/50'
                }`}
        >

            {/* Card decoration: dynamic highlight border for incomplete cards */}
            {!todo.done && (
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-rose-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            )}

            {/* Todo Card Header */}
            <div>
                <div className="flex items-start justify-between gap-3 mb-3">

                    {/* Checkbox status indicator */}
                    <button
                        onClick={() => handleToggleDone(todo)}
                        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition border focus:outline-none cursor-pointer ${todo.done
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs shadow-emerald-500/20'
                            : 'border-slate-300 bg-white hover:border-rose-400 hover:bg-rose-50/20 text-transparent'
                            }`}
                    >
                        <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                    </button>

                    {/* Title & Badge */}
                    <div className="flex-1 text-left min-w-0">
                        <h4 className={`text-base font-extrabold tracking-tight truncate ${todo.done
                            ? 'text-slate-400 line-through'
                            : 'text-slate-800 group-hover:text-slate-900'
                            }`}>
                            {todo.title}
                        </h4>

                        {/* Done/Pending Label Badge */}
                        <span className={`inline-flex items-center text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md mt-1 ${todo.done
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                            {todo.done ? 'Done' : 'Pending'}
                        </span>
                    </div>
                </div>

                {/* Todo Card Description */}
                <p className={`text-sm text-left leading-relaxed break-words whitespace-pre-wrap ${todo.done ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                    {hasLongDescription && !isExpanded
                        ? `${todo.description.substring(0, 95)}...`
                        : todo.description}
                </p>

                {/* Read More toggle buttons */}
                {hasLongDescription && (
                    <button
                        onClick={() => toggleExpand(todo.id)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-500 mt-2 flex items-center gap-0.5 focus:outline-none cursor-pointer"
                    >
                        {isExpanded ? (
                            <>
                                <span>Show less</span>
                                <ChevronUp className="w-3 h-3" />
                            </>
                        ) : (
                            <>
                                <span>Show full description</span>
                                <ChevronDown className="w-3 h-3" />
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Todo Card Footer & Details / Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100/60 flex items-center justify-between text-[11px] text-slate-400">

                {/* Last Updated Timestamp */}
                <div className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>
                        {new Date(todo.updatedAt || todo.createdAt || Date.now()).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                </div>

                {/* Actions Panel */}
                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">

                    {/* Navigate to detail page */}
                    <Link
                        to={`/todos/${todo.id}`}
                        className="p-1.5 hover:text-slate-800 hover:bg-slate-100 rounded-md transition duration-150 cursor-pointer"
                        title="View Detailed Page"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                        {/* copu btn */}
                        <button 
                        onClick = {handlecopiedText}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition duration-150 cursor-pointer"
                        title="copied Task"> 
                        {
                            copied ? <Check className="w-3.5 h-3.5"/> : <Copy className="w-3.5 h-3.5"/>
                        }
                        

                        </button>




                    {/* Delete button */}
                    <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition duration-150 cursor-pointer"
                        title="Delete Task"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {/* Delete button for confirmation */}
                    
                    {/* <button
                        onClick={() => navigate(`/todos/${todo.id}`)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition duration-150 cursor-pointer"
                        title="Delete Task"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button> */}
                </div>

            </div>

        </div>
    );
}

