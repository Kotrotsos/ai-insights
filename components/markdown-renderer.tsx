'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-gray dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-4xl font-bold mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-3xl font-bold mt-8 mb-4" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-2xl font-bold mt-6 mb-3" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4 leading-7" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
          li: ({ node, ...props }) => <li className="mb-2" {...props} />,
          code: ({ node, inline, ...props }: any) =>
            inline ? (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
            ) : (
              <code className="block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono" {...props} />
            ),
          pre: ({ node, ...props }) => <pre className="mb-4" {...props} />,
          a: ({ node, ...props }) => <a className="text-primary hover:underline" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
