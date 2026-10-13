'use client'

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle, Color, FontSize, LineHeight } from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function toHtml(value: string) {
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return value

  return value
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '32px']
const LINE_HEIGHTS = ['1', '1.2', '1.5', '1.75', '2']
const ALIGNS = [
  { value: 'left', label: 'По левому краю' },
  { value: 'center', label: 'По центру' },
  { value: 'right', label: 'По правому краю' },
  { value: 'justify', label: 'По ширине' },
]

const selectCls =
  'h-8 rounded-lg border-0 bg-white px-2 text-xs text-[#4f5a67] outline-none ring-1 ring-black/[0.06] focus:ring-2 focus:ring-[#28394c]/15'

function Btn({
  active,
  title,
  onClick,
  children,
}: {
  active?: boolean
  title: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg px-2 text-sm transition ${
        active
          ? 'bg-[#28394c] text-white'
          : 'text-[#4f5a67] hover:bg-white hover:text-[#28313d]'
      }`}
    >
      {children}
    </button>
  )
}

export default function RichTextEditor({
  name,
  initial = '',
}: {
  name: string
  initial?: string
}) {
  const [html, setHtml] = useState(toHtml(initial))

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: false },
      }),
      TextStyle,
      Color,
      FontSize,
      LineHeight,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: toHtml(initial),
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[160px] px-3.5 py-3 font-manrope text-[14px] outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      setHtml(editor.isEmpty ? '' : editor.getHTML())
    },
  })

  if (!editor) {
    return <div className="h-[220px] rounded-xl bg-[#f4f5f7]" />
  }

  const attrs = editor.getAttributes('textStyle')

  function setLink() {
    const previous = editor!.getAttributes('link').href as string | undefined
    const url = window.prompt('Адрес ссылки (пусто — убрать ссылку)', previous ?? 'https://')

    if (url === null) return

    if (url.trim() === '') {
      editor!.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor!.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  return (
    <div className="overflow-hidden rounded-xl bg-[#f4f5f7] ring-1 ring-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-[#28394c]/15">
      <input type="hidden" name={name} value={html} />

      <div className="flex flex-wrap items-center gap-1 border-b border-[#e7eaed] bg-[#f4f5f7] p-1.5">
        <Btn title="Жирный" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <span className="font-bold">B</span>
        </Btn>
        <Btn title="Курсив" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <span className="italic">I</span>
        </Btn>
        <Btn title="Подчёркнутый" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <span className="underline">U</span>
        </Btn>
        <Btn title="Зачёркнутый" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <span className="line-through">S</span>
        </Btn>
        <Btn title="Ссылка" active={editor.isActive('link')} onClick={setLink}>
          Ссылка
        </Btn>

        <span className="mx-1 h-5 w-px bg-[#d9dee3]" />

        <Btn title="Нумерованный список" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1.
        </Btn>
        <Btn title="Маркированный список" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          •
        </Btn>

        <span className="mx-1 h-5 w-px bg-[#d9dee3]" />

        <label title="Цвет текста" className="flex h-8 cursor-pointer items-center gap-1 rounded-lg px-2 text-xs text-[#4f5a67] hover:bg-white">
          A
          <input
            type="color"
            value={(attrs.color as string) || '#1c2126'}
            onChange={(event) => editor.chain().focus().setColor(event.target.value).run()}
            className="h-4 w-4 cursor-pointer border-0 bg-transparent p-0"
          />
        </label>

        <label title="Выделение цветом" className="flex h-8 cursor-pointer items-center gap-1 rounded-lg px-2 text-xs text-[#4f5a67] hover:bg-white">
          Фон
          <input
            type="color"
            defaultValue="#fff3a3"
            onChange={(event) =>
              editor.chain().focus().setHighlight({ color: event.target.value }).run()
            }
            className="h-4 w-4 cursor-pointer border-0 bg-transparent p-0"
          />
        </label>

        <select
          title="Размер шрифта"
          value={(attrs.fontSize as string) || ''}
          onChange={(event) => {
            const value = event.target.value
            if (value) {
              editor.chain().focus().setFontSize(value).run()
            } else {
              editor.chain().focus().unsetFontSize().run()
            }
          }}
          className={selectCls}
        >
          <option value="">Размер</option>
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <select
          title="Межстрочный интервал"
          value={(attrs.lineHeight as string) || ''}
          onChange={(event) => {
            const value = event.target.value
            if (value) {
              editor.chain().focus().setLineHeight(value).run()
            } else {
              editor.chain().focus().unsetLineHeight().run()
            }
          }}
          className={selectCls}
        >
          <option value="">Интервал</option>
          {LINE_HEIGHTS.map((height) => (
            <option key={height} value={height}>
              {height}
            </option>
          ))}
        </select>

        <select
          title="Выравнивание"
          value={
            ALIGNS.find((a) => editor.isActive({ textAlign: a.value }))?.value ?? 'left'
          }
          onChange={(event) =>
            editor.chain().focus().setTextAlign(event.target.value).run()
          }
          className={selectCls}
        >
          {ALIGNS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>

        <span className="mx-1 h-5 w-px bg-[#d9dee3]" />

        <Btn
          title="Очистить форматирование"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        >
          Сброс
        </Btn>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}