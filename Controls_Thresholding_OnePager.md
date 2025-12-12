# Cyber Controls Thresholding Proposal | One-Pager

## Problem
3.4% ineffective rate across ~270 Cyber controls. Minor, isolated deviations trigger "Ineffective" ratings even when risk mitigation remains intact.

## Solution
**Tolerable Deviation Framework** — standards-aligned tolerance for non-systematic failures on eligible Low/Medium risk controls.

| What This IS | What This is NOT |
|--------------|------------------|
| PCAOB AS 2315 tolerable deviation applied to cyber | Relaxation of SOX/Critical/High controls |
| Extension of 5100.1.016 safe harbor concept | A way to "game" metrics |
| Focus on *material* breakdowns | Permission for ongoing failures |

---

## Eligibility Criteria (ALL must pass)

| Category | Requirement |
|----------|-------------|
| **Risk** | Low or Medium only |
| **Regulatory** | Non-SOX |
| **Population** | ≥20 samples |
| **Stability** | 4 quarters effective, no design issues |
| **Impact Scope** | Single failure does NOT disable enterprise-wide protection |
| **Monitoring** | KCI/continuous monitoring OR expanded sampling |

---

## Threshold Matrix

| Risk | Control Type | Max Rate | Max Count | Pattern |
|------|--------------|----------|-----------|---------|
| Critical | Any | 0% | 0 | — |
| High | Any | 0% | 0 | — |
| **Medium** | Automated/Preventive | **≤1%** | **≤2** | None |
| **Medium** | Detective/Manual | **≤2%** | **≤3** | None |
| **Low** | Any | **≤5%** | **≤5** | None |

**Dual-Gate:** Both % AND count must pass. Qualitative overlay can still override to Ineffective.

---

## Impact Scope Screening (Replaces "Blast Radius")

| Question | YES → | NO → |
|----------|-------|------|
| Single failure disables enterprise protection? | **Exclude** | Continue |
| Compensating controls exist downstream? | Continue | **Exclude** |
| Unit of impact bounded (account/role/resource)? | Continue | **Exclude** |

**Result:** Local = Eligible ✅ | Global = 0% Always ❌

---

## AWS Cloud IAM Controls: Quick Assessment

| Eligible (10) | Excluded - Global Impact (5) | Review (2) |
|---------------|------------------------------|------------|
| IAM Identity Center | CloudTrail Logging Prevention | PCA Cert Issuance |
| ECR Human Role Access | Block IAM Outside Network | RAM External Restriction |
| MemoryDB IAM Auth | Account Org Restriction | |
| SageMaker Encryption | Data Perimeter | |
| Human→Machine Role | GuardDuty Usage | |
| SSM Documents* | | |
| SageMaker Root Access | | |
| MemoryDB ACL | | |
| Connect Permissions | | |
| Lambda URLs | | |

*Currently Ineffective—needs 4Q stability

---

## Transparency Commitment

| Always Reported | Purpose |
|-----------------|---------|
| Raw exception count & rate | Full visibility |
| Threshold applied | Audit trail |
| Controls at threshold boundary | Watch list |
| Final rating | Executive summary |

**New Rating:** "Effective – Noted Exception" = within threshold but requires action plan

---

## Standards Alignment

| Standard | How We Align |
|----------|--------------|
| **PCAOB AS 2315** | ≤5% tolerable deviation for low-risk areas |
| **5100.1.016 ECS** | Extends existing safe harbor provision |
| **NIST CSF 2.0** | GV.RM proportional risk management |
| **COBIT MEA03** | Risk-based monitoring approach |

---

## Key Messages for ERM

✅ **Say:** "Standards-aligned tolerable deviation focusing attention on material breakdowns"

✅ **Say:** "Raw exceptions still reported; only the rating conclusion changes"

✅ **Say:** "Critical, High, and SOX controls remain at zero tolerance"

❌ **Don't Say:** "Improving our metrics" or "Accepting more risk"

---

## Next Steps

| Phase | Timeline |
|-------|----------|
| Finalize criteria & assess 270 controls | 4 weeks |
| Pilot on 10-15 Low-risk controls | Q1 |
| Expand to all eligible controls | Q2 |
