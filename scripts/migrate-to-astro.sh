#!/bin/bash
# Migration script: Switch from Next.js to Astro
# Run this AFTER testing the Astro version thoroughly

set -e

echo "🚀 Starting migration to Astro..."

# 1. Update SST config to use Astro
echo "📝 Updating sst.config.ts..."
sed -i '' 's/const USE_ASTRO = false/const USE_ASTRO = true/' sst.config.ts

# 2. Update astro.config.mjs to use src/pages directly (rename astro-pages)
echo "📁 Moving Astro pages..."
mv src/astro-pages src/pages-astro-temp
rm -rf src/pages 2>/dev/null || true
mv src/pages-astro-temp src/pages

# 3. Update astro.config.mjs - remove astro-pages integration, use default pages dir
echo "📝 Updating astro.config.mjs..."
cat > astro.config.mjs << 'EOF'
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import aws from 'astro-sst';

export default defineConfig({
  output: 'server',
  adapter: aws(),
  integrations: [react()],
  srcDir: './src',
  vite: {
    css: {
      transformer: 'postcss',
    },
  },
});
EOF

# 4. Remove Next.js app directory
echo "🗑️  Removing Next.js app directory..."
rm -rf src/app

# 5. Remove Next.js config files
echo "🗑️  Removing Next.js config files..."
rm -f next.config.ts
rm -f next-env.d.ts
rm -f middleware.ts

# 6. Update package.json scripts
echo "📝 Updating package.json scripts..."
npm pkg set scripts.dev="astro dev"
npm pkg set scripts.build="astro build"
npm pkg set scripts.start="astro preview"
npm pkg delete scripts.dev:next 2>/dev/null || true
npm pkg delete scripts.build:next 2>/dev/null || true

# 7. Remove Next.js dependencies
echo "📦 Removing Next.js dependencies..."
npm uninstall next next-auth eslint-config-next astro-pages

# 8. Clean up build artifacts
echo "🧹 Cleaning up..."
rm -rf .next
rm -rf dist

# 9. Rebuild
echo "🔨 Building Astro..."
npm run build

echo ""
echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "  1. Test locally: npm run dev"
echo "  2. Deploy: npm run deploy"
echo "  3. Verify production site"
