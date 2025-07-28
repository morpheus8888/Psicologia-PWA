import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Scrivi i tuoi pensieri...",
  className = ""
}) => {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ]
  }), [])

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'blockquote', 'code-block',
    'link'
  ]

  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          minHeight: '300px',
          height: 'auto'
        }}
      />
      <style jsx global>{`
        .rich-text-editor .ql-editor {
          font-size: 14px;
          line-height: 1.5;
          min-height: 300px;
          resize: vertical;
          overflow-y: auto;
        }
        .rich-text-editor .ql-container {
          resize: vertical;
          min-height: 300px;
        }
        .rich-text-editor .ql-toolbar {
          border-top: 1px solid #d1d5db;
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          background-color: #f9fafb;
        }
        .rich-text-editor .ql-container {
          border-bottom: 1px solid #d1d5db;
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          border-top: none;
          border-radius: 0 0 8px 8px;
          background-color: #ffffff;
        }
        .rich-text-editor .ql-toolbar .ql-formats {
          margin-right: 15px;
        }
        .rich-text-editor .ql-toolbar button {
          border: none;
          background: none;
          color: #374151;
          padding: 5px;
          margin: 2px;
          border-radius: 4px;
        }
        .rich-text-editor .ql-toolbar button:hover {
          background-color: #e5e7eb;
        }
        .rich-text-editor .ql-toolbar button.ql-active {
          background-color: #3b82f6;
          color: white;
        }
        .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: #374151;
        }
        .rich-text-editor .ql-toolbar .ql-fill {
          fill: #374151;
        }
        .rich-text-editor .ql-toolbar .ql-picker-label {
          color: #374151;
        }
        
        /* Dark mode styles */
        .dark .rich-text-editor .ql-toolbar {
          border-color: #4b5563;
          background-color: #374151;
        }
        .dark .rich-text-editor .ql-container {
          border-color: #4b5563;
          background-color: #1f2937;
        }
        .dark .rich-text-editor .ql-editor {
          color: #f9fafb;
          background-color: #1f2937;
        }
        .dark .rich-text-editor .ql-toolbar button {
          color: #d1d5db;
        }
        .dark .rich-text-editor .ql-toolbar button:hover {
          background-color: #4b5563;
        }
        .dark .rich-text-editor .ql-toolbar button.ql-active {
          background-color: #2563eb;
          color: white;
        }
        .dark .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: #d1d5db;
        }
        .dark .rich-text-editor .ql-toolbar .ql-fill {
          fill: #d1d5db;
        }
        .dark .rich-text-editor .ql-toolbar .ql-picker-label {
          color: #d1d5db;
        }
        .dark .rich-text-editor .ql-tooltip {
          background-color: #374151;
          border-color: #4b5563;
          color: #f9fafb;
        }
        
        /* Responsive sizing */
        @media (min-width: 768px) {
          .rich-text-editor .ql-editor {
            min-height: 400px;
          }
          .rich-text-editor .ql-container {
            min-height: 400px;
          }
        }
        @media (min-width: 1024px) {
          .rich-text-editor .ql-editor {
            min-height: 500px;
          }
          .rich-text-editor .ql-container {
            min-height: 500px;
          }
        }
      `}</style>
    </div>
  )
}

export default RichTextEditor