import { BlogHeader } from "@/components/blog-header"
import { BlogPostPreview } from "@/components/blog-post-preview"
import { BlogSidebar } from "@/components/blog-sidebar"
import { MicroPost } from "@/components/micro-post"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <BlogHeader />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
          <main>
            <MicroPost
              slug="quick-thought-ai-tooling"
              content="Hot take: The best AI coding tool is the one that makes you think MORE about your code, not less. If you're copy-pasting without understanding, you're building technical debt, not software."
              date="November 7, 2025"
              categories={["Quick Thoughts", "AI Tools"]}
            />

            <div className="mt-12 pt-12 border-t border-border">
              <BlogPostPreview
                slug="beyond-autocomplete-mastering-ai-assisted-coding"
                title="Beyond Autocomplete: Mastering the Art of Effective AI-Assisted Coding"
                date="November 6, 2025"
                readTime="12 min read"
                excerpt="AI coding assistants have evolved far beyond simple autocomplete. Learn how to leverage these tools effectively to become a more productive developer while maintaining code quality and understanding."
                content="The landscape of software development has been transformed by AI-assisted coding tools. What started as simple autocomplete has evolved into sophisticated systems that can generate entire functions, refactor code, and even architect solutions. But with great power comes great responsibility—and the need for a new set of skills.

Many developers fall into the trap of treating AI assistants as magic boxes that simply produce code. They copy-paste suggestions without understanding the underlying logic, leading to technical debt and maintenance nightmares. The key to effective AI-assisted coding isn't about generating more code faster—it's about using AI as a collaborative partner in the development process.

The most successful developers using AI tools follow a pattern: they start with clear intent, provide context, iterate on suggestions, and critically evaluate the output. They understand that AI assistants are tools to augment their capabilities, not replace their judgment. This means knowing when to accept a suggestion, when to modify it, and when to reject it entirely.

One crucial skill is prompt engineering for code generation. The quality of AI-generated code is directly proportional to the clarity of your request. Instead of asking 'create a login function,' effective developers provide context: 'create a secure login function using bcrypt for password hashing, with rate limiting and proper error handling for a Node.js Express application.'

Another critical aspect is understanding the code that AI generates. It's tempting to accept suggestions blindly, but this leads to codebases filled with patterns you don't understand. Take time to read through generated code, understand the algorithms and patterns being used, and learn from them. AI assistants can be excellent teachers if you approach them with curiosity."
                categories={["AI Tools", "Productivity", "Best Practices"]}
                image="/ai-coding-assistant-developer-at-computer.jpg" // Added image
              />
            </div>

            <div className="mt-12 pt-12 border-t border-border">
              <BlogPostPreview
                slug="understanding-transformer-architecture"
                title="Understanding Transformer Architecture: The Foundation of Modern AI"
                date="November 5, 2025"
                readTime="8 min read"
                excerpt="Transformers have revolutionized the field of artificial intelligence, powering everything from ChatGPT to image generation models. But what makes them so powerful? In this deep dive, we'll explore the architecture that changed everything."
                content="The transformer architecture, introduced in the groundbreaking 2017 paper 'Attention Is All You Need,' fundamentally changed how we approach sequence-to-sequence tasks in machine learning. Unlike previous architectures that relied on recurrent or convolutional layers, transformers use a mechanism called self-attention to process input data in parallel.

At its core, the transformer consists of an encoder and decoder, each made up of multiple identical layers. The key innovation is the self-attention mechanism, which allows the model to weigh the importance of different parts of the input when processing each element. This means the model can capture long-range dependencies without the limitations of recurrent neural networks.

The attention mechanism works by computing three vectors for each input: Query (Q), Key (K), and Value (V). These are used to calculate attention scores that determine how much focus to place on other parts of the input. The formula is elegant: Attention(Q, K, V) = softmax(QK^T / √d_k)V."
                categories={["Machine Learning", "Transformers", "Deep Learning"]}
                image="/neural-network-transformer-architecture-diagram.jpg" // Added image
              />
            </div>
          </main>
          <BlogSidebar />
        </div>
      </div>
    </div>
  )
}
