'use client';

import 'react-quill-new/dist/quill.snow.css';

interface QuillViewerProps {
    html: string;
    className?: string;
}

export default function QuillViewer({ html, className = '' }: QuillViewerProps) {
    return (
        <div className={`ql-container ql-snow ${className}`} style={{ border: 'none', background: 'transparent' }}>
            <style jsx global>{`
                .ql-container.ql-snow {
                    font-family: inherit !important;
                    font-size: inherit !important;
                    background: transparent !important;
                }
                .ql-editor {
                    color: inherit !important;
                    line-height: 1.5 !important;
                    padding: 0 !important;
                    height: auto !important;
                    overflow: visible !important;
                    cursor: default !important;
                }
                /* Match editor's default block behavior */
                .ql-editor p, .ql-editor h1, .ql-editor h2, .ql-editor h3, .ql-editor ul, .ql-editor ol {
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .ql-editor p {
                    min-height: 1.5em !important;
                }
                /* Ensure empty lines/Shift+Enter provide space */
                .ql-editor br {
                    line-height: 1.5 !important;
                }
                /* Handle headers and lists */
                .ql-editor h1, .ql-editor h2, .ql-editor h3 {
                    font-weight: 700 !important;
                    color: white !important;
                }
                .ql-editor ul, .ql-editor ol {
                    padding-left: 1.5rem !important;
                }
                /* Match common block spacing if needed, but the user wants it "as is" */
            `}</style>
            <div
                className="ql-editor"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    );
}
