from django import template
from django.utils.safestring import mark_safe

from core.markdown_utils import render_markdown

register = template.Library()


@register.filter(name="markdown_html")
def markdown_html(text):
    """{{ m.msg|markdown_html }} -> markdown ko safe HTML bana kar dikhata hai."""
    return mark_safe(render_markdown(text))
