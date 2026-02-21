'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { useEffect, useState } from 'react';

const ReactQuill = dynamic(async () => {
    const { default: RQ } = await import('react-quill-new');
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
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean'],
        ],
    };

    const formats = [
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
