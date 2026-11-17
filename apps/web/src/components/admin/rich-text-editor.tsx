"use client";

import * as React from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  initialHtml: string;
  labelId: string;
};

/** WYSIWYG editor that writes HTML into a hidden input, so it works inside a plain <form>. */
export function RichTextEditor({ name, initialHtml, labelId }: Props) {
  const [html, setHtml] = React.useState(initialHtml);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image,
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: "prose-article min-h-[24rem] px-5 py-4 focus:outline-none",
        "aria-labelledby": labelId,
        "aria-multiline": "true",
        role: "textbox",
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.isEmpty ? "" : editor.getHTML()),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface focus-within:border-ink/40">
      {editor ? <Toolbar editor={editor} /> : <div className="h-11 border-b border-border" />}
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const setLink = () => {
    const prev = (editor.getAttributes("link").href as string | undefined) ?? "";
    const url = window.prompt("Link URL (leave empty to remove)", prev);
    if (url === null) return;
    if (url.trim() === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const addImage = () => {
    const url = window.prompt("Image URL (https://…)");
    if (!url || !/^https?:\/\//.test(url.trim())) return;
    const alt = window.prompt("Describe the image (alt text)") ?? "";
    editor.chain().focus().setImage({ src: url.trim(), alt }).run();
  };

  const groups: { label: string; icon: LucideIcon; run: () => void; active?: boolean; disabled?: boolean }[][] = [
    [
      { label: "Bold", icon: Bold, run: () => editor.chain().focus().toggleBold().run(), active: state.bold },
      { label: "Italic", icon: Italic, run: () => editor.chain().focus().toggleItalic().run(), active: state.italic },
      { label: "Strikethrough", icon: Strikethrough, run: () => editor.chain().focus().toggleStrike().run(), active: state.strike },
      { label: "Inline code", icon: Code, run: () => editor.chain().focus().toggleCode().run(), active: state.code },
    ],
    [
      { label: "Heading 2", icon: Heading2, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: state.h2 },
      { label: "Heading 3", icon: Heading3, run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: state.h3 },
      { label: "Bulleted list", icon: List, run: () => editor.chain().focus().toggleBulletList().run(), active: state.bullet },
      { label: "Numbered list", icon: ListOrdered, run: () => editor.chain().focus().toggleOrderedList().run(), active: state.ordered },
      { label: "Quote", icon: Quote, run: () => editor.chain().focus().toggleBlockquote().run(), active: state.quote },
      { label: "Divider", icon: Minus, run: () => editor.chain().focus().setHorizontalRule().run() },
    ],
    [
      { label: "Link", icon: Link2, run: setLink, active: state.link },
      { label: "Image", icon: ImagePlus, run: addImage },
    ],
    [
      { label: "Undo", icon: Undo2, run: () => editor.chain().focus().undo().run(), disabled: !state.canUndo },
      { label: "Redo", icon: Redo2, run: () => editor.chain().focus().redo().run(), disabled: !state.canRedo },
    ],
  ];

  return (
    <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 border-b border-border bg-bg px-2 py-1.5">
      {groups.map((group, gi) => (
        <React.Fragment key={gi}>
          {gi > 0 ? <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" /> : null}
          {group.map(({ label, icon: Icon, run, active, disabled }) => (
            <button
              key={label}
              type="button"
              onClick={run}
              disabled={disabled}
              aria-label={label}
              aria-pressed={active === undefined ? undefined : active}
              title={label}
              className={cn(
                "grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-ink disabled:opacity-35",
                active && "bg-surface text-ink ring-1 ring-border",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </button>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}
