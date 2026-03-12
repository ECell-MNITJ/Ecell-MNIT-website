'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { useEffect, useState } from 'react';

const ReactQuill = dynamic(async () => {
    const { default: RQ } = await import('react-quill-new');
    const { Quill } = await import('react-quill-new');
    const Font = Quill.import('formats/font') as any;
    Font.whitelist = ['poppins', 'bebas', 'inter', 'serif', 'monospace'];
    Quill.register(Font, true);
    return RQ;
}, {
    ssr: false,
    loading: () => <div className="h-48 w-full bg-gray-800 animate-pulse rounded-lg" />
});

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const modules = {
        toolbar: [
            [{ 'font': ['poppins', 'bebas', 'inter', 'serif', 'monospace'] }],
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean'],
        ],
    };

    const formats = [
        'font',
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list',
        'link'
    ];

    return (
        <div className="rich-text-editor bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
            <style jsx global>{`
                .ql-toolbar.ql-snow {
                    border-color: #374151 !important;
                    background-color: #1f2937 !important;
                }
                .ql-container.ql-snow {
                    border-color: #374151 !important;
                    min-height: 200px;
                }
                .ql-editor {
                    color: #f3f4f6 !important;
                    font-size: 1rem;
                }
                .ql-editor.ql-blank::before {
                    color: #6b7280 !important;
                    font-style: normal !important;
                }
                .ql-snow .ql-stroke {
                    stroke: #9ca3af !important;
                }
                .ql-snow .ql-fill {
                    fill: #9ca3af !important;
                }
                .ql-snow .ql-picker {
                    color: #9ca3af !important;
                }
                .ql-snow .ql-picker-options {
                    background-color: #1f2937 !important;
                    border-color: #374151 !important;
                }

                /* Custom Fonts */
                .ql-font-poppins { font-family: 'Poppins', sans-serif !important; }
                .ql-font-bebas { font-family: 'Bebas Neue', cursive !important; }
                .ql-font-inter { font-family: 'Inter', sans-serif !important; }
                .ql-font-serif { font-family: serif !important; }
                .ql-font-monospace { font-family: monospace !important; }

                /* Picker Labels */
                .ql-snow .ql-picker.ql-font .ql-picker-label::before,
                .ql-snow .ql-picker.ql-font .ql-picker-item::before {
                    content: 'Poppins';
                }
                .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="poppins"]::before,
                .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="poppins"]::before {
                    content: 'Poppins';
                }
                .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="bebas"]::before,
                .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="bebas"]::before {
                    content: 'Bebas Neue';
                }
                .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="inter"]::before,
                .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="inter"]::before {
                    content: 'Inter';
                }
                .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
                .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before {
                    content: 'Serif';
                }
                .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
                .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before {
                    content: 'Monospace';
                }
            `}</style>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
            />
        </div>
    );
}
