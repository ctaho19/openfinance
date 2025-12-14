# Code Patterns Reference

## Connectors

### OneLake (MANDATORY: specify columns)

```yaml
extract:
  df_name:
    connector: onelake
    options:
      dataset_id: "{uuid}"
      filetype: parquet
      partition_strategy:
        strategy: latest_matching
        options:
          pattern: "snap_dt=.*"
      columns:              # MANDATORY - prevents OOM
        - resource_id
        - compliance_status
        - sf_load_timestamp
      retry_limit: 1
      retry_delay: 180.0
```

### Snowflake/Postgres

```yaml
extract:
  df_name:
    connector: snowflake  # or postgres
    options:
      sql: "@text:sql/query.sql"
      params:
        snap_dt: $SNAP_DT
        control_id: "CTRL-123"
```

### S3

```yaml
extract:
  df_name:
    connector: s3
    options:
      key: "path/to/file.parquet"
      filetype: parquet
      gzip: false  # explicit required
```

### OneStream Load (AVRO only)

```yaml
load:
  df_name:
    - connector: onestream
      options:
        table_name: fact_controls_monitoring_metrics_daily_v4
        file_type: AVRO
        avro_schema: "@json:avro_schema.json"
        business_application: "BAENTERPRISETECHINSIGHTS"
        clean_df: true
```

---

## Config.yml Template

```yaml
pipeline:
  name: pl_automated_monitoring_{name}
  dq_strict_mode: true

stages:
  extract:
    thresholds_raw:
      connector: snowflake
      options:
        sql: "@text:sql/thresholds.sql"
        params:
          control_id: "CTRL-{id}"
          snap_dt: $SNAP_DT
    input_data:
      connector: onelake
      options:
        dataset_id: "{uuid}"
        filetype: parquet
        partition_strategy:
          strategy: latest_matching
          options:
            pattern: "snap_dt=.*"
        columns: [resource_id, compliance_status, sf_load_timestamp]

  ingress_validation:
    thresholds_raw:
      - type: count_check
        fatal: true
        options: {data_location: Snowflake, threshold: 1, table_name: thresholds}
    input_data:
      - type: count_check
        fatal: true
        options: {data_location: OneLake, threshold: 1, table_name: input}

  transform:
    metrics_output:
      - function: custom/{name}_calculate_metrics
        options:
          thresholds_df: $thresholds_raw
          input_df: $input_data
          snap_dt: $SNAP_DT
          run_dt: $RUN_DT

  egress_validation:
    metrics_output:
      - type: count_check
        fatal: true
        options: {data_location: Postgres, threshold: 1, table_name: output}

  consistency_checks:
    - ingress: thresholds_raw
      egress: metrics_output
      type: count_consistency_check
      fatal: false

  load:
    metrics_output:
      - connector: onestream
        options:
          table_name: fact_controls_monitoring_metrics_daily_v4
          file_type: AVRO
          avro_schema: "@json:avro_schema.json"

environments:
  prod:
    extract:
      thresholds_raw: {connector: snowflake}
  qa: &nonprod
    extract:
      thresholds_raw: {connector: postgres}
  dev: *nonprod
  local: *nonprod
```

---

## pipeline.py Template

```python
from pathlib import Path
from config_pipeline import ConfigPipeline
from etip_env import Env
import pipelines.pl_automated_monitoring_{name}.transforms  # noqa: F401

def run(env: Env, load_env: Env = None, snap_dt=None, load: bool = True, dq_actions: bool = True):
    pipeline = ConfigPipeline(env, load_env=load_env, snap_dt=snap_dt)
    pipeline.configure_from_filename(str(Path(__file__).parent / "config.yml"))
    return pipeline.run(load=load, dq_actions=dq_actions)

def backfill(env: Env, backfill_date, extra_args: dict, load: bool = True, dq_actions: bool = True):
    return run(env=env, load_env=extra_args.get("load_env"), load=load, dq_actions=dq_actions, snap_dt=backfill_date)
```

