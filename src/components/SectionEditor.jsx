import { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';

function TiptapToolbar({ editor }) {
  if (!editor) return null;

  const btn = (active, onClick, label) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 text-xs rounded transition-colors ${
        active
          ? 'bg-gray-800 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex gap-1 flex-wrap p-2 border-b border-gray-200 bg-gray-50 rounded-t-md sticky top-0 z-10">
      {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'B')}
      {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'I')}
      {btn(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), 'U')}
      <span className="w-px bg-gray-300 mx-1" />
      {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), '• List')}
      {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), '1. List')}
      <span className="w-px bg-gray-300 mx-1" />
      {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2')}
      <span className="w-px bg-gray-300 mx-1" />
      {btn(false, () => editor.chain().focus().undo().run(), '↩')}
      {btn(false, () => editor.chain().focus().redo().run(), '↪')}
    </div>
  );
}

function SectionBlock({ section, index, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast, accentColor }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2] },
      }),
      Underline,
    ],
    content: section.content || '',
    onUpdate: ({ editor }) => {
      onChange(index, 'content', editor.getHTML());
    },
  });

  return (
    <div className="border border-gray-200 rounded-md bg-white">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 rounded-t-md">
        <span className="text-xs font-bold text-gray-400 w-6">{index + 1}.</span>
        <input
          type="text"
          value={section.heading}
          onChange={(e) => onChange(index, 'heading', e.target.value)}
          className="flex-1 text-sm font-semibold bg-transparent border-none outline-none"
          placeholder="Section heading..."
        />
        <div className="flex gap-1">
          {!isFirst && (
            <button onClick={() => onMoveUp(index)} className="text-gray-400 hover:text-gray-600 text-xs" title="Move up">
              ▲
            </button>
          )}
          {!isLast && (
            <button onClick={() => onMoveDown(index)} className="text-gray-400 hover:text-gray-600 text-xs" title="Move down">
              ▼
            </button>
          )}
          <button
            onClick={() => onRemove(index)}
            className="text-red-400 hover:text-red-600 text-xs ml-1"
            title="Remove section"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="tiptap-editor">
        <TiptapToolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default function SectionEditor({ sections, onChange, accentColor }) {
  const handleSectionChange = useCallback(
    (index, field, value) => {
      const updated = [...sections];
      updated[index] = { ...updated[index], [field]: value };
      onChange(updated);
    },
    [sections, onChange]
  );

  const handleAdd = useCallback(() => {
    onChange([...sections, { heading: '', content: '' }]);
  }, [sections, onChange]);

  const handleRemove = useCallback(
    (index) => {
      onChange(sections.filter((_, i) => i !== index));
    },
    [sections, onChange]
  );

  const handleMoveUp = useCallback(
    (index) => {
      if (index === 0) return;
      const updated = [...sections];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      onChange(updated);
    },
    [sections, onChange]
  );

  const handleMoveDown = useCallback(
    (index) => {
      if (index === sections.length - 1) return;
      const updated = [...sections];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      onChange(updated);
    },
    [sections, onChange]
  );

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-2">
        Letter Body — Sections ({sections.length})
      </label>
      <div className="space-y-3">
        {sections.map((section, i) => (
          <SectionBlock
            key={i}
            section={section}
            index={i}
            onChange={handleSectionChange}
            onRemove={handleRemove}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            isFirst={i === 0}
            isLast={i === sections.length - 1}
            accentColor={accentColor}
          />
        ))}
      </div>
      <button
        onClick={handleAdd}
        className="mt-2 w-full py-2 text-xs text-gray-500 border border-dashed border-gray-300 rounded-md hover:border-gray-400 hover:text-gray-700 transition-colors"
      >
        + Add Section
      </button>
    </div>
  );
}
