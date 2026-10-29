"""
Markdown -> safe HTML  (AI ke reply dikhane ke liye)

Safety:
- Raw HTML band hai (html=False): AI <script> / <img onerror=...> bheje to wo
  text ban kar escape ho jata hai, chalta nahi.
- javascript: jaise khatarnak links markdown-it khud block karta hai.
- Images band hain (tracking pixel / remote image se bachne ke liye).
"""
import html
import re

from django.utils.html import linebreaks as _django_linebreaks

try:
    from markdown_it import MarkdownIt
except ImportError:  # pip install markdown-it-py nahi hua to site crash na ho
    MarkdownIt = None
    print("[markdown] markdown-it-py install nahi hai: `pip install markdown-it-py`")


def _build():
    md = (
        MarkdownIt("commonmark", {"html": False, "breaks": True})
        .enable("table")
        .enable("strikethrough")
        .disable("image")
    )

    # links: naye tab me, safe rel ke saath
    def link_open(self, tokens, idx, options, env):
        tokens[idx].attrSet("target", "_blank")
        tokens[idx].attrSet("rel", "noopener noreferrer nofollow")
        return self.renderToken(tokens, idx, options, env)

    # code block: chat.css ke .code / .code-h / .code-copy ke hisaab se
    def fence(self, tokens, idx, options, env):
        token = tokens[idx]
        lang = (token.info or "").strip().split(" ")[0]
        lang = re.sub(r"[^A-Za-z0-9_+#.-]", "", lang) or "code"
        code = html.escape(token.content)
        return (
            '<div class="code"><div class="code-h"><span>%s</span>'
            '<button type="button" class="code-copy">Copy</button></div>'
            "<pre><code>%s</code></pre></div>\n" % (html.escape(lang), code)
        )

    def code_block(self, tokens, idx, options, env):  # indented code
        return (
            '<div class="code"><div class="code-h"><span>code</span>'
            '<button type="button" class="code-copy">Copy</button></div>'
            "<pre><code>%s</code></pre></div>\n" % html.escape(tokens[idx].content)
        )

    # table: chhoti screen par horizontal scroll ke liye wrapper
    md.add_render_rule("link_open", link_open)
    md.add_render_rule("fence", fence)
    md.add_render_rule("code_block", code_block)
    md.add_render_rule("table_open", lambda s, t, i, o, e: '<div class="tbl"><table>\n')
    md.add_render_rule("table_close", lambda s, t, i, o, e: "</table></div>\n")
    return md


_md = _build() if MarkdownIt else None


def render_markdown(text):
    """Markdown text -> safe HTML string."""
    text = text or ""
    if _md is None:
        return _django_linebreaks(text, autoescape=True)  # fallback: plain text
    return _md.render(text)