---

## transforms.py Template

```python
import json
from typing import Optional
import pandas as pd
from transform_library import transformer

COMPLIANT_STATUSES = [
    "Compliant", "CompliantException", "CompliantSuppression",
    "CompliantByQuarantine", "CompliantControlAllowance", "CompliantPlatformException",
]

def _status(pct: float, alert: float, warning: Optional[float]) -> str:
    if pct < alert: return "Red"
    if warning and pct < warning: return "Yellow"
    return "Green"

def _resources_info(df: pd.DataFrame, max_items: int = 10000) -> str:
    items = [json.dumps({"resource_id": str(r.get("resource_id", "")), 
                         "compliance_status": str(r.get("compliance_status", ""))}) 
             for _, r in df.head(max_items).iterrows()]
    return json.dumps(items)

@transformer
def {name}_calculate_metrics(thresholds_df: pd.DataFrame, input_df: pd.DataFrame, snap_dt, run_dt) -> pd.DataFrame:
    snap_ms = int(pd.Timestamp(snap_dt).timestamp() * 1000)
    run_ms = int(pd.Timestamp(run_dt).timestamp() * 1000)
    
    compliant = input_df[input_df["compliance_status"].isin(COMPLIANT_STATUSES)]
    non_compliant = input_df[~input_df["compliance_status"].isin(COMPLIANT_STATUSES)]
    
    results = []
    for _, t in thresholds_df.iterrows():
        tier = t["monitoring_metric_tier"]
        if tier == "Tier 1":    num, den = len(input_df), len(input_df)
        elif tier == "Tier 2":  num, den = len(compliant), len(input_df)
        elif tier == "Tier 3":  num, den = len(non_compliant), max(len(non_compliant), 1)
        else: continue
        
        val = (num / den * 100) if den > 0 else 0.0
        results.append({
            "control_id": t["control_id"],
            "monitoring_metric_id": int(t.get("monitoring_metric_id", 0)),
            "monitoring_metric_tier": tier,
            "monitoring_metric_value": float(val),
            "metric_value_numerator": int(num),
            "metric_value_denominator": int(den),
            "compliance_status": _status(val, t["alerting_threshold"], t.get("warning_threshold")),
            "resources_info": _resources_info(input_df),
            "snap_dt": snap_ms, "run_dt": run_ms,
        })
    
    df = pd.DataFrame(results)
    df["metric_value_numerator"] = df["metric_value_numerator"].astype("int64")
    df["metric_value_denominator"] = df["metric_value_denominator"].astype("int64")
    return df
```

---

## SQL Template

```sql
-- sql/thresholds.sql
-- SQLFluff: dialect=snowflake, templater=placeholder, placeholder_param_style=pyformat
SELECT control_id, monitoring_metric_id, monitoring_metric_tier,
       alerting_threshold, warning_threshold
FROM prod_edw.controls.monitoring_thresholds
WHERE control_id = %(control_id)s AND snap_dt <= %(snap_dt)s
  AND (metric_threshold_end_date IS NULL OR metric_threshold_end_date > %(snap_dt)s)
QUALIFY ROW_NUMBER() OVER (PARTITION BY control_id, monitoring_metric_tier 
                           ORDER BY sf_load_timestamp DESC) = 1
```

---

## avro_schema.json

```json
{"type": "record", "name": "ControlsMonitoringMetrics", "fields": [
  {"name": "control_id", "type": "string"},
  {"name": "monitoring_metric_id", "type": "long"},
  {"name": "monitoring_metric_tier", "type": "string"},
  {"name": "monitoring_metric_value", "type": "double"},
  {"name": "metric_value_numerator", "type": "long"},
  {"name": "metric_value_denominator", "type": "long"},
  {"name": "compliance_status", "type": "string"},
  {"name": "resources_info", "type": "string"},
  {"name": "snap_dt", "type": "long"},
  {"name": "run_dt", "type": "long"}
]}
```

