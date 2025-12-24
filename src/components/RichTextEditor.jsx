import React from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const modules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "clean"],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
    ],
};

const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "color",
    "background",
    "align",
];

const RichTextEditor = React.forwardRef(({ value, onChange, placeholder, className }, ref) => {

    return (
        <div className={`rich-text-editor ${className}`}>
            <ReactQuill
                ref={ref}
                theme="snow"
                value={value || ""}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="bg-white rounded-lg"
            />
            <style>{`
                .ql-container {
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                    font-family: inherit;
                    min-height: 200px;
                }
                .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    background-color: #f9fafb;
                }
                .ql-editor {
                    min-height: 200px;
                    font-size: 1.125rem; /* text-lg */
                    line-height: 1.75;
                    color: #1f2937; /* gray-800 */
                }
                .ql-editor h1 {
                    font-size: 2.25rem; /* text-4xl */
                    font-weight: 700;
                    color: #14532d; /* green-900 */
                    margin-bottom: 1.5rem;
                    margin-top: 2rem;
                }
                .ql-editor h2 {
                    font-size: 1.875rem; /* text-3xl */
                    font-weight: 700;
                    color: #14532d; /* green-900 */
                    margin-bottom: 1.25rem;
                    margin-top: 1.5rem;
                }
                .ql-editor h3 {
                    font-size: 1.5rem; /* text-2xl */
                    font-weight: 700;
                    color: #14532d; /* green-900 */
                    margin-bottom: 1rem;
                    margin-top: 1.25rem;
                }
                .ql-editor p {
                    margin-bottom: 1.5rem;
                }
                .ql-editor ul, .ql-editor ol {
                    padding-left: 1.5em;
                    margin-bottom: 1.5rem;
                }
                .ql-editor li {
                    margin-bottom: 0.5rem;
                }
            `}</style>
        </div>
    );
});

export default RichTextEditor;
