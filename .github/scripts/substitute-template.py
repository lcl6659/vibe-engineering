#!/usr/bin/env python3
"""
Safely substitute template variables in a file.
Handles special characters, newlines, and multi-line content.
"""
import sys
import os

def read_file_safe(filepath):
    """Read a file, returning empty string if it doesn't exist."""
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    return ""

def main():
    if len(sys.argv) < 2:
        print("Usage: substitute-template.py <template_file>", file=sys.stderr)
        sys.exit(1)
    
    template_file = sys.argv[1]
    
    # Read template
    template = read_file_safe(template_file)
    
    # Read replacement values from environment variables or files
    backend_spec = read_file_safe("BACKEND_SPEC.md")
    backend_claude_md = read_file_safe("backend/CLAUDE.md")
    
    # Get values from environment (set by GitHub Actions)
    issue_title = os.environ.get("ISSUE_TITLE", "")
    issue_body = os.environ.get("ISSUE_BODY", "")
    issue_comments = os.environ.get("ISSUE_COMMENTS", "")
    existing_files = os.environ.get("EXISTING_FILES", "")
    
    # Perform substitutions
    result = template
    result = result.replace("{{BACKEND_SPEC}}", backend_spec)
    result = result.replace("{{BACKEND_CLAUDE_MD}}", backend_claude_md)
    result = result.replace("{{ISSUE_TITLE}}", issue_title)
    result = result.replace("{{ISSUE_BODY}}", issue_body)
    result = result.replace("{{ISSUE_COMMENTS}}", issue_comments)
    result = result.replace("{{EXISTING_FILES}}", existing_files)
    
    # Output result
    print(result, end='')

if __name__ == "__main__":
    main()
