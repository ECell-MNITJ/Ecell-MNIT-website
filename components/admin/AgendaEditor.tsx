'use client';

import { useState } from 'react';
import { FiPlus, FiTrash2, FiClock, FiAlignLeft } from 'react-icons/fi';
import { AgendaItem } from '@/lib/supabase/client';

interface AgendaEditorProps {
    agenda: AgendaItem[];
    onChange: (agenda: AgendaItem[]) => void;
}

export default function AgendaEditor({ agenda, onChange }: AgendaEditorProps) {
    const [newItem, setNewItem] = useState<Partial<AgendaItem>>({
        time: '',
        title: '',
        description: '',
    });

    const handleAdd = () => {
        if (!newItem.time || !newItem.title) return;

        const item: AgendaItem = {
            id: crypto.randomUUID(),
            time: newItem.time || '',
            title: newItem.title || '',
            description: newItem.description || '',
        };

        onChange([...agenda, item]);
        setNewItem({ time: '', title: '', description: '' });
    };

    const handleDelete = (id: string) => {
        onChange(agenda.filter((item) => item.id !== id));
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-300">Agenda</h3>

            {/* List */}
            <div className="space-y-3">
                {agenda.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="w-24 shrink-0 font-mono text-sm font-medium text-primary-golden pt-1">
                            {item.time}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-white">{item.title}</h4>
                            <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 self-start p-1"
                        >
                            <FiTrash2 />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add New */}
            <div className="grid md:grid-cols-12 gap-3 p-4 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
                <div className="md:col-span-3">
                    <div className="relative">
                        <FiClock className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Time (e.g. 10:00 AM)"
                            value={newItem.time}
                            onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                            className="w-full pl-10 pr-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-1 focus:ring-primary-golden placeholder-gray-500"
                        />
                    </div>
                </div>
                <div className="md:col-span-9">
                    <input
                        type="text"
                        placeholder="Session Title"
                        value={newItem.title}
                        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-1 focus:ring-primary-golden mb-3 placeholder-gray-500"
                    />
                    <div className="relative">
                        <FiAlignLeft className="absolute left-3 top-3 text-gray-400" />
                        <textarea
                            placeholder="Description (Optional)"
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            rows={2}
                            className="w-full pl-10 pr-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-1 focus:ring-primary-golden placeholder-gray-500"
                        />
                    </div>
                </div>
                <div className="md:col-span-12">
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={!newItem.time || !newItem.title}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-gray-900 border border-primary-golden text-primary-golden rounded-lg hover:bg-primary-golden/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <FiPlus /> Add Agenda Item
                    </button>
                </div>
            </div>
        </div>
    );
}
