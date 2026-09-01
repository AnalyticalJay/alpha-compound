import json
import re
from collections import Counter

INPUT = "/home/ubuntu/category-audit-input.json"
OUTPUT = "/home/ubuntu/category-audit-report.json"

with open(INPUT, encoding="utf-8") as f:
    products = json.load(f)

def classify(p):
    text = " ".join(str(p.get(k) or "") for k in ("name", "description", "dosageInfo")).lower()
    name = str(p.get("name") or "").lower()
    # Specific compound classes take precedence over presentation form.
    if re.search(r"\b(lgd[- ]?4033|anabolicum|andarine|s4\b|cardarine|gw501516|ostarine|mk[- ]?2866|rad[- ]?140|testolone|ligandrol|ac[- ]?262536)\b", text):
        return "SARMS", "high", "Name or description identifies a SARM compound."
    if re.search(r"\b(bpc[- ]?157|tb[- ]?500|cjc[- ]?1295|cjc1295|ipamorelin|ghrp[- ]?6|ghk[- ]?cu|peg[- ]?mgf|igf[- ]?1|hgh fragment|epithalon|gonadorelin|hcg|melanotan|pt[- ]?141|aod[- ]?9604|semaglutide|tirzepatide)\b", text) or "peptide" in text:
        return "PEPTIDES", "high", "Name or description identifies a peptide or peptide hormone."
    if re.search(r"\b(clenbuterol|albuterol|salbutamol|dnp|fat loss|yohimbine|lipo[- ]?6|cagrilintide)\b", text):
        return "FAT LOSS", "high", "Name or description identifies a fat-loss/metabolic product in the catalogue taxonomy."
    if re.search(r"\b(amp|amps|injectable|injection|inj\b|oil|ester|testosterone|nandrolone|boldenone|trenbolone|drostanolone|methenolone|masteron|deca|sustanon|aquaject|depoject|duraject|equiject|finaject|mastaject|nandroject|nebidoject|primoject|testoviron|hgh\b)\b", text) and not re.search(r"\b(tab|tabs|tablet|tablets|oral|capsule|capsules|drops)\b", text):
        return "AMPS", "high", "Name or description identifies an injectable, ampoule, oil, or injectable anabolic formulation."
    if re.search(r"\b(tablet|tablets|tab|tabs|oral|capsule|capsules|drops|per tab)\b", text):
        # Standard medicines are kept in PHARMA; anabolic oral products remain ORALS.
        if re.search(r"\b(amoxicillin|amox|accutane|isotretinoin|arimidex|anastrozole|aromasin|exemestane|clomid|clomiphene|cyt3|liothyronine|dostinex|cabergoline|dutasteride|finpecia|finasteride|femara|letrozole|betamox|adoretic|amiloretic|cialis|tadalafil|aromasin|dhea|tamoxifen|nolvadex)\b", text):
            return "PHARMA", "high", "Name or description identifies a conventional prescription or supportive medicine."
        return "ORALS", "high", "Name or description identifies an oral tablet, capsule, or drop formulation."
    if re.search(r"\b(antibiotic|dermatology|hair loss|fertility|thyroid|diuretic|prescription|medical)\b", text):
        return "PHARMA", "medium", "Description indicates a conventional pharmaceutical use, but presentation evidence is limited."
    return str(p.get("categoryName") or "OTHER").upper(), "low", "No sufficiently specific category signal found; manual review recommended."

rows = []
for p in products:
    recommended, confidence, rationale = classify(p)
    current = str(p.get("categoryName") or "OTHER").upper()
    rows.append({
        "id": p.get("id"),
        "name": p.get("name"),
        "slug": p.get("slug"),
        "current_category": current,
        "recommended_category": recommended,
        "confidence": confidence,
        "rationale": rationale,
        "needs_manual_review": confidence != "high" or recommended != current and recommended == "PHARMA",
    })

changes = [r for r in rows if r["current_category"] != r["recommended_category"]]
high = [r for r in changes if r["confidence"] == "high"]
report = {
    "product_count": len(rows),
    "rows": rows,
    "summary_current": dict(Counter(r["current_category"] for r in rows)),
    "summary_recommended": dict(Counter(r["recommended_category"] for r in rows)),
    "change_count": len(changes),
    "high_confidence_changes": high,
    "manual_review_count": sum(1 for r in rows if r["needs_manual_review"]),
}
with open(OUTPUT, "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2, ensure_ascii=False)
print(json.dumps({"product_count": len(rows), "change_count": len(changes), "high_confidence_change_count": len(high), "manual_review_count": report["manual_review_count"], "output": OUTPUT}))
