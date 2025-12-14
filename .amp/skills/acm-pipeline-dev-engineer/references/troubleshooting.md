# Commands & Troubleshooting

## Commands

### Run Pipeline

```bash
# Basic run
export PYTHONPATH=src && python3 -m pipeline_manager run pl_automated_monitoring_{name} -e prod

# Load to QA
export PYTHONPATH=src && python3 -m pipeline_manager run pl_automated_monitoring_{name} -e prod -l qa

# Dry run (no load)
export PYTHONPATH=src && python3 -m pipeline_manager run pl_automated_monitoring_{name} -e prod --no-load
```

### Backfill

```bash
export PYTHONPATH=src && python3 -m pipeline_manager backfill pl_automated_monitoring_{name} -e prod --backfill-date 2025-01-15
```

### Tests

```bash
# With coverage
pipenv run pytest tests/pipelines/test_{name}.py -v --cov=src/pipelines/pl_automated_monitoring_{name}

# All tests
pipenv run pytest tests/ -v --cov=src/
```

### Cache

```bash
python -m connectors.cached_connector list
python -m connectors.cached_connector delete <cache-id>
```

## Local Setup

Create `env.override.yml` (never commit):

```yaml
snowflake:
  account: "your-account"
  user: "your-uno-user"
  authenticator: "externalbrowser"
  warehouse: "ETIP_WH"
onestream:
  host: "https://api-it.cloud.capitalone.com"
```

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "No threshold data" | SQL filters out QA data | Check WHERE clause, verify data exists |
| "Schema Mismatch" | AVRO doesn't match output | Compare avro_schema.json with transform output |
| "Authentication Failed" | Bad credentials | Check env.override.yml, verify SnowGrant |
| OOM | Large dataset | Add `columns` list to OneLake connector |
| "Connection Timeout" | Network/VPN | Check VPN, add retry_limit |
| DQ Check Failed | Data validation fail | Check which check failed, verify data |
| SQL Syntax Error | Bad bind params | Use `%(param)s`, escape `%` as `%%` |

## Splunk Queries

```splunk
# Pipeline logs
index=etip source="*batch*" pipeline_name="{name}"

# DQ failures
index=etip "data quality" "failed" pipeline_name="{name}"

# Memory issues
index=etip "memory" "retry" pipeline_name="{name}"
```
