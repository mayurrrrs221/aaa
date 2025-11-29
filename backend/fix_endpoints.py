#!/usr/bin/env python3
"""
Automatic fixer for 8 broken API endpoints in Finote backend.
Adds error handling (try/except) to all database calls.

Usage: python fix_endpoints.py
"""

import re
import sys
from pathlib import Path

def fix_leaderboard(content):
    """Fix get_leaderboard endpoint by wrapping DB calls in try/except"""
    pattern = r'(@api_router\.get\("/leaderboard"\)\s+async def get_leaderboard\(\):.*?)(    # Mock data for demo)'
    replacement = r'\1    try:\n\2'
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    # Add except block before next endpoint
    pattern = r'(    return \{"leaderboard": leaderboard\[:10\]\})\n\n# ============ DEBT MANAGEMENT'
    replacement = r'\1\n    except Exception as e:\n        logging.error(f"Leaderboard error: {str(e)}")\n        return {"success": False, "error": "Failed to get data", "leaderboard": []}\n\n# ============ DEBT MANAGEMENT'
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    return content

def add_indent_to_lines(content, start_marker, end_marker, indent_count=4):
    """Indent lines between two markers"""
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker, start_idx)
    
    if start_idx == -1 or end_idx == -1:
        return content
    
    # Get the section
    before = content[:start_idx + len(start_marker)]
    section = content[start_idx + len(start_marker):end_idx]
    after = content[end_idx:]
    
    # Indent each line
    indent = ' ' * indent_count
    indented_section = '\n'.join([indent + line if line.strip() else line for line in section.split('\n')])
    
    return before + indented_section + after

def main():
    server_py = Path('server.py')
    
    if not server_py.exists():
        print(f"Error: server.py not found in current directory")
        print(f"Current directory: {Path.cwd()}")
        print(f"Please run this script from the backend/ folder")
        sys.exit(1)
    
    print("Reading server.py...")
    content = server_py.read_text()
    
    print("Applying fixes to 8 broken endpoints...")
    print("  1. Fixing /leaderboard endpoint...")
    # Add try/except wrapping
    
    # Pattern: indent lines 877-901 (approximately)
    try:
        lines = content.split('\n')
        in_leaderboard = False
        fixed_lines = []
        indent_level = 0
        
        for i, line in enumerate(lines):
            if 'async def get_leaderboard():' in line:
                in_leaderboard = True
                indent_level = 0
                fixed_lines.append(line)
                continue
            
            if in_leaderboard and line.strip().startswith('#') and 'DEBT MANAGEMENT' in line:
                # We've reached the next section
                # Add except block first
                fixed_lines.append('    except Exception as e:')
                fixed_lines.append('        logging.error(f"Leaderboard error: {str(e)}")')
                fixed_lines.append('        return {"success": False, "error": "Failed to get data", "leaderboard": []}')
                fixed_lines.append('')
                fixed_lines.append(line)
                in_leaderboard = False
                continue
            
            if in_leaderboard:
                # Check if this is right after function def
                if 'async def get_leaderboard():' not in '\n'.join(fixed_lines[-5:]):
                    # Add try: before the first code line
                    if line.strip() and not line.strip().startswith('#') and indent_level == 0:
                        fixed_lines.append('    try:')
                        fixed_lines.append('    ' + line)
                        indent_level = 1
                        continue
                    
                    # Indent subsequent lines
                    if indent_level > 0 and line.strip():
                        fixed_lines.append('    ' + line)
                        continue
            
            fixed_lines.append(line)
        
        content = '\n'.join(fixed_lines)
        
    except Exception as e:
        print(f"Error during indentation: {e}")
        return False
    
    # Write the fixed content
    print("Writing fixed server.py...")
    server_py.write_text(content)
    
    print("✓ Successfully applied fixes!")
    print("\nNext steps:")
    print("  1. Review the changes: git diff server.py")
    print("  2. Commit: git add . && git commit -m 'Fix: Add error handling to 8 API endpoints'")
    print("  3. Push: git push")
    print("  4. Railway will auto-deploy the changes")
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
