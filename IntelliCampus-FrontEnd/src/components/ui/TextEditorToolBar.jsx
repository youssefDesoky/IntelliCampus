import { useEditorState } from "@tiptap/react"
import { useTranslation } from 'react-i18next';
import {
    LargeSmallIcon, BoldIcon, ItalicIcon, OrderedListIcon,
    UnorderedListIcon, StrikeThoughtIcon, UnderlineIcon,
    HighlighterIcon, AlignCenterIcon, AlignStartIcon,
    LinkIcon, UndoIcon
} from "./icons"

export default function TextEditorToolBar({ editor }) {
    const { t } = useTranslation('common');
    const {
        isLarge, isBold, isItalic, isUnderline, isStrike,
        isOrderedList, isBulletList, isHighlight, isLink,
        isAlignLeft, isAlignCenter, isAlignRight,
        canUndo, canRedo,
    } = useEditorState({
        editor,
        selector: ({ editor: e }) => ({
            isLarge:       e.isActive('textStyle', { fontSize: '1.25rem' }),
            isBold:        e.isActive('bold'),
            isItalic:      e.isActive('italic'),
            isUnderline:   e.isActive('underline'),
            isStrike:      e.isActive('strike'),
            isOrderedList: e.isActive('orderedList'),
            isBulletList:  e.isActive('bulletList'),
            isHighlight:   e.isActive('highlight'),
            isLink:        e.isActive('link'),
            isAlignLeft:   e.isActive({ textAlign: 'left' }),
            isAlignCenter: e.isActive({ textAlign: 'center' }),
            isAlignRight:  e.isActive({ textAlign: 'right' }),
            canUndo:       e.can().chain().focus().undo().run(),
            canRedo:       e.can().chain().focus().redo().run(),
        }),
    })

    if (!editor) return null

    return (
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border-primary-default-light dark:border-border-primary-default-dark shrink-0 overflow-x-auto">
            <div className="flex items-center gap-0.5 flex-nowrap">

                {/* ── Size ── */}
                <span className="hidden sm:inline-flex">
                    <Btn
                        icon={<LargeSmallIcon />}
                        active={isLarge}
                        title={t('editor.largeText', 'Large text')}
                        onClick={() => {
                            isLarge
                                ? editor.chain().focus().unsetFontSize().run()
                                : editor.chain().focus().setFontSize('1.25rem').run()
                        }}
                    />
                </span>

                <Sep />

                {/* ── Inline formatting ── */}
                <Btn icon={<BoldIcon />}          active={isBold}      title={t('editor.bold', 'Bold')}          onClick={() => editor.chain().focus().toggleBold().run()} />
                <Btn icon={<ItalicIcon />}         active={isItalic}    title={t('editor.italic', 'Italic')}        onClick={() => editor.chain().focus().toggleItalic().run()} />
                <Btn icon={<UnderlineIcon />}      active={isUnderline} title={t('editor.underline', 'Underline')}     onClick={() => editor.chain().focus().toggleUnderline().run()} />
                <Btn icon={<StrikeThoughtIcon />}  active={isStrike}    title={t('editor.strikethrough', 'Strikethrough')} onClick={() => editor.chain().focus().toggleStrike().run()} />
                <Btn icon={<HighlighterIcon />}    active={isHighlight} title={t('editor.highlight', 'Highlight')}     onClick={() => editor.chain().focus().toggleHighlight().run()} />

                <Sep />

                {/* ── Lists + link ── */}
                <Btn icon={<OrderedListIcon />}    active={isOrderedList} title={t('editor.numberedList', 'Numbered list')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
                <Btn icon={<UnorderedListIcon />}  active={isBulletList}  title={t('editor.bulletList', 'Bullet list')}   onClick={() => editor.chain().focus().toggleBulletList().run()} />
                <span className="hidden sm:inline-flex">
                    <Btn
                        icon={<LinkIcon />}
                        active={isLink}
                        title={t('editor.insertLink', 'Insert link')}
                        onClick={() => {
                            const url = window.prompt(t('editor.enterUrl', 'Enter URL'))
                            if (url) editor.chain().focus().setLink({ href: url }).run()
                        }}
                    />
                </span>

                <span className="hidden sm:flex items-center gap-0.5">
                    <Sep />

                    {/* ── Alignment ── */}
                    <Btn icon={<AlignStartIcon />}                        active={isAlignLeft}   title={t('editor.alignLeft', 'Align left')}   onClick={() => editor.chain().focus().setTextAlign('left').run()} />
                    <Btn icon={<AlignCenterIcon />}                       active={isAlignCenter} title={t('editor.alignCenter', 'Align center')} onClick={() => editor.chain().focus().setTextAlign('center').run()} />
                    <Btn icon={<AlignStartIcon className="-scale-x-100" />} active={isAlignRight} title={t('editor.alignRight', 'Align right')}  onClick={() => editor.chain().focus().setTextAlign('right').run()} />
                </span>
            </div>

            {/* ── Undo / Redo ── */}
            <div className="flex items-center gap-0.5 shrink-0">
                <Btn icon={<UndoIcon />}                         title={t('editor.undo', 'Undo')} disabled={!canUndo} onClick={() => editor.chain().focus().undo().run()} />
                <Btn icon={<UndoIcon className="-scale-x-100" />} title={t('editor.redo', 'Redo')} disabled={!canRedo} onClick={() => editor.chain().focus().redo().run()} />
            </div>
        </div>
    )
}

function Btn({ icon, active, disabled, title, onClick }) {
    return (
        <button
            type="button"
            title={title}
            disabled={disabled}
            onClick={onClick}
            className={`
                w-8 h-8 flex items-center justify-center rounded-md border-none transition-colors duration-100
                [&_svg]:w-4 [&_svg]:h-4
                ${disabled
                    ? 'opacity-35 text-icon-secondary-default-light dark:text-icon-secondary-default-dark'
                    : active
                        ? 'bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-accent-default-light dark:text-text-accent-default-dark'
                        : 'text-icon-secondary-default-light dark:text-icon-secondary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark hover:text-text-primary-active-light dark:hover:text-text-primary-active-dark'
                }
            `}
        >
            {icon}
        </button>
    )
}

function Sep() {
    return <div className="w-px h-4 bg-border-primary-default-light dark:bg-border-primary-default-dark mx-1 shrink-0" />
}