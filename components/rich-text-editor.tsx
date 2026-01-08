"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Toggle } from "@/components/ui/toggle"
import { Bold, Italic, List, ListOrdered } from "lucide-react"
import TextStyle from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import { useEffect, useMemo } from "react"
import { useController, type Control } from "react-hook-form"

interface RichTextEditorProps {
  name?: string
  control?: Control<any>
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function RichTextEditor({ name, control, defaultValue, value, onChange, className }: RichTextEditorProps) {
  const controlledField = useController({ name, control, defaultValue })
  const field = useMemo(() => {
    return name && control ? controlledField.field : { value, onChange }
  }, [name, control, controlledField.field, value, onChange])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc list-outside ml-4",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal list-outside ml-4",
          },
        },
      }),
      TextStyle,
      Color,
      Underline,
      TextAlign.configure({
        types: ["paragraph", "heading"],
      }),
    ],
    content: field.value || "",
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML()
      field.onChange(newContent)
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[120px] w-full rounded-md bg-gray-100 px-3 py-3 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:list-outside [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:ml-4 [&_ul_li]:mt-0 [&_ol_li]:mt-0 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1",
      },
    },
  })

  useEffect(() => {
    if (editor && field.value !== editor.getHTML()) {
      editor.commands.setContent(field.value || "")
    }
  }, [editor, field.value])

  if (!editor) {
    // Show skeleton/placeholder while editor loads to prevent layout shift
    return (
      <div className="border-2 border-transparent rounded-md bg-gray-100">
        <div className="flex items-center gap-1 px-2 py-2 border-b border-gray-300">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="min-h-[120px] w-full rounded-md bg-gray-100 px-3 py-3"></div>
      </div>
    )
  }

  return (
    <div className="border-2 border-transparent rounded-md bg-gray-100 hover:bg-gray-200 focus-within:bg-white focus-within:border-[#00bf63] transition-colors">
      <div className="flex items-center gap-1 px-2 py-2 border-b border-gray-300">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          className="h-8 w-8 data-[state=on]:bg-gray-300 data-[state=on]:text-gray-900"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          className="h-8 w-8 data-[state=on]:bg-gray-300 data-[state=on]:text-gray-900"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("underline")}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          className="h-8 w-8 data-[state=on]:bg-gray-300 data-[state=on]:text-gray-900"
        >
          <span className="underline font-bold text-sm">U</span>
        </Toggle>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          className="h-8 w-8 data-[state=on]:bg-gray-300 data-[state=on]:text-gray-900"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          className="h-8 w-8 data-[state=on]:bg-gray-300 data-[state=on]:text-gray-900"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
      </div>
      <EditorContent editor={editor} className={className} />
    </div>
  )
}

export default RichTextEditor
