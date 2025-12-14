# Versioning Strategy

OpenFinance uses [Semantic Versioning](https://semver.org/) for release management.

## Version Format

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Breaking changes or major rewrites
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

## Git Tags

All releases are tracked using annotated git tags:

```bash
# Create a new release tag
git tag -a v0.2.0 -m "Release v0.2.0 - Description of changes"

# Push tag to remote
git push origin v0.2.0
```

## Viewing Releases

```bash
# List all tags
git tag -l

# Show details of a specific tag
git show v0.2.0
```

## Rollback to a Previous Version

### Option 1: Checkout the tag (read-only)

```bash
git checkout v0.1.0
```

### Option 2: Create a branch from the tag

```bash
git checkout -b hotfix/from-v0.1.0 v0.1.0
```

### Option 3: Reset main to a previous tag (destructive)

```bash
git checkout main
git reset --hard v0.1.0
git push origin main --force
```

### Option 4: Revert via deployment

Redeploy a specific version using GitHub Actions:

1. Go to Actions → Deploy workflow
2. Run workflow with the specific tag/commit

## Release Checklist

1. Update version in `package.json`
2. Update `CHANGELOG.md` with changes
3. Commit changes: `git commit -m "chore: bump version to vX.Y.Z"`
4. Create annotated tag: `git tag -a vX.Y.Z -m "Release vX.Y.Z - Summary"`
5. Push commits and tag: `git push origin main --tags`