---

## Test Template

```python
import json
from datetime import date
from unittest.mock import Mock, patch
import pandas as pd
import pytest
from freezegun import freeze_time
from pipelines.pl_automated_monitoring_{name} import pipeline
from pipelines.pl_automated_monitoring_{name}.transforms import {name}_calculate_metrics, COMPLIANT_STATUSES

FROZEN = "2025-07-03 10:00:00"
SNAP_DT = pd.Timestamp("2025-07-03").normalize()
RUN_DT = pd.Timestamp(FROZEN)

def _thresholds():
    return pd.DataFrame([
        {"control_id": "CTRL-123", "monitoring_metric_id": 1, "monitoring_metric_tier": "Tier 1", "alerting_threshold": 95.0, "warning_threshold": 98.0},
        {"control_id": "CTRL-123", "monitoring_metric_id": 2, "monitoring_metric_tier": "Tier 2", "alerting_threshold": 90.0, "warning_threshold": 95.0},
        {"control_id": "CTRL-123", "monitoring_metric_id": 3, "monitoring_metric_tier": "Tier 3", "alerting_threshold": 85.0, "warning_threshold": 90.0},
    ])

def _input(compliant=10, non_compliant=0):
    return pd.DataFrame(
        [{"resource_id": f"c:{i}", "compliance_status": "Compliant", "sf_load_timestamp": SNAP_DT} for i in range(compliant)] +
        [{"resource_id": f"nc:{i}", "compliance_status": "NonCompliant", "sf_load_timestamp": SNAP_DT} for i in range(non_compliant)]
    )

class TestTransforms:
    @freeze_time(FROZEN)
    def test_tier1(self):
        r = {name}_calculate_metrics(_thresholds(), _input(100), SNAP_DT, RUN_DT)
        t1 = r[r["monitoring_metric_tier"] == "Tier 1"].iloc[0]
        assert t1["metric_value_numerator"] == 100
        assert t1["compliance_status"] == "Green"

    @freeze_time(FROZEN)
    def test_tier2(self):
        r = {name}_calculate_metrics(_thresholds(), _input(90, 10), SNAP_DT, RUN_DT)
        t2 = r[r["monitoring_metric_tier"] == "Tier 2"].iloc[0]
        assert t2["monitoring_metric_value"] == 90.0

    @pytest.mark.parametrize("pct,expected", [(100, "Green"), (96, "Yellow"), (89, "Red")])
    @freeze_time(FROZEN)
    def test_status(self, pct, expected):
        r = {name}_calculate_metrics(_thresholds(), _input(pct, 100-pct), SNAP_DT, RUN_DT)
        assert r[r["monitoring_metric_tier"] == "Tier 2"].iloc[0]["compliance_status"] == expected

    @freeze_time(FROZEN)
    def test_resources_info_limit(self):
        r = {name}_calculate_metrics(_thresholds(), _input(15000), SNAP_DT, RUN_DT)
        assert len(json.loads(r["resources_info"].iloc[0])) <= 10000

    @freeze_time(FROZEN)
    def test_timestamps(self):
        r = {name}_calculate_metrics(_thresholds(), _input(1), SNAP_DT, RUN_DT)
        assert r["snap_dt"].iloc[0] > 1_000_000_000_000
        assert r["snap_dt"].dtype == "int64"

class TestPipeline:
    @freeze_time(FROZEN)
    @patch(f"pipelines.pl_automated_monitoring_{name}.pipeline.ConfigPipeline")
    def test_run(self, mock_cp):
        pipeline.run(Mock())
        mock_cp.return_value.run.assert_called_once()

    @freeze_time(FROZEN)
    @patch(f"pipelines.pl_automated_monitoring_{name}.pipeline.run")
    def test_backfill(self, mock_run):
        pipeline.backfill(Mock(), date(2025, 1, 1), {})
        mock_run.assert_called_once()
```
