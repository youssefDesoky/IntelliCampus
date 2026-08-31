import { useEditor, EditorContent } from '@tiptap/react'
import { Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import TextEditorToolBar from '../../../components/ui/TextEditorToolBar'

const FontSize = Extension.create({
    name: 'fontSize',

    addOptions() {
        return {
            types: ['textStyle'],
        }
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: (element) => element.style.fontSize || null,
                        renderHTML: (attributes) => {
                            if (!attributes.fontSize) {
                                return {}
                            }

                            return { style: `font-size: ${attributes.fontSize}` }
                        },
                    },
                },
            },
        ]
    },

    addCommands() {
        return {
            setFontSize:
                (fontSize) =>
                ({ chain }) =>
                    chain().setMark('textStyle', { fontSize }).run(),
            unsetFontSize:
                () =>
                ({ chain }) =>
                    chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
        }
    },
})

export default function Tiptap({ content = '', onChange, className }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList:   { keepMarks: true, keepAttributes: false },
                orderedList:  { keepMarks: true, keepAttributes: false },
            }),
            TextStyle,
            FontSize,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline,
            Highlight,
            Link.configure({ openOnClick: false }),
        ],
        content,
        onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    })

    if (!editor) return null

    return (
        <div className={`flex flex-col min-h-0 ${className ?? ''}`}>
            <TextEditorToolBar editor={editor} />
            <div
                className="flex-1"
                onMouseDown={(e) => {
                    const clickedInsideEditor = e.target.closest('.ProseMirror')

                    if (!clickedInsideEditor) {
                        e.preventDefault()
                        if (!editor.isFocused) {
                            editor.commands.focus('end')
                        }
                    }
                }}
            >
                <EditorContent
                    editor={editor}
                    className="
                        flex-1 px-4 sm:px-8 py-3
                        prose prose-sm max-w-none
                        prose-p:leading-relaxed prose-p:text-text-primary-default-light dark:prose-p:text-text-primary-default-dark
                        prose-strong:text-text-primary-active-light dark:prose-strong:text-text-primary-active-dark
                        prose-ul:list-disc prose-ul:ps-5
                        prose-ol:list-decimal prose-ol:ps-5
                        prose-a:text-indigo-500 prose-a:underline
                        prose-code:bg-bg-surface-secondary-default-light dark:prose-code:bg-bg-surface-secondary-default-dark
                        prose-code:rounded prose-code:px-1 prose-code:text-[0.8em]
                        prose-blockquote:border-s-2 prose-blockquote:border-indigo-400 prose-blockquote:ps-4 prose-blockquote:italic
                        focus:outline-none
                    "
                />
            </div>
        </div>
    )
}