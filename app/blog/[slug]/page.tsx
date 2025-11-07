import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BlogHeader } from "@/components/blog-header"
import { BlogSidebar } from "@/components/blog-sidebar"

// In a real app, this would fetch from a database or CMS
function getPost(slug: string) {
  // Dummy data for now
  return {
    title: "Understanding Transformer Architecture: The Foundation of Modern AI",
    date: "November 5, 2025",
    readTime: "8 min read",
    categories: ["Machine Learning", "Transformers", "Deep Learning"],
    content: `Transformers have revolutionized the field of artificial intelligence, powering everything from ChatGPT to image generation models. But what makes them so powerful? In this deep dive, we'll explore the architecture that changed everything.

## The Birth of Transformers

The transformer architecture, introduced in the groundbreaking 2017 paper "Attention Is All You Need," fundamentally changed how we approach sequence-to-sequence tasks in machine learning. Unlike previous architectures that relied on recurrent or convolutional layers, transformers use a mechanism called self-attention to process input data in parallel.

At its core, the transformer consists of an encoder and decoder, each made up of multiple identical layers. The key innovation is the self-attention mechanism, which allows the model to weigh the importance of different parts of the input when processing each element. This means the model can capture long-range dependencies without the limitations of recurrent neural networks.

## How Self-Attention Works

The attention mechanism works by computing three vectors for each input: Query (Q), Key (K), and Value (V). These are used to calculate attention scores that determine how much focus to place on other parts of the input. The formula is elegant:

**Attention(Q, K, V) = softmax(QK^T / √d_k)V**

This mechanism allows the model to dynamically focus on relevant parts of the input sequence, regardless of their distance from each other. It's like having a spotlight that can illuminate multiple areas simultaneously, with varying intensities.

## Multi-Head Attention

One of the clever innovations in transformers is multi-head attention. Instead of performing a single attention function, the model runs multiple attention mechanisms in parallel (typically 8 or 16 "heads"). Each head can learn to focus on different aspects of the relationships in the data.

Think of it like having multiple experts examining the same text, each looking for different patterns or relationships. One head might focus on syntactic relationships, another on semantic meaning, and yet another on long-range dependencies.

## Positional Encoding

Since transformers process all tokens in parallel, they need a way to understand the order of the sequence. This is where positional encoding comes in. The original paper used sinusoidal functions to inject position information:

- PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
- PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))

This encoding allows the model to learn relative positions and generalize to sequence lengths not seen during training.

## The Impact on Modern AI

The transformer architecture has become the foundation for most state-of-the-art language models. GPT (Generative Pre-trained Transformer) uses only the decoder part, while BERT (Bidirectional Encoder Representations from Transformers) uses only the encoder. More recent models like GPT-4 and Claude have scaled up the basic transformer architecture to billions of parameters.

Beyond language, transformers have been successfully applied to computer vision (Vision Transformers), protein folding (AlphaFold), and even game playing. The architecture's ability to capture complex relationships in data makes it incredibly versatile.

## Looking Forward

As we continue to scale transformers and explore variations like sparse attention and efficient transformers, the architecture continues to evolve. Understanding these fundamentals is crucial for anyone working in modern AI, as they form the basis for the most powerful models we have today.

The transformer's elegance lies in its simplicity and effectiveness. By replacing complex recurrent structures with parallelizable attention mechanisms, it opened the door to training much larger models on much more data—ultimately leading to the AI revolution we're experiencing today.`,
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug)

  return (
    <div className="min-h-screen">
      <BlogHeader />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
          <main>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            <article>
              <header className="mb-8">
                <h1 className="text-4xl font-bold mb-4 text-balance leading-tight">{post.title}</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                  <time dateTime={post.date}>{post.date}</time>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
                {post.categories.length > 0 && (
                  <div className="flex gap-3 flex-wrap">
                    {post.categories.map((category) => (
                      <Link
                        key={category}
                        href={`/category/${category.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-sm text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                )}
              </header>

              <div className="prose prose-neutral dark:prose-invert max-w-none">
                {post.content.split("\n\n").map((paragraph, index) => {
                  if (paragraph.startsWith("## ")) {
                    return (
                      <h2 key={index} className="text-2xl font-semibold mt-12 mb-4">
                        {paragraph.replace("## ", "")}
                      </h2>
                    )
                  }
                  if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                    return (
                      <p key={index} className="font-mono text-sm bg-muted p-4 rounded-lg my-6">
                        {paragraph.replace(/\*\*/g, "")}
                      </p>
                    )
                  }
                  if (paragraph.startsWith("- ")) {
                    const items = paragraph.split("\n")
                    return (
                      <ul key={index} className="list-disc pl-6 my-6 space-y-2">
                        {items.map((item, i) => (
                          <li key={i}>{item.replace("- ", "")}</li>
                        ))}
                      </ul>
                    )
                  }
                  return (
                    <p key={index} className="mb-6 leading-relaxed text-foreground/90">
                      {paragraph}
                    </p>
                  )
                })}
              </div>
            </article>
          </main>
          <BlogSidebar />
        </div>
      </div>
    </div>
  )
}
