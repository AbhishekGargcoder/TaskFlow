import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    CheckCircle2,
    XCircle,
    Plus,
    Search,
    LogOut,
    Check,
    Clock,
    ArrowUpDown,
    Loader2,
    ChevronDown,
    ChevronUp,
    TrendingUp,
    FolderPlus,
    AlertCircle
} from 'lucide-react';

import { BACKENED_URL } from '../../config';
import StatsComponent from '../components/StatsComponent';
import TodoCard from '../components/TodoCard';
import type { Todo } from '../types'
// decode token to get user name
import { jwtDecode } from "jwt-decode"


interface DecodedToken {
    id: string;
    email: string;
    name?: string;
    exp: number;
}

export default function Todos() {
    const navigate = useNavigate();

    // State Management
    const [todos, setTodos] = useState<Todo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // New Todo Form State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');

    // Truncated text track state (stores IDs of expanded cards)
    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

    // Toast Alerts State
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

    // Auth check & data fetching on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/signin');
            return;
        }
        fetchTodos(token);
    }, [navigate]);

    // Fetch todos from Backend API
    const fetchTodos = async (token: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BACKENED_URL}/api/v1/todo/bulk`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("TODOS AFTER FETCH :", response.data);
            if (response.data && Array.isArray(response.data.todos)) {
                setTodos(response.data.todos);
            } else {
                setTodos([]);
            }
        } catch (err: any) {
            console.error('Fetch todos error:', err);
            // If token is invalid or expired
            if (err.response?.status === 403) {
                localStorage.removeItem('token');
                setToast({ type: 'error', message: 'Session expired. Please log in again.' });
                setTimeout(() => navigate('/signin'), 1500);
            } else {
                setError('Failed to fetch todos. Please try refreshing.');
                setToast({ type: 'error', message: 'Error loading tasks from server.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Get active username from fetched todos (database relation)
    const userName = useMemo(() => {
        const currentTime = Date.now() / 1000;

        try {
            const decoded = jwtDecode<DecodedToken>(localStorage.getItem('token') as string);
            if (decoded.exp < currentTime) {
                console.log("Token expired");
                localStorage.removeItem("token");
            } else {
                console.log("decoded token", decoded);
                return decoded.name || "Productive User";
            }
        } catch (error) {
            console.error("Error decoding token:", error);
            localStorage.removeItem("token");
            return "Productive User";
        }


    }, [todos]);

    // Create new Todo
    const handleCreateTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newDescription.trim()) {
            setToast({ type: 'error', message: 'Please provide both a Title and a Description.' });
            return;
        }

        const token = localStorage.getItem('token'); // frontend par check karo kya logged in hai
        if (!token) {
            navigate('/signin');
            return;
        }
        setIsSubmitting(true);

        // html ignore line breaks by default. so, maually add <br/> after each line then send to BE.
    

        try {
            const response = await axios.post(
                `${BACKENED_URL}/api/v1/todo`,
                {
                    title: newTitle.trim(),
                    description: newDescription.trim()
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const createdTodo = response.data.todo;

            // Keep user relation on locally added todo to retain username
            const localizedTodo = {
                ...createdTodo,
                user: { name: userName }
            };

            setTodos((prev) => [localizedTodo, ...prev]);
            setNewTitle('');
            setNewDescription('');
            setIsCreateOpen(false);
            setToast({ type: 'success', message: 'Task created successfully!' });
        } catch (err: any) {
            console.error('Create todo error:', err);
            setToast({ type: 'error', message: err.response?.data?.msg || 'Could not create task.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Toggle todo check status
    const handleToggleDone = async (todo: Todo) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/signin');
            return;
        }

        const updatedDone = !todo.done;

        // Optimistically update frontend UI
        setTodos((prev) =>
            prev.map((t) => (t.id === todo.id ? { ...t, done: updatedDone } : t))
        );
        // frontend se toh state change ho gyi from :  false -> true
        // Backend se bhi change kro saaath hi.
        // therefore ,************** MAIN MOTIVE : TO SYNC frontend and backend ********************

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
            setToast({
                type: 'success',
                message: updatedDone ? 'Task marked as completed! 🎉' : 'Task restored to pending.'
            });
        } catch (err) {
            console.error('Toggle todo error:', err);
            // Revert optimism if error occurs
            setTodos((prev) =>
                prev.map((t) => (t.id === todo.id ? { ...t, done: !updatedDone } : t))
            );
            setToast({ type: 'error', message: 'Failed to update task status.' });
        }
    };

    // Delete Todo
    const handleDeleteTodo = async (id: string) => {
        // frontend side se toh authenticated hai
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/signin');
            return;
        }

        // Confirm first or instantly delete with nice toast -- > ab backend side se authentication check karo
        try {
            await axios.delete(`${BACKENED_URL}/api/v1/todo/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setTodos((prev) => prev.filter((t) => t.id !== id));
            setToast({ type: 'success', message: 'Task deleted successfully.' });
        } catch (err) {
            console.error('Delete todo error:', err);
            setToast({ type: 'error', message: 'Could not delete task from server.' });
        }
    };

    // Sign out user
    const handleSignOut = () => {
        localStorage.removeItem('token');
        setToast({ type: 'info', message: 'Signing out...' });
        setTimeout(() => {
            navigate('/signin');
        }, 800);
    };

    // Toggle card description expansion
    const toggleExpand = (id: string) => {
        setExpandedIds(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // KPIs Calculations -; key performace indicators : key parameters hote hain company ke 
    const stats = useMemo(() => {
        const total = todos.length;
        const completed = todos.filter(t => t.done).length;
        const pending = total - completed;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, pending, percent };
    }, [todos]);

    // Frontend Search, Filters, and Sorting applied in memory
    const processedTodos = useMemo(() => {
        let list = [...todos];

        // 1. Search Query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(
                (t) =>
                    t.title.toLowerCase().includes(q) ||
                    t.description.toLowerCase().includes(q)
            );
        }

        // 2. Status Filter
        if (statusFilter === 'pending') {
            list = list.filter((t) => !t.done);
        } else if (statusFilter === 'completed') {
            list = list.filter((t) => t.done);
        }

        // 3. Sorting
        list.sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            } else if (sortBy === 'oldest') {
                return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            } else { // alphabetical
                return a.title.localeCompare(b.title);
            }
        });

        return list;
    }, [todos, searchQuery, statusFilter, sortBy]);

    return (
        <div className="relative min-h-screen w-full bg-gradient-to-br from-rose-50/60 via-stone-50 to-red-50/50 overflow-x-hidden font-sans pb-16">

            {/* Custom Styles for Keyframes & Animations */}
            <style>{`
        @keyframes float-glow-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.95); }
        }
        @keyframes float-glow-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-30px, 50px) scale(0.9); }
          66% { transform: translate(30px, -30px) scale(1.05); }
        }
        .animate-glow-1 {
          animation: float-glow-1 16s infinite ease-in-out;
        }
        .animate-glow-2 {
          animation: float-glow-2 20s infinite ease-in-out alternate;
        }
        .task-card-enter {
          animation: cardSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

            {/* Dynamic Background Glow Spheres */}
            <div className="absolute top-1/6 -left-32 w-[450px] h-[450px] bg-rose-200/40 rounded-full blur-[100px] animate-glow-1 pointer-events-none" />
            <div className="absolute bottom-1/4 -right-32 w-[450px] h-[450px] bg-red-100/50 rounded-full blur-[100px] animate-glow-2 pointer-events-none" />

            {/* Floating Action Toast Alert */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-0 animate-bounce ${toast.type === 'success'
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

                    {/* Logo & Brand Name */}
                    <Link to="/todos" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                        <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-rose-600 to-red-600 text-white font-bold text-lg shadow-md shadow-rose-500/20">
                            ✓
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-slate-900">
                            Task<span className="bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">Flow</span>
                        </span>
                    </Link>

                    {/* User profile actions */}
                    <div className="flex items-center gap-4">

                        {/* User initials bubble & greeting */}
                        <div className="hidden sm:flex items-center gap-3 pr-2 border-r border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center border border-rose-200">
                                <span className="text-xs font-bold text-rose-700 uppercase">
                                    {userName?.substring(0, 2)}
                                </span>
                            </div>
                            <span className="text-sm font-semibold text-slate-700">
                                Welcome, <span className="text-slate-900 font-extrabold">{userName}</span>
                            </span>
                        </div>

                        {/* Logout button */}
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-rose-600 font-medium text-xs transition duration-200 cursor-pointer shadow-xs"
                            title="Sign Out"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* CORE CONTAINER */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10">

                {/* TOP WELCOME HERO & STATS METRICS HEADER */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* Welcome Text Widget */}
                    <div className="lg:col-span-1 flex flex-col justify-center">
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Your Productive Hub
                        </h2>
                        <p className="text-sm text-slate-500 mt-1 max-w-sm">
                            Streamline your focus, stay on track, and achieve your daily outcomes seamlessly.
                        </p>
                    </div>

                    {/* Metrics Analytics Cards */}
                    <div className="lg:col-span-2 grid grid-cols-3 gap-4">
                        {/* Metric Item: Total */}
                        <StatsComponent value={stats.total} Icon={FolderPlus} info="Total" about="Tasks logged" />
                        <StatsComponent value={stats.pending} Icon={Clock} info="pending" about="Awaiting completion" />
                        <StatsComponent value={stats.completed} Icon={TrendingUp} info="completed" about="Successfully done" completionRate={stats.percent} />
                        {/* Metric Item: Pending */}
                        {/* Metric Item: Completed */}
                    </div>
                </div>

                {/* INTERACTIVE CREATE TASK CARD DROPDOWN */}
                <div className="backdrop-blur-xl bg-white/80 border border-white/80 rounded-2xl shadow-md p-4 sm:p-6 mb-8 transition-all duration-300">

                    <button
                        onClick={() => setIsCreateOpen(!isCreateOpen)}
                        className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-red-600 text-white flex items-center justify-center shadow-sm shadow-rose-500/10">
                                <Plus className={`w-4 h-4 transition-transform duration-300 ${isCreateOpen ? 'rotate-45' : ''}`} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                                    Create a New Task
                                </h3>
                                <p className="text-xs text-slate-500 hidden sm:block">Add a new responsibility, objective, or chore to your list.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-medium">Quick Access</span>
                            {isCreateOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                    </button>

                    {/* Form expand area */}
                    <div className={`overflow-hidden  ${isCreateOpen ? 'max-h-[350px] opacity-100 mt-6 pt-5 border-t border-slate-100' : 'max-h-0 opacity-0'}`}>
                        <form onSubmit={handleCreateTodo} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                {/* Title field */}
                                <div className="md:col-span-1 space-y-1.5 text-left">
                                    <label htmlFor="task-title" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                                        Task Title
                                    </label>
                                    <input
                                        id="task-title"
                                        type="text"
                                        required
                                        placeholder="e.g. Wake up @5:00 A.M."
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition duration-200 shadow-2xs"
                                    />
                                </div>

                                {/* Description field */}
                                <div className="md:col-span-2 space-y-1.5 text-left">
                                    <label htmlFor="task-desc" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                                        Task Description
                                    </label>
                                    <textarea
                                        id="task-desc"
                                        required
                                        placeholder="e.g. Go to Gym"
                                        rows={2}
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition duration-200 shadow-2xs"
                                    />
                                </div>
                            </div>

                            {/* 2 btns diye h  */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-500/15 hover:shadow-rose-500/25 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Creating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Add Todo</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* SEARCH AND FILTERS CONTROLS : debouncing ke saath */}
                <div className="backdrop-blur-xl bg-white/60 border border-white/40 p-4 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">

                    {/* Search box */}
                    <div className="relative flex-1 max-w-md">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Search className="w-4 h-4" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search tasks by title or content..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white/90 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition duration-150 shadow-2xs"
                        />
                    </div>

                    {/* Filter tabs & sorting */}
                    <div className="flex flex-wrap items-center gap-3">

                        {/* 3 btns hai pending,completed and all ke liye*/}
                        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${statusFilter === 'all'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setStatusFilter('pending')}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${statusFilter === 'pending'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setStatusFilter('completed')}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${statusFilter === 'completed'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                Completed
                            </button>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
                            >
                                <option value="newest">Newest first</option>
                                <option value="oldest">Oldest first</option>
                                <option value="alphabetical">Alphabetical</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* LOADING INDICATOR STATE */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/40 border border-white/20 rounded-2xl backdrop-blur-sm">
                        <Loader2 className="w-10 h-10 animate-spin text-rose-600" />
                        <p className="text-sm font-semibold text-slate-600 mt-4">Loading your private vault of tasks...</p>
                    </div>
                )}

                {/* ERROR SCREEN STATE */}
                {!isLoading && error && (
                    <div className="flex flex-col items-center justify-center py-12 px-4 bg-rose-50/50 border border-rose-100 rounded-2xl text-center">
                        <AlertCircle className="w-12 h-12 text-rose-600 mb-3" />
                        <h4 className="text-lg font-bold text-rose-900">{error}</h4>
                        <button
                            onClick={() => fetchTodos(localStorage.getItem('token') || '')}
                            className="mt-4 px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                        >
                            Retry Connection
                        </button>
                    </div>
                )}

                {/* EMPTY STATE : jab user ne search nhi kiya */}
                {!isLoading && !error && processedTodos.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/70 border border-white/60 rounded-2xl shadow-sm text-center">
                        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100 shadow-sm mb-4">
                            <Check className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">
                            {todos.length === 0 ? 'No tasks created yet' : 'No tasks match criteria'}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                            {todos.length === 0
                                ? 'Begin your journey! Open the panel above and add your very first todo.'
                                : 'Try adjusting your search query or switching filter tabs to locate your tasks.'}
                        </p>
                        {todos.length === 0 && (
                            <button
                                onClick={() => setIsCreateOpen(true)}
                                className="mt-5 flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer hover:opacity-90"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Create First Task</span>
                            </button>
                        )}
                    </div>
                )}

                {/* TODOS LIST GRID */}
                {!isLoading && !error && processedTodos.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {processedTodos.map((todo) => {
                            const isExpanded = expandedIds[todo.id] || false;
                            // const hasLongDescription = todo.description.length > 95;

                            return (
                                <TodoCard
                                    key={todo.id}
                                    todo={todo}
                                    handleDeleteTodo={handleDeleteTodo}
                                    handleToggleDone={handleToggleDone}
                                    isExpanded={isExpanded}
                                    toggleExpand={toggleExpand}
                                />
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}