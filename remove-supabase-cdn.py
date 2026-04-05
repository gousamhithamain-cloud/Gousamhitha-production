#!/usr/bin/env python3
"""
Remove Supabase CDN scripts and related insecure code from HTML files
"""

import re
import os
from pathlib import Path

def clean_html_file(filepath):
    """Remove Supabase CDN, config scripts, and inline credentials from HTML file"""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes = []
    
    # 1. Remove Supabase CDN script tags
    patterns_to_remove = [
        r'<script\s+src="https://cdn\.jsdelivr\.net/npm/@supabase/supabase-js@2"></script>\s*',
        r'<script\s+src="https://unpkg\.com/@supabase/supabase-js@2"></script>\s*',
        r'<script\s+src="https://cdn\.jsdelivr\.net/npm/@supabase/supabase-js@\d+"></script>\s*',
        r'<script\s+src="https://unpkg\.com/@supabase/supabase-js@\d+"></script>\s*',
    ]
    
    for pattern in patterns_to_remove:
        if re.search(pattern, content):
            content = re.sub(pattern, '', content)
            changes.append(f"Removed Supabase CDN script")
    
    # 2. Remove config.js references
    config_patterns = [
        r'<script\s+src="\./config\.js"></script>\s*',
        r'<script\s+src="config\.js"></script>\s*',
    ]
    
    for pattern in config_patterns:
        if re.search(pattern, content):
            content = re.sub(pattern, '', content)
            changes.append(f"Removed config.js reference")
    
    # 3. Remove inline SUPABASE_CONFIG blocks
    inline_config_pattern = r'<script>\s*console\.log\([\'"].*Setting up inline config.*[\'"]\);\s*window\.SUPABASE_CONFIG\s*=\s*\{[^}]+\};\s*console\.log\([\'"].*Inline SUPABASE_CONFIG loaded.*[\'"]\);\s*</script>\s*'
    if re.search(inline_config_pattern, content, re.DOTALL):
        content = re.sub(inline_config_pattern, '', content, flags=re.DOTALL)
        changes.append(f"Removed inline SUPABASE_CONFIG block")
    
    # 4. Remove supabase-auth.js references
    auth_patterns = [
        r'<script\s+src="supabase-auth\.js"></script>\s*',
        r'<script\s+src="js/supabase-auth\.js"></script>\s*',
        r'<script\s+src="js/supabase-auth\.js\?v=\d+"></script>\s*',
    ]
    
    for pattern in auth_patterns:
        if re.search(pattern, content):
            content = re.sub(pattern, '<script src="js/auth-handler.js"></script>\n    ', content)
            changes.append(f"Replaced supabase-auth.js with auth-handler.js")
    
    # 5. Remove js/supabase-client.js references
    client_patterns = [
        r'<script\s+src="js/supabase-client\.js\?v=\d+"></script>\s*',
        r'<script\s+src="js/supabase-client\.js"></script>\s*',
    ]
    
    for pattern in client_patterns:
        if re.search(pattern, content):
            content = re.sub(pattern, '', content)
            changes.append(f"Removed js/supabase-client.js reference")
    
    # 6. Remove zero-delay-supabase.js references
    zero_delay_pattern = r'<script\s+src="js/zero-delay-supabase\.js"></script>\s*'
    if re.search(zero_delay_pattern, content):
        content = re.sub(zero_delay_pattern, '', content)
        changes.append(f"Removed js/zero-delay-supabase.js reference")
    
    # 7. Remove comments about Supabase
    comment_patterns = [
        r'<!-- Supabase configuration - MUST load in this exact order -->\s*',
        r'<!-- Supabase Library from CDN \(kept for auth session only\) -->\s*',
        r'<!-- Supabase Client Configuration -->\s*',
        r'<!-- Supabase Scripts -->\s*',
        r'<!-- Supabase Client -->\s*',
        r'<!-- CRITICAL: Inline config to avoid loading issues -->\s*',
        r'<!-- Scripts: config\.js already loaded in <head> -->\s*',
    ]
    
    for pattern in comment_patterns:
        if re.search(pattern, content):
            content = re.sub(pattern, '', content)
    
    # 8. Clean up multiple consecutive blank lines
    content = re.sub(r'\n\s*\n\s*\n+', '\n\n', content)
    
    # Only write if changes were made
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return changes
    
    return []

def main():
    """Process all HTML files in the project"""
    
    base_dir = Path(__file__).parent
    html_files = list(base_dir.glob('*.html'))
    
    print(f"🔍 Found {len(html_files)} HTML files to process\n")
    
    total_changes = 0
    files_modified = 0
    
    for html_file in sorted(html_files):
        changes = clean_html_file(html_file)
        if changes:
            files_modified += 1
            total_changes += len(changes)
            print(f"✅ {html_file.name}")
            for change in changes:
                print(f"   - {change}")
        else:
            print(f"⏭️  {html_file.name} (no changes needed)")
    
    print(f"\n📊 Summary:")
    print(f"   Files processed: {len(html_files)}")
    print(f"   Files modified: {files_modified}")
    print(f"   Total changes: {total_changes}")
    print(f"\n✅ Security refactor complete!")

if __name__ == '__main__':
    main()
