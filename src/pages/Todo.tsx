import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Edit3,
    Trash2,
    Clock,
    Check,
    Save,
    X,
    Loader2,
    User,
    ShieldAlert,
    BookmarkCheck
} from 'lucide-react';
import { BACKENED_URL } from '../../config';

// Interface for Todo item matched with database and backend schema
interface TodoItem {
    id: number;
    title: string;
    description: string;
    done: boolean;
    user?: {
        name: string | null;
    };
}

export default function Todo() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // State Management ke liye
    const [todo, setTodo] = useState<TodoItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit Mode wale States
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Actions Loading wale States
    const [isToggling, setIsToggling] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

    // Clear toast alert automatically after 3.5 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast(null);
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Auth verification and detail fetching on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/signin');
            return;
        }
        fetchTodoDetails(token);
    }, [id, navigate]);

    // Fetch Todo Details from Backend
    const fetchTodoDetails = async (token: string) => {
        if (!id) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BACKENED_URL}/api/v1/todo/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data && response.data.todo) {
                const item = response.data.todo;
                setTodo(item);
                setEditTitle(item.title);
                setEditDescription(item.description);
            } else {
                setError('Task details could not be found.');
            }
        } catch (err: any) {
            console.error('Fetch todo details error:', err);
            if (err.response?.status === 403) {
                localStorage.removeItem('token');
                setToast({ type: 'error', message: 'Session expired. Please log in again.' });
                setTimeout(() => navigate('/signin'), 1500);
            } else {
                setError('Error establishing connection with database.');
                setToast({ type: 'error', message: 'Failed to retrieve task.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle todo check status
    const handleToggleDone = async () => {
        if (!todo) return;
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/signin');
            return;
        }

        setIsToggling(true);
        const updatedDone = !todo.done;

        try {
            await axios.put(
                `${BACKENED_URL}/api/v1/todo/${todo.id}`,
                {
                    title: todo.title,
                    description: todo.description,
                    done: updatedDone
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setTodo((prev) => (prev ? { ...prev, done: updatedDone } : null));
            setToast({
                type: 'success',
                message: updatedDone ? 'Task marked as completed! 🎉' : 'Task restored to pending.'
            });
        } catch (err) {
            console.error('Toggle todo error:', err);
            setToast({ type: 'error', message: 'Failed to update task status.' });
        } finally {
            setIsToggling(false);
        }
    };

    // Save modified Title and Description
    const handleSaveDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!todo) return;
        if (!editTitle.trim() || !editDescription.trim()) {
            setToast({ type: 'error', message: 'Title and Description cannot be left blank.' });
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/signin');
            return;
        }

        setIsSaving(true);
        // change state on backend 
        try {
            await axios.put(
                `${BACKENED_URL}/api/v1/todo/${todo.id}`,
                {
                    title: editTitle.trim(),
                    description: editDescription.trim(),
                    done: todo.done
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            // change state on frontend as well.
            setTodo((prev) =>
                prev
                    ? {
                        ...prev,
                        title: editTitle.trim(),
                        description: editDescription.trim()
                    }
                    : null
            );
            setIsEditing(false);
            setToast({ type: 'success', message: 'Changes saved successfully!' });
        } catch (err) {
            console.error('Save todo details error:', err);
            setToast({ type: 'error', message: 'Failed to save modifications.' });
        } finally {
            setIsSaving(false);
        }
    };

    // Delete Todo inside details page
    const handleDeleteTodo = async () => {
        if (!todo) return;
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/signin');
            return;
        }

        setIsDeleting(true);
        try {
            await axios.delete(`${BACKENED_URL}/api/v1/todo/${todo.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setToast({ type: 'success', message: 'Task deleted successfully. Redirecting...' });
            setTimeout(() => {
                navigate('/todos');
            }, 1200);
        } catch (err) {
            console.error('Delete todo error:', err);
            setToast({ type: 'error', message: 'Could not delete task.' });
            setIsDeleting(false);
        }
    };

    // Revert changes and exit editing state
    const handleCancelEdit = () => {
        if (todo) {
            setEditTitle(todo.title);
            setEditDescription(todo.description);
        }
        setIsEditing(false);
    };

    return (
        <div className="relative min-h-screen w-full bg-gradient-to-br from-rose-50/60 via-stone-50 to-red-50/50 overflow-x-hidden font-sans pb-16">

            {/* Background decorations for consistent theme */}
            <style>{`
        @keyframes float-glow-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(30px, -40px) scale(1.08); }
        }
        .animate-glow-1 {
          animation: float-glow-1 14s infinite ease-in-out;
        }
      `}</style>

            {/* Glow Spheres */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-rose-200/40 rounded-full blur-[90px] animate-glow-1 pointer-events-none" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-red-100/50 rounded-full blur-[90px] pointer-events-none" />

            {/* Floating Action Toast Alert */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 ${toast.type === 'success'
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
                    : toast.type === 'error'
                        ? 'bg-rose-50/90 border-rose-200 text-rose-800'
                        : 'bg-stone-50/90 border-stone-200 text-slate-800'
                    }`}>
                    {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />}
                    {toast.type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />}
                    {toast.type === 'info' && <Clock className="w-5 h-5 flex-shrink-0 text-amber-600" />}
                    <span className="text-sm font-semibold">{toast.message}</span>
                </div>
            )}

            {/* NAVBAR */}
            <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 border-b border-stone-200/50 transition-all duration-200">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/todos" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-red-600 text-white font-bold text-base shadow-sm">
                            ✓
                        </div>
                        <span className="text-lg font-extrabold tracking-tight text-slate-900">
                            Task<span className="bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">Flow</span>
                        </span>
                    </Link>
                    <Link
                        to="/todos"
                        className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Dashboard</span>
                    </Link>
                </div>
            </nav>

            {/* CORE CONTAINER */}
            <main className="max-w-3xl mx-auto px-4 mt-10 relative z-10">

                {/* BACK TO DASHBOARD SHORTCUT */}
                <Link
                    to="/todos"
                    className="inline-flex items-center gap-2 text-sm font-bold text-rose-600 hover:text-rose-500 mb-6 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to all tasks</span>
                </Link>

                {/* LOADING INDICATOR STATE */}
                {isLoading && (
                    <div className="backdrop-blur-xl bg-white/80 border border-white shadow-xl rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-rose-600 mb-4" />
                        <p className="text-sm font-semibold text-slate-500">Retrieving details, please wait...</p>
                    </div>
                )}

                {/* ERROR SCREEN STATE */}
                {!isLoading && error && (
                    <div className="backdrop-blur-xl bg-white/80 border border-white shadow-xl rounded-2xl p-8 text-center flex flex-col items-center">
                        <ShieldAlert className="w-14 h-14 text-rose-600 mb-4" />
                        <h3 className="text-xl font-bold text-slate-800">{error}</h3>
                        <p className="text-sm text-slate-500 mt-1 max-w-sm">The task might have been deleted, or there might be an active token authentication issue.</p>
                        <Link
                            to="/todos"
                            className="mt-6 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold rounded-xl text-xs shadow-md transition"
                        >
                            Return to Safety
                        </Link>
                    </div>
                )}

                {/* CORE DETAILS CARD */}
                {!isLoading && !error && todo && (
                    <div className="backdrop-blur-xl bg-white/80 border border-white shadow-2xl rounded-2xl p-6 sm:p-8 relative overflow-hidden">

                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/35 to-transparent" />

                        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100 mb-6">

                            <div className="flex items-center gap-2">
                                {/* <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100/60 px-2 py-0.5 rounded">
                                    TASK #{todo.id}
                                </span> */}
                                {todo.user?.name && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-rose-50/50 border border-rose-100/40 px-2 py-0.5 rounded">
                                        <User className="w-2.5 h-2.5 text-rose-500" />
                                        <span>{todo.user.name}</span>
                                    </span>
                                )}
                            </div>

                            {/* Status Badge */}
                            <button
                                onClick={handleToggleDone}
                                disabled={isToggling}
                                className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border transition cursor-pointer disabled:opacity-50 ${todo.done
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800 shadow-2xs hover:bg-emerald-100/50'
                                    : 'bg-amber-50 border-amber-100 text-amber-800 shadow-2xs hover:bg-amber-100/50'
                                    }`}
                                title="Click to toggle status"
                            >
                                {isToggling ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : todo.done ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                )}
                                <span>{todo.done ? 'Completed' : 'Pending'}</span>
                            </button>

                        </div>

                        {/* EDITING MODE vs DISPLAY MODE */}
                        {isEditing ? (

                            /* RENDER EDIT INPUTS FORM */
                            <form onSubmit={handleSaveDetails} className="space-y-5">
                                <div className="space-y-1.5 text-left">
                                    <label htmlFor="edit-title" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                                        Modify Task Title
                                    </label>
                                    <input
                                        id="edit-title"
                                        type="text"
                                        required
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-base font-extrabold focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition shadow-2xs"
                                    />
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <label htmlFor="edit-desc" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                                        Modify Task Description
                                    </label>
                                    <textarea
                                        id="edit-desc"
                                        required
                                        rows={5}
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm leading-relaxed focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition shadow-2xs"
                                    />
                                </div>

                                {/* Edit submission buttons */}
                                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        <span>Cancel</span>
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-3.5 h-3.5" />
                                                <span>Save Changes</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>

                        ) : (

                            /* RENDER DISPLAY DETAIL CONTENT */
                            <div className="space-y-6">

                                {/* Title and bookmark display */}
                                <div className="flex items-start gap-3 text-left">
                                    <span className={`p-1.5 rounded-lg mt-0.5 ${todo.done ? 'bg-slate-100 text-slate-400' : 'bg-rose-50 text-rose-600'}`}>
                                        <BookmarkCheck className="w-5 h-5" />
                                    </span>
                                    <div>
                                        <h1 className={`text-2xl font-black text-slate-900 tracking-tight leading-tight ${todo.done ? 'text-slate-500 line-through' : ''}`}>
                                            {todo.title}
                                        </h1>
                                    </div>
                                </div>

                                {/* Description content */}
                                <div className="text-left bg-slate-50/50 border border-slate-100 rounded-xl p-5">
                                    <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Description</h5>
                                    <p className={`text-base leading-relaxed break-words whitespace-pre-wrap ${todo.done ? 'text-slate-400' : 'text-slate-700'}`}>
                                        {todo.description}
                                    </p>
                                </div>

                                {/* Detail Page Footer Action Controls */}
                                <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100">

                                    {/* Status Toggle helper */}
                                    <button
                                        onClick={handleToggleDone}
                                        disabled={isToggling}
                                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition cursor-pointer disabled:opacity-50 ${todo.done
                                            ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50'
                                            }`}
                                    >
                                        <Check className="w-4 h-4 stroke-[3.5]" />
                                        <span>{todo.done ? 'Mark Pending' : 'Mark Completed'}</span>
                                    </button>

                                    {/* Modify & Delete */}
                                    <div className="flex items-center gap-2">

                                        {/* Enter edit state */}
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer shadow-2xs"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                            <span>Edit details</span>
                                        </button>

                                        {/* Delete trigger */}
                                        <button
                                            onClick={handleDeleteTodo}
                                            disabled={isDeleting}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 font-bold text-xs rounded-xl transition disabled:opacity-50 cursor-pointer shadow-2xs"
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span>Deleting...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>Delete</span>
                                                </>
                                            )}
                                        </button>

                                    </div>

                                </div>

                            </div>

                        )}

                    </div>
                )}

            </main>
        </div>
    );
}