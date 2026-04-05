import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function MarkdownViewer({ content }) {
  return (
    <div className="markdown-body prose prose-slate max-w-none text-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const isInline = !className
            if (isInline) {
              return (
                <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                  {children}
                </code>
              )
            }
            return (
              <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-xs">
                <code className="font-mono" {...props}>{children}</code>
              </pre>
            )
          },
          a({ children, href, ...props }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline" {...props}>
                {children}
              </a>
            )
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-slate-200 text-sm">{children}</table>
              </div>
            )
          },
          th({ children }) {
            return <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-700">{children}</th>
          },
          td({ children }) {
            return <td className="border border-slate-200 px-3 py-2 text-slate-700">{children}</td>
          },
          blockquote({ children }) {
            return <blockquote className="border-l-4 border-indigo-300 pl-4 italic text-slate-600 my-3">{children}</blockquote>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
