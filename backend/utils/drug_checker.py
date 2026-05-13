import httpx
from typing import List

OPENFDA_URL = "https://api.fda.gov/drug/label.json"
OPENFDA_DDI_URL = "https://api.fda.gov/drug/event.json"

async def check_drug_interactions(new_drug: str, existing_drugs: List[str]) -> List[dict]:
    """
    Check if new_drug has dangerous interactions with any existing drugs.
    Returns list of interactions found.
    """
    if not existing_drugs:
        return []

    interactions_found = []

    for existing_drug in existing_drugs:
        try:
            # Search OpenFDA for drug interaction reports
            query = f'patient.drug.medicinalproduct:"{new_drug}"+AND+patient.drug.medicinalproduct:"{existing_drug}"'
            url = f"{OPENFDA_DDI_URL}?search={query}&limit=1"

            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url)

                if response.status_code == 200:
                    data = response.json()
                    total = data.get("meta", {}).get("results", {}).get("total", 0)

                    if total > 0:
                        # Interaction reports exist
                        severity = classify_severity(total)
                        interactions_found.append({
                            "drug_1": new_drug,
                            "drug_2": existing_drug,
                            "reports_found": total,
                            "severity": severity,
                            "message": f"Potential interaction between {new_drug} and {existing_drug}. {total} adverse event reports found in FDA database."
                        })
        except Exception as e:
            # If API fails — skip silently, never block prescription
            print(f"Drug check failed for {new_drug} + {existing_drug}: {e}")
            continue

    return interactions_found


def classify_severity(report_count: int) -> str:
    """Classify severity based on number of FDA adverse event reports"""
    if report_count >= 1000:
        return "critical"
    elif report_count >= 100:
        return "high"
    elif report_count >= 10:
        return "medium"
    else:
        return "low"