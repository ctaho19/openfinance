#!/bin/bash
# Rollback script: Revert from Astro to Next.js
# Use this if something goes wrong after migration

set -e

echo "⏪ Rolling back to Next.js..."

# 1. Update SST config to use Next.js
echo "📝 Updating sst.config.ts..."
sed -i '' 's/const USE_ASTRO = true/const USE_ASTRO = false/' sst.config.ts

# 2. Restore from git if needed
echo "📝 Checking git status..."
if git diff --quiet sst.config.ts; then
  echo "No changes to revert in sst.config.ts"
else
  echo "SST config updated to use Next.js"
fi

# 3. Deploy
echo "🚀 Deploying Next.js version..."
npm run deploy

echo ""
echo "✅ Rollback complete!"
echo ""
echo "The site is now running on Next.js"
