#!/bin/bash
# Apply complete system structure to all projects
# Usage: ./apply-system-structure.sh

SOURCE_DIR="/Users/rioallen/Documents/OS-App-Builder"

# Projects to update
PROJECTS=(
    "/Users/rioallen/Documents/personal-learning-consulting"
    "/Users/rioallen/Documents/productivity-mastery-app"
    "/Users/rioallen/Documents/lawfly-pro"
    "/Users/rioallen/Documents/lawfly-framework"
    "/Users/rioallen/Documents/DropFly/mikes-deli-demo"
    "/Users/rioallen/Documents/DropFly/storm-burger-demo"
    "/Users/rioallen/Documents/DropFly/epnac-ai-demo"
)

echo "🔥 APPLYING SYSTEM STRUCTURE TO ALL PROJECTS"
echo "=============================================="

for project in "${PROJECTS[@]}"; do
    echo ""
    echo "📂 Processing: $(basename "$project")"
    echo "   Path: $project"
    
    if [ ! -d "$project" ]; then
        echo "   ❌ Project directory not found, skipping"
        continue
    fi
    
    cd "$project" || continue
    
    # 1. Create folder structure
    echo "   📁 Creating folder structure..."
    mkdir -p .logs .docs .research .assets .credentials .troubleshoot .progress versions-archive
    
    # 2. Copy system files
    echo "   📋 Copying system files..."
    
    # Copy save-version.sh if not exists
    if [ ! -f "save-version.sh" ]; then
        cp "$SOURCE_DIR/save-version.sh" ./
        chmod +x save-version.sh
        echo "      ✅ Copied save-version.sh"
    else
        echo "      ⚪ save-version.sh already exists"
    fi
    
    # Copy framework docs
    cp "$SOURCE_DIR/TROUBLESHOOTING-PROCESS.md" ./.docs/ 2>/dev/null && echo "      ✅ Copied TROUBLESHOOTING-PROCESS.md"
    cp "$SOURCE_DIR/ENTERPRISE-BACKEND-FRAMEWORK.md" ./.docs/ 2>/dev/null && echo "      ✅ Copied ENTERPRISE-BACKEND-FRAMEWORK.md"
    cp "$SOURCE_DIR/PROJECT-INITIALIZATION-PROMPTS.md" ./.docs/ 2>/dev/null && echo "      ✅ Copied PROJECT-INITIALIZATION-PROMPTS.md"
    cp "$SOURCE_DIR/QUICK-START-REFERENCE.md" ./.docs/ 2>/dev/null && echo "      ✅ Copied QUICK-START-REFERENCE.md"
    cp "$SOURCE_DIR/ENTERPRISE-ENGINEERING-STANDARDS.md" ./.docs/ 2>/dev/null && echo "      ✅ Copied ENTERPRISE-ENGINEERING-STANDARDS.md"
    
    # 3. Create SESSION-MEMORY.md if not exists
    if [ ! -f "SESSION-MEMORY.md" ]; then
        cat > SESSION-MEMORY.md << EOF
# Current Project State - $(basename "$project")

## Last Updated: $(date +%Y-%m-%d\ %H:%M)

## ✅ Completed
- [x] Applied complete system structure
- [x] Copied all system files
- [x] Created project folders

## 🔄 In Progress
- [ ] Update project-specific details

## Environment
- **Project**: $(basename "$project")
- **Location**: $project
- **System setup**: Complete

## Credentials Location
- **Location**: .credentials/ folder

## Important Commands
- **Save version**: ./save-version.sh "description"
- **Check system**: ls save-version.sh .docs/TROUBLESHOOTING-PROCESS.md

## Next Steps
- Update SESSION-MEMORY.md with project-specific information
- Create initial project documentation
EOF
        echo "      ✅ Created SESSION-MEMORY.md"
    else
        echo "      ⚪ SESSION-MEMORY.md already exists"
    fi
    
    # 4. Update or create basic CLAUDE.md if not exists
    if [ ! -f "CLAUDE.md" ] || [ ! -s "CLAUDE.md" ]; then
        cat > CLAUDE.md << EOF
# $(basename "$project") - Project Instructions

## Project Overview
**Project**: $(basename "$project")
**Status**: System structure applied
**Last Updated**: $(date +%Y-%m-%d)

## Development Commands
- **Save version**: ./save-version.sh "description"
- **Check troubleshooting**: cat .docs/TROUBLESHOOTING-PROCESS.md
- **View frameworks**: ls .docs/

## System Structure ✅
- ✅ .logs/ - Session logging
- ✅ .docs/ - All system documentation
- ✅ .troubleshoot/ - Problem solutions
- ✅ .progress/ - Task tracking
- ✅ .research/ - Research files
- ✅ .assets/ - Media files
- ✅ .credentials/ - Secure storage
- ✅ versions-archive/ - Version backups
- ✅ save-version.sh - Version saving protocol
- ✅ SESSION-MEMORY.md - Project state tracking

## Important Files
- \`save-version.sh\` - Save golden versions
- \`.docs/TROUBLESHOOTING-PROCESS.md\` - Problem solving protocol
- \`SESSION-MEMORY.md\` - Current project state

## Hard Rules
1. ALWAYS use save-version.sh before major changes
2. ALWAYS check .troubleshoot/ before debugging
3. ALWAYS update SESSION-MEMORY.md after major tasks
4. NEVER work without logging

*This CLAUDE.md should be updated with project-specific details.*
EOF
        echo "      ✅ Created basic CLAUDE.md"
    else
        echo "      ⚪ CLAUDE.md already exists"
    fi
    
    # 5. Create .gitignore for credentials if not exists
    if ! grep -q "\.credentials" .gitignore 2>/dev/null; then
        echo "" >> .gitignore
        echo "# System - Never commit credentials" >> .gitignore
        echo ".credentials/" >> .gitignore
        echo "      ✅ Updated .gitignore"
    fi
    
    echo "   ✅ $(basename "$project") setup complete!"
done

echo ""
echo "🎉 ALL PROJECTS UPDATED!"
echo "======================="
echo ""
echo "📋 Verification commands:"
echo "Each project now has:"
echo "  - Complete folder structure"
echo "  - save-version.sh script"
echo "  - All system documentation in .docs/"
echo "  - SESSION-MEMORY.md tracking"
echo "  - Project-specific CLAUDE.md"
echo ""
echo "🔍 To verify a project:"
echo "  cd [project-path]"
echo "  ls save-version.sh .docs/TROUBLESHOOTING-PROCESS.md SESSION-MEMORY.md"
echo ""