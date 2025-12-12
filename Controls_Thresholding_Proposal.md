# Cyber Controls Thresholding Proposal

## Executive Summary

**Problem:** The Cyber LOB has a 3.4% ineffective control rate across ~270 controls. Minor, isolated deviations in control execution are triggering "ineffective" ratings even when the risk-mitigating intent of the control remains intact.

**Proposed Solution:** Implement a **Tolerable Deviation Framework** aligned with Enterprise Control Standard 5100.1.016 and PCAOB AS 2315, allowing risk-based tolerance for non-systematic, low-impact control failures on eligible Low/Medium risk controls.

**Key Principle:** This is NOT a relaxation of control requirements—it's a standards-aligned approach to distinguish between *isolated operational deviations* and *systematic control breakdowns*.

---

## 1. Framework Overview

### What This Is
- A formal method to apply **tolerable deviation** to certain cyber controls
- Consistent with existing 5100.1.016 single-exception safe harbor and PCAOB guidance
- A way to focus attention on *material* control breakdowns

### What This Is NOT
- A relaxation of requirements for SOX, Critical, or High-risk controls
- A mechanism to "game" effectiveness metrics
- Permission to accept ongoing control failures

---

## 2. Threshold-Eligible Control (TEC) Criteria

A control must meet ALL criteria to qualify for thresholding:

### 2.1 Eligibility Matrix

| Criterion | Requirement | Rationale |
|-----------|-------------|-----------|
| **Risk Rating** | Low or Medium residual risk only | Higher-risk controls require zero tolerance |
| **SOX Applicability** | Non-SOX controls only | SOX controls have regulatory constraints |
| **Population Size** | ≥20 samples available | Meaningful percentage calculation |
| **Historical Stability** | ≥4 quarters with consistent design/scope | Demonstrates reliable operation |
| **Prior Effectiveness** | No "ineffective" rating in last 4 quarters | Track record of performance |
| **Design Adequacy** | No open design issues | Must be properly designed first |
| **Incident History** | No High/Critical incidents from this control in 12-18 months | Validates low impact |

### 2.2 Automatic Exclusions (Non-TEC)

Controls are **automatically excluded** from thresholding if:
- Mapped to Critical or High inherent risk
- SOX-relevant control
- Single failure affects enterprise-wide scope (see Impact Scope Assessment)
- No compensating/layered controls exist
- Population < 20

---

## 3. Tolerable Deviation Thresholds

### 3.1 Threshold Matrix

| Risk Rating | Control Type | Max Deviation Rate | Max Absolute Exceptions | Pattern Allowed |
|-------------|--------------|-------------------|------------------------|-----------------|
| **Critical** | Any | 0% | 0 | No |
| **High** | Any | 0% | 0 | No |
| **Medium** | Automated/Preventive | ≤1% | ≤2 | No |
| **Medium** | Detective/Manual | ≤2% | ≤3 | No |
| **Low** | Any | ≤5% | ≤5 | No |

### 3.2 Dual-Gate Requirement

Both gates must be satisfied:
1. **Percentage Threshold:** Deviation rate ≤ threshold %
2. **Absolute Cap:** Number of exceptions ≤ cap

This prevents large populations from masking meaningful absolute failures.

### 3.3 Qualitative Overlay (Always Applies)

Even within numeric thresholds, a control is **still rated Ineffective** if:
- Failures share the same root cause (pattern)
- Evidence indicates a design gap
- Related KCIs/KRIs are in breach/warning state
- Failures occurred in consecutive test periods (3+ quarters at threshold boundary)

---

## 4. Impact Scope Assessment (Blast Radius Proxy)

### The Problem
Leadership wants to avoid per-control blast radius analysis, but we need some way to identify controls where a single failure has outsized impact.

### The Solution: Structural Impact Screening

Instead of quantitative blast radius analysis, use these **proxy questions**:

