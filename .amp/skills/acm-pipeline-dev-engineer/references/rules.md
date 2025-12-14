# Cascade Rules & Requirements

## Naming

| Element | Convention | Example |
|---------|------------|---------|
| Pipeline (single) | `pl_automated_monitoring_ctrl_{id}` | `pl_automated_monitoring_ctrl_1079134` |
| Pipeline (grouped) | `pl_automated_monitoring_{grouping}` | `pl_automated_monitoring_cloud_custodian` |
| Transform function | `{pipeline}_calculate_metrics` | `ctrl_1079134_calculate_metrics` |
| Dataframes | snake_case | `thresholds_raw`, `input_data` |

## Directory Structure

```
src/pipelines/pl_automated_monitoring_{name}/
├── config.yml
├── pipeline.py
├── transforms.py
├── avro_schema.json
└── sql/
```

## Critical Rules

### Config

- Use `$SNAP_DT`, `$RUN_DT` - never `datetime.now()`
- File refs: `@text:sql/file.sql`, `@json:schema.json`
- Escape `$` as `$$`, `@` as `@@`

### Connectors

- **OneLake**: `columns` list MANDATORY (prevents OOM)
- **OneStream**: AVRO only, never CSV
- **SQL**: `%(param)s` binds, `%%` for literal `%`
- **S3**: explicit `gzip: true|false`

### DQ Checks

`dq_strict_mode: true` (default) requires:
- Ingress validation for all extracted dataframes
- Egress validation for all output dataframes  
- Consistency checks linking ingress to egress

| Check | Use |
|-------|-----|
| `count_check` | Minimum row count |
| `schema_check` | Column structure |
| `timeliness_check` | Data freshness |
| `count_consistency_check` | Ingress vs egress |

### Metrics

| Tier | Formula |
|------|---------|
| Tier 1 (Coverage) | Evaluated / In-Scope × 100 |
| Tier 2 (Compliance) | Compliant / Evaluated × 100 |
| Tier 3 (Aging) | Non-Compliant in SLA / All Non-Compliant × 100 |

**Status**: Red (< alert) → Yellow (< warning) → Green

**COMPLIANT_STATUSES**: Compliant, CompliantException, CompliantSuppression, CompliantByQuarantine, CompliantControlAllowance, CompliantPlatformException

### Output Types

| Field | Type |
|-------|------|
| metric_value_numerator | int64 |
| metric_value_denominator | int64 |
| monitoring_metric_value | float64 |
| snap_dt, run_dt | int64 (Unix ms) |
| resources_info | JSON string (max 10K items) |

### Testing

- 80% coverage minimum (CI enforced)
- Use `freezegun` for time-dependent tests
- Mock all external connectors
- Test all tiers and status variations
- Use helper functions for mock data, not inline

## Prohibitions

- ❌ Hardcoded dates
- ❌ Hardcoded secrets
- ❌ `datetime.now()` in pipeline code
- ❌ `print()` or debug statements in production
- ❌ CSV for OneStream
- ❌ OneLake without `columns` list
- ❌ Unused imports/functions
