import { forwardRef, useEffect, useRef } from "react";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  UndoRedo,
  CodeToggle,
  InsertCodeBlock,
  Separator,
  type MDXEditorMethods,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { Box } from "@mui/material";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MarkdownEditor = forwardRef<MDXEditorMethods, MarkdownEditorProps>(
  function MarkdownEditor({ value, onChange, placeholder }, ref) {
    const internalRef = useRef<MDXEditorMethods>(null);
    const editorRef = (ref as React.RefObject<MDXEditorMethods>) ?? internalRef;

    // Sync external value changes into the editor
    useEffect(() => {
      if (editorRef.current) {
        const current = editorRef.current.getMarkdown();
        if (current !== value) {
          editorRef.current.setMarkdown(value);
        }
      }
    }, [value, editorRef]);

    return (
      <Box
        sx={{
          "& .mdxeditor": {
            bgcolor: "transparent",
            color: "#F1F5F9",
            fontFamily: "inherit",
            "--baseTextContrast": "#F1F5F9",
            "--baseBg": "transparent",
            "--baseBgActive": "rgba(108, 99, 255, 0.08)",
            "--baseBgHover": "rgba(108, 99, 255, 0.05)",
            "--baseBorder": "rgba(108, 99, 255, 0.15)",
            "--baseLine": "rgba(108, 99, 255, 0.12)",
            "--basePageBg": "rgba(10, 14, 26, 0.5)",
          },
          // Toolbar styling
          "& [class*='_toolbarRoot_']": {
            bgcolor: "rgba(10, 14, 26, 0.6)",
            borderBottom: "1px solid rgba(108, 99, 255, 0.12)",
            borderRadius: 0,
            flexWrap: "wrap",
            gap: 0.25,
            px: 1,
          },
          "& [class*='_toolbarRoot_'] button, & [class*='_toolbarRoot_'] [role='button']": {
            color: "#94A3B8 !important",
            borderRadius: "4px",
            "&:hover": { bgcolor: "rgba(108, 99, 255, 0.1) !important", color: "#F1F5F9 !important" },
            "&[data-state='on'], &[aria-pressed='true']": { bgcolor: "rgba(108, 99, 255, 0.15) !important", color: "#6C63FF !important" },
          },
          "& [class*='_toolbarRoot_'] select": {
            color: "#94A3B8 !important",
            bgcolor: "rgba(10, 14, 26, 0.4) !important",
            border: "1px solid rgba(108, 99, 255, 0.15) !important",
            borderRadius: "4px !important",
            fontSize: "0.75rem",
            "&:hover": { borderColor: "rgba(108, 99, 255, 0.3) !important" },
            "& option": { bgcolor: "#111827 !important" },
          },
          "& [class*='_separator_']": {
            bgcolor: "rgba(108, 99, 255, 0.12) !important",
          },
          // Editor content area
          "& [class*='_contentEditable_'], & [role='textbox']": {
            minHeight: 400,
            px: 3,
            py: 2,
            fontSize: "0.95rem",
            lineHeight: 1.8,
            color: "#CBD5E1",
            caretColor: "#6C63FF",
            "&:focus": { outline: "none" },
          },
          // Markdown element styles
          "& [class*='_contentEditable_'] h1, & [role='textbox'] h1": { color: "#F1F5F9", fontWeight: 800, fontSize: "1.8rem", mt: 3, mb: 1.5 },
          "& [class*='_contentEditable_'] h2, & [role='textbox'] h2": { color: "#F1F5F9", fontWeight: 700, fontSize: "1.5rem", mt: 3, mb: 1.5 },
          "& [class*='_contentEditable_'] h3, & [role='textbox'] h3": { color: "#F1F5F9", fontWeight: 600, fontSize: "1.2rem", mt: 2, mb: 1 },
          "& [class*='_contentEditable_'] p, & [role='textbox'] p": { color: "#CBD5E1", mb: 1.5 },
          "& [class*='_contentEditable_'] a, & [role='textbox'] a": { color: "#6C63FF", textDecoration: "none", borderBottom: "1px solid rgba(108,99,255,0.3)" },
          "& [class*='_contentEditable_'] blockquote, & [role='textbox'] blockquote": {
            borderLeft: "3px solid #6C63FF",
            pl: 2,
            py: 0.5,
            my: 2,
            mx: 0,
            bgcolor: "rgba(108, 99, 255, 0.05)",
            borderRadius: "0 6px 6px 0",
          },
          "& [class*='_contentEditable_'] code, & [role='textbox'] code": {
            fontFamily: "monospace",
            fontSize: "0.85em",
            bgcolor: "rgba(108, 99, 255, 0.1)",
            color: "#8B85FF",
            px: 0.6,
            py: 0.15,
            borderRadius: 0.5,
          },
          "& [class*='_contentEditable_'] pre, & [role='textbox'] pre": {
            bgcolor: "rgba(10, 14, 26, 0.8) !important",
            border: "1px solid rgba(108, 99, 255, 0.1)",
            borderRadius: 2,
            p: 2,
            my: 2,
            "& code": { bgcolor: "transparent !important", color: "#c9d1d9 !important", px: 0, py: 0 },
          },
          "& [class*='_contentEditable_'] img, & [role='textbox'] img": {
            maxWidth: "100%",
            borderRadius: 2,
            border: "1px solid rgba(108, 99, 255, 0.1)",
          },
          "& [class*='_contentEditable_'] table, & [role='textbox'] table": {
            width: "100%",
            borderCollapse: "collapse",
            my: 2,
            "& th": { textAlign: "left", py: 1, px: 1.5, fontWeight: 600, fontSize: "0.85rem", color: "#F1F5F9", borderBottom: "2px solid rgba(108, 99, 255, 0.15)", bgcolor: "rgba(108, 99, 255, 0.04)" },
            "& td": { py: 1, px: 1.5, fontSize: "0.85rem", color: "#CBD5E1", borderBottom: "1px solid rgba(108, 99, 255, 0.08)" },
          },
          "& [class*='_contentEditable_'] hr, & [role='textbox'] hr": {
            border: "none",
            height: 1,
            bgcolor: "rgba(108, 99, 255, 0.12)",
            my: 3,
          },
          "& [class*='_contentEditable_'] ul, & [class*='_contentEditable_'] ol, & [role='textbox'] ul, & [role='textbox'] ol": {
            color: "#CBD5E1",
            pl: 2.5,
            "& li": { mb: 0.5, lineHeight: 1.7 },
          },
          // Code mirror (code block editor)
          "& .cm-editor": {
            bgcolor: "rgba(10, 14, 26, 0.8) !important",
            fontSize: "0.85rem",
            "& .cm-gutters": { bgcolor: "rgba(10, 14, 26, 0.9) !important", borderRight: "1px solid rgba(108,99,255,0.1)" },
            "& .cm-content": { caretColor: "#6C63FF" },
            "& .cm-activeLine": { bgcolor: "rgba(108, 99, 255, 0.05) !important" },
          },
          // Dialogs (link, image)
          "& [class*='_dialogContent_'], & [class*='_dialogOverlay_'] > div": {
            bgcolor: "#111827 !important",
            border: "1px solid rgba(108, 99, 255, 0.2) !important",
            borderRadius: "8px !important",
            color: "#F1F5F9",
          },
          "& [class*='_dialogContent_'] input, & [class*='_dialogContent_'] select": {
            bgcolor: "rgba(10, 14, 26, 0.5) !important",
            color: "#F1F5F9 !important",
            border: "1px solid rgba(108, 99, 255, 0.2) !important",
            borderRadius: "4px !important",
            "&:focus": { borderColor: "#6C63FF !important", outline: "none" },
          },
          "& [class*='_dialogContent_'] button": {
            bgcolor: "#6C63FF !important",
            color: "#fff !important",
            borderRadius: "4px !important",
            border: "none !important",
            "&:hover": { bgcolor: "#5B54E6 !important" },
          },
          "& [class*='_placeholder_']": {
            color: "#475569 !important",
          },
          // Outer border
          border: "1px solid rgba(108, 99, 255, 0.12)",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "rgba(10, 14, 26, 0.3)",
        }}
      >
        <MDXEditor
          ref={editorRef}
          markdown={value}
          onChange={onChange}
          placeholder={placeholder ?? "Start writing..."}
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            imagePlugin({
              imageUploadHandler: async () => {
                // For now, prompt for URL. Replace with actual upload when Cloudinary is wired.
                return Promise.resolve("https://via.placeholder.com/600x400");
              },
              imageAutocompleteSuggestions: [],
            }),
            tablePlugin(),
            codeBlockPlugin({ defaultCodeBlockLanguage: "typescript" }),
            codeMirrorPlugin({
              codeBlockLanguages: {
                typescript: "TypeScript",
                javascript: "JavaScript",
                go: "Go",
                python: "Python",
                rust: "Rust",
                css: "CSS",
                html: "HTML",
                json: "JSON",
                sql: "SQL",
                bash: "Bash",
                yaml: "YAML",
                markdown: "Markdown",
              },
            }),
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <UndoRedo />
                  <Separator />
                  <BlockTypeSelect />
                  <Separator />
                  <BoldItalicUnderlineToggles />
                  <CodeToggle />
                  <Separator />
                  <ListsToggle />
                  <Separator />
                  <CreateLink />
                  <InsertImage />
                  <Separator />
                  <InsertTable />
                  <InsertCodeBlock />
                  <InsertThematicBreak />
                </>
              ),
            }),
          ]}
        />
      </Box>
    );
  }
);

export default MarkdownEditor;