| Question | If YES → | If NO → |
|----------|----------|---------|
| Can a single failure disable protection for the entire AWS estate/environment? | Exclude from TEC | Continue |
| Does this control have compensating/layered controls downstream? | Continue | Exclude from TEC |
| Is the unit of impact bounded (single account/role/resource)? | Continue | Exclude from TEC |
| Has historical data shown any material loss events from isolated failures? | Exclude from TEC | Continue |

### Impact Scope Categories

| Category | Description | TEC Eligible | Example |
|----------|-------------|--------------|---------|
| **Local** | Affects single resource/account/role | ✅ Yes | IAM role permission on one account |
| **Regional** | Affects subset of environment | ⚠️ Conditional | Config drift in one AWS region |
| **Global** | Single failure affects entire estate | ❌ No | Master logging disable, org-wide MFA |

---

## 5. Evaluation Methodology for Specific Controls

### 5.1 Control Evaluation Scorecard

For each control, complete this scorecard:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ CONTROL THRESHOLDING ELIGIBILITY ASSESSMENT                             │
├─────────────────────────────────────────────────────────────────────────┤
│ Control ID: _______________  Control Name: ___________________________  │
├─────────────────────────────────────────────────────────────────────────┤
│ SECTION A: BASIC ELIGIBILITY                               Pass/Fail   │
├─────────────────────────────────────────────────────────────────────────┤
│ A1. Risk Rating (Low/Medium only)                          [ ]         │
│ A2. Non-SOX Control                                        [ ]         │
│ A3. Population ≥ 20                                        [ ]         │
│ A4. ≥4 Quarters Stable Design                              [ ]         │
│ A5. No Ineffective Rating (last 4 quarters)                [ ]         │
│ A6. No Open Design Issues                                  [ ]         │
├─────────────────────────────────────────────────────────────────────────┤
│ SECTION B: IMPACT SCOPE SCREENING                          Pass/Fail   │
├─────────────────────────────────────────────────────────────────────────┤
│ B1. Single failure does NOT disable enterprise protection  [ ]         │
│ B2. Compensating/layered controls exist                    [ ]         │
│ B3. Unit of impact is bounded (local/regional)             [ ]         │
│ B4. No historical loss events from isolated failures       [ ]         │
├─────────────────────────────────────────────────────────────────────────┤
│ SECTION C: THRESHOLD DETERMINATION                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ C1. Risk Rating:          [ ] Low    [ ] Medium                         │
│ C2. Control Type:         [ ] Automated/Preventive  [ ] Detective/Manual│
│ C3. Applicable Threshold: ___% / ___ max exceptions                     │
├─────────────────────────────────────────────────────────────────────────┤
│ SECTION D: QUANTIFIABLE METRICS FOR THIS CONTROL                        │
├─────────────────────────────────────────────────────────────────────────┤
│ D1. Population Unit: (e.g., # accounts, # roles, # resources)           │
│     ________________________________________________________________    │
│ D2. Measurement Formula:                                                │
│     Numerator: ________________________________________________         │
│     Denominator: ______________________________________________         │
│ D3. Timeliness SLA (if applicable): ____________________________        │
│ D4. Sample calculation example:                                         │
│     ___ failures / ___ population = ___% deviation                      │
├─────────────────────────────────────────────────────────────────────────┤
│ FINAL DETERMINATION                                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ [ ] TEC ELIGIBLE - Threshold: ___% / ___ max exceptions                 │
│ [ ] NOT ELIGIBLE - Reason: ______________________________________       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. AWS Cloud IAM Controls Evaluation

### 6.1 Controls from IMG_7281 - Eligibility Assessment

| Control ID | Control Name | Type | Automation | Impact Scope | TEC Eligible | Proposed Threshold | Quantifiable Metric |
|------------|--------------|------|------------|--------------|--------------|-------------------|---------------------|
| CTRL-1106024 | AWS IAM Identity Center Usage | Preventive | Automated | Local | ✅ | ≤1% / 2 max | # non-compliant accounts / total accounts |
| CTRL-1081889 | ECR Human Role Access Enforcement | Preventive | Automated | Local | ✅ | ≤1% / 2 max | # roles with non-compliant access / total roles |
| CTRL-1107114 | CloudTrail Logging Disablement Prevention | Preventive | Automated | **Global** | ❌ | 0% | N/A - single failure disables audit trail |
| CTRL-1107117 | MemoryDB for Redis IAM Authentication | Preventive | Automated | Local | ✅ | ≤1% / 2 max | # clusters without IAM auth / total clusters |
| CTRL-1107582 | SageMaker Inter-Container Traffic Encryption | Preventive | Automated | Local | ✅ | ≤1% / 2 max | # notebooks without encryption / total notebooks |
| CTRL-1107116 | PCA Certificate Issuance Restriction | Preventive | Automated | Regional | ⚠️ | ≤1% / 2 max | # unauthorized issuances / total issuance requests |
| CTRL-1106155 | Block IAM Users Outside Capital One Network | Preventive | Automated | **Global** | ❌ | 0% | N/A - org-wide perimeter control |
| CTRL-1106262 | AWS RAM External Restriction | Preventive | Automated | Regional | ⚠️ | ≤1% / 2 max | # external shares / total RAM shares |
| CTRL-1106070 | Human Roles Assuming Machine Roles | Preventive | Automated | Local | ✅ | ≤1% / 2 max | # unauthorized assumptions / total assume events |
| CTRL-1105997 | AWS SSM Documents Permissions | Preventive | Automated | Local | ✅* | ≤1% / 2 max | # docs with excessive perms / total SSM docs |
| CTRL-1107581 | SageMaker Notebook Root Access Prevention | Preventive | Automated | Local | ✅ | ≤1% / 2 max | # notebooks with root / total notebooks |
| CTRL-1107118 | MemoryDB for Redis Open ACL | Preventive | Automated | Local | ✅ | ≤1% / 2 max | # clusters with open ACL / total clusters |
| CTRL-1107438 | AWS Connect Permissions Restrictions | Preventive | Automated | Local | ✅ | ≤1% / 2 max | # instances with excess perms / total instances |
| CTRL-1105996 | Lambda Function URLs Prevention | Preventive | Automated | Local | ✅ | ≤1% / 2 max | # functions with public URLs / total functions |
| CTRL-1107032 | AWS Account Organization Restriction | Preventive | Automated | **Global** | ❌ | 0% | N/A - org-wide structural control |
| CTRL-1105846 | AWS Data Perimeter for Environment Types | Preventive | Automated | **Global** | ❌ | 0% | N/A - defines entire data boundary |
| CTRL-1106967 | GuardDuty Usage Restrictions | Preventive | Automated | **Global** | ❌ | 0% | N/A - disabling affects entire detection capability |

*Note: CTRL-1105997 currently shows "Ineffective" - would need 4 quarters of stability before TEC eligibility.

### 6.2 Summary: AWS Controls Thresholding Eligibility

| Category | Count | % of 17 Controls |
|----------|-------|------------------|
| TEC Eligible (≤1% threshold) | 10 | 59% |
| Not Eligible (Global Impact) | 5 | 29% |
| Conditional (needs review) | 2 | 12% |

---

## 7. Quantifiable Threshold Metrics by Control Type

### 7.1 Access Management Controls

| Metric Type | Formula | Example Threshold |
|-------------|---------|-------------------|
| **Deprovisioning Timeliness** | (# accounts deprovisioned late) / (total terminations) | ≤5% AND ≤2 days late per instance |
| **Access Review Completion** | (# permissions not reviewed) / (total permissions) | ≤2% for Medium, ≤5% for Low |
| **Privileged Access Violations** | (# unauthorized privilege uses) / (total privilege events) | ≤1% for admin access |

### 7.2 Configuration Controls

| Metric Type | Formula | Example Threshold |
|-------------|---------|-------------------|
| **Policy Compliance** | (# non-compliant resources) / (total resources) | ≤1% for preventive controls |
| **Drift Detection** | (# drifted configs) / (total configs monitored) | ≤2% with <24hr remediation |
| **Encryption Enforcement** | (# unencrypted resources) / (total resources) | ≤1% |

### 7.3 Authentication Controls

| Metric Type | Formula | Example Threshold |
|-------------|---------|-------------------|
| **MFA Enforcement** | (# accounts without MFA) / (total accounts) | ≤1% AND ≤3 accounts |
| **Credential Rotation** | (# stale credentials) / (total credentials) | ≤2% for Medium systems |
| **Session Management** | (# sessions exceeding limit) / (total sessions) | ≤5% |

### 7.4 Monitoring/Detective Controls

| Metric Type | Formula | Example Threshold |
|-------------|---------|-------------------|
| **Alert Response SLA** | (# alerts exceeding SLA) / (total alerts) | ≤5% AND <4hr SLA breach |
| **Log Completeness** | (# systems without logs) / (total systems) | ≤1% |
| **Scan Coverage** | (# assets not scanned) / (total assets) | ≤2% |

---

## 8. Decision Logic: Test Cycle Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTROL TEST EVALUATION                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Is control TEC  │
                    │    eligible?    │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
        ┌─────────┐                   ┌─────────┐
        │   YES   │                   │   NO    │
        └────┬────┘                   └────┬────┘
             │                             │
             ▼                             ▼
    ┌─────────────────┐          ┌─────────────────┐
    │ Count deviations│          │ Any deviation = │
    │ d failures in n │          │   INEFFECTIVE   │
    │     samples     │          └─────────────────┘
    └────────┬────────┘
             │
             ▼
    ┌─────────────────────────┐
    │ Calculate: rate = d / n │
    └────────────┬────────────┘
                 │
                 ▼
    ┌─────────────────────────────────┐
    │ Is rate ≤ threshold% AND        │
    │ d ≤ absolute cap?               │
    └────────────────┬────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
    ┌─────────┐           ┌─────────┐
    │   YES   │           │   NO    │
    └────┬────┘           └────┬────┘
         │                     │
         ▼                     ▼
    ┌─────────────────┐  ┌─────────────────┐
    │ Apply qualitative│  │   INEFFECTIVE   │
    │    overlays      │  └─────────────────┘
    └────────┬────────┘
             │
             ▼
    ┌─────────────────────────────────┐
    │ Pattern/design/KCI concerns?    │
    └────────────────┬────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
    ┌─────────┐           ┌─────────┐
    │   NO    │           │   YES   │
    └────┬────┘           └────┬────┘
         │                     │
         ▼                     ▼
    ┌─────────────────┐  ┌─────────────────┐
    │ EFFECTIVE       │  │ INEFFECTIVE     │
    │ (within         │  │ (qualitative    │
    │ tolerable       │  │ override)       │
    │ deviation)      │  └─────────────────┘
    └─────────────────┘
```

---

## 9. Reporting & Transparency

### 9.1 What Gets Reported

To avoid the perception of "gaming metrics," maintain full transparency:

| Metric | Always Reported | Dashboard |
|--------|-----------------|-----------|
| Raw deviation count (d) | ✅ | Control Performance |
| Raw deviation rate (d/n) | ✅ | Control Performance |
| Threshold applied | ✅ | Control Performance |
| Final effectiveness rating | ✅ | Executive Summary |
| Controls within threshold but non-zero failures | ✅ | Trending Dashboard |
| 3+ quarters at threshold boundary | ✅ | Watch List |

### 9.2 New Rating Categories

| Rating | Definition |
|--------|------------|
| **Effective** | Zero deviations OR within tolerable deviation with no concerns |
| **Effective – Noted Exception** | Within threshold but isolated issues; requires action plan |
| **Ineffective** | Threshold breached OR qualitative concerns indicate systemic issue |

---

## 10. ERM Positioning

### How to Frame This to Enterprise Risk Management

**DO say:**
- "We're implementing a standards-aligned tolerable deviation framework consistent with PCAOB AS 2315 and our existing 5100.1.016 safe harbor provisions"
- "This focuses attention on material control breakdowns while maintaining full transparency on all exceptions"
- "Raw exception data continues to be reported; thresholding only affects the rating conclusion"
- "Critical, High-risk, and SOX controls remain at zero tolerance"

**DON'T say:**
- "We're reducing our ineffective rate"
- "This will improve our metrics"
- "We're accepting more risk"

### Alignment to Standards

| Standard | Alignment |
|----------|-----------|
| **5100.1.016 ECS** | Extends existing single-exception safe harbor concept |
| **PCAOB AS 2315** | Applies tolerable deviation rate (≤5% for low assurance areas) |
| **NIST CSF 2.0** | Supports GV.RM (Risk Management) proportionality |
| **COBIT 2019** | Aligns with MEA03 (Monitor, Evaluate, Assess) risk-based approach |

---

## 11. Implementation Roadmap

| Phase | Activities | Timeline |
|-------|------------|----------|
| **Phase 1: Foundation** | Finalize TEC criteria; complete eligibility assessment for all 270 controls | 4 weeks |
| **Phase 2: Pilot** | Apply thresholding to 10-15 Low-risk controls; validate metrics | 1 quarter |
| **Phase 3: Expand** | Extend to all eligible Low/Medium controls | 1 quarter |
| **Phase 4: Optimize** | Refine thresholds based on data; implement trending dashboards | Ongoing |

---

## 12. Governance & Guardrails

### Approval Requirements

| Action | Approval Required |
|--------|-------------------|
| Designate control as TEC | Control Owner + 2nd Line Review |
| Apply threshold to test result | Tester + 2nd Line Validation |
| Override threshold (mark Effective despite breach) | Not Permitted |
| Add Critical/High control to TEC | ERM Committee (exceptional only) |
| Modify threshold matrix | ERM Committee + Cyber AE |

### Periodic Reviews

- **Quarterly:** Review controls at threshold boundary (>1 quarter)
- **Semi-Annual:** Validate TEC eligibility criteria still met
- **Annual:** Assess threshold appropriateness; back-test against incidents

---

## Appendix A: Blast Radius Concern - Leadership Talking Points

### Why We're Not Doing Full Blast Radius Analysis

1. **It's already encoded in risk ratings:** Medium and Low ratings already incorporate impact/likelihood considerations including potential blast radius
2. **Structural proxies are sufficient:** Impact scope (Local/Regional/Global) plus layered controls assessment achieves the same filtering
3. **Simplicity enables adoption:** Per-control quantitative loss modeling would take 6-12 months and still be subjective
4. **We exclude the obvious cases:** Global-impact controls are automatically excluded regardless of nominal risk rating

### How We're Addressing It Instead

- **Impact Scope Screening:** Four simple yes/no questions filter out controls where single failures have outsized impact
- **Automatic Exclusions:** Controls that can disable enterprise-wide protection are never TEC-eligible
- **Layered Control Requirement:** TEC controls must have compensating controls downstream

### If Leadership Pushes Back

> "We're using the same risk intelligence that informed the original risk ratings. If leadership believes certain controls are misrated, we should address that at the risk assessment level, not create a separate blast radius overlay."

---

## Appendix B: Sample Control Threshold Calculation

### Example: CTRL-1104865 - Access De-provisioning for NFCA

**Setup:**
- Risk Rating: Low
- Control Type: Manual process control
- Population: 300 deprovisioning events
- Sample: Per 5100.1.016 (25 samples)

**Test Results:**
- Findings: 2 instances deprovisioned 2 days late
- Deviation: 2/300 = 0.67%

**Threshold Application:**
- Applicable threshold (Low risk): ≤5% AND ≤5 exceptions
- Result: 0.67% ≤ 5% ✅ AND 2 ≤ 5 ✅

**Qualitative Check:**
- Same root cause? No (different application teams)
- Design gap? No (isolated execution failures)
- Related KCIs in breach? No

**Conclusion:** **Effective – within tolerable deviation**
- Document the 2 exceptions with gap analysis
- Require remediation confirmation
- Do not mark control Ineffective
