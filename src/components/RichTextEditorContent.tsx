
import { RefObject } from "react";

interface RichTextEditorContentProps {
  editorRef: RefObject<HTMLDivElement>;
  textDirection: 'ltr' | 'rtl';
  onInput: () => void;
  onPaste: (e: React.ClipboardEvent) => void;
}

const RichTextEditorContent = ({
  editorRef,
  textDirection,
  onInput,
  onPaste
}: RichTextEditorContentProps) => {
  return (
    <div className="p-6">
      <div
        ref={editorRef}
        contentEditable
        onInput={onInput}
        onPaste={onPaste}
        className="min-h-[400px] border-0 outline-none text-base leading-relaxed p-4 rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: "16px",
          lineHeight: "1.6",
          direction: textDirection,
        }}
        data-placeholder="Start typing your document here... You can paste formatted content from other applications."
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

export default RichTextEditorContent;
