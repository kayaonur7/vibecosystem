#!/bin/bash
# vibecosystem installer
# Tek komutla tum ekosistemi kur

set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

echo "vibecosystem installer"
echo "======================"
echo ""
echo "Bu script su dosyalari kuracak:"
echo "  - Agents  -> ~/.claude/agents/"
echo "  - Skills  -> ~/.claude/skills/"
echo "  - Hooks   -> ~/.claude/hooks/"
echo "  - Rules   -> ~/.claude/rules/"
echo ""
read -p "Devam? (y/N) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] || exit 0

# Backup
if [ -d "$CLAUDE_DIR/agents" ] || [ -d "$CLAUDE_DIR/skills" ]; then
  BACKUP="$CLAUDE_DIR/backup-$(date +%Y%m%d-%H%M%S)"
  echo "Mevcut dosyalar yedekleniyor: $BACKUP"
  mkdir -p "$BACKUP"
  [ -d "$CLAUDE_DIR/agents" ] && cp -r "$CLAUDE_DIR/agents" "$BACKUP/"
  [ -d "$CLAUDE_DIR/skills" ] && cp -r "$CLAUDE_DIR/skills" "$BACKUP/"
  [ -d "$CLAUDE_DIR/hooks" ] && cp -r "$CLAUDE_DIR/hooks" "$BACKUP/"
  [ -d "$CLAUDE_DIR/rules" ] && cp -r "$CLAUDE_DIR/rules" "$BACKUP/"
fi

# Copy
echo "Agent'lar kopyalaniyor..."
mkdir -p "$CLAUDE_DIR/agents"
cp -r "$REPO_DIR/agents/"* "$CLAUDE_DIR/agents/"

echo "Skill'ler kopyalaniyor..."
mkdir -p "$CLAUDE_DIR/skills"
cp -r "$REPO_DIR/skills/"* "$CLAUDE_DIR/skills/"

echo "Hook'lar kopyalaniyor..."
mkdir -p "$CLAUDE_DIR/hooks"
cp -r "$REPO_DIR/hooks/"* "$CLAUDE_DIR/hooks/"

echo "Kurallar kopyalaniyor..."
mkdir -p "$CLAUDE_DIR/rules"
cp -r "$REPO_DIR/rules/"* "$CLAUDE_DIR/rules/"

# Build hooks
echo "Hook'lar build ediliyor..."
cd "$CLAUDE_DIR/hooks"
npm install
npm run build

echo ""
echo "Kurulum tamamlandi!"
echo "  Agents: $(ls "$CLAUDE_DIR/agents/"*.md 2>/dev/null | wc -l | tr -d ' ')"
echo "  Skills: $(find "$CLAUDE_DIR/skills/" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')"
echo "  Hooks:  $(ls "$CLAUDE_DIR/hooks/dist/"*.mjs 2>/dev/null | wc -l | tr -d ' ')"
echo "  Rules:  $(ls "$CLAUDE_DIR/rules/"*.md 2>/dev/null | wc -l | tr -d ' ')"
