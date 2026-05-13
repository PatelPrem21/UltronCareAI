"""
Lab Report Interpreter
━━━━━━━━━━━━━━━━━━━━━
1. Reads PDF from local disk using PyMuPDF
2. Extracts all text
3. Sends to Groq/Llama for structured interpretation
4. Returns color-coded results (green/orange/red)
"""

import os
import re
import fitz  # PyMuPDF
from groq import Groq

# ── Configure Groq ─────────────────────────────────────────────
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def extract_text_from_pdf(file_path: str) -> str:
    """Extract all text from a PDF file using PyMuPDF."""
    try:
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        raise ValueError(f"Failed to extract PDF text: {str(e)}")


def build_interpretation_prompt(pdf_text: str, report_name: str) -> str:
    return f"""
You are a medical lab report interpreter AI. Analyze the following lab report and provide a structured interpretation.

REPORT NAME: {report_name}

LAB REPORT TEXT:
{pdf_text[:4000]}

Your task:
1. Identify all test values in the report
2. For each test, determine if it is NORMAL, BORDERLINE, or ABNORMAL
3. Explain what each abnormal value means in simple language

Respond ONLY in this exact JSON format, no extra text:
{{
  "summary": "One sentence overall summary of the report",
  "overall_status": "normal" or "borderline" or "abnormal",
  "tests": [
    {{
      "name": "Test name",
      "value": "Measured value with unit",
      "reference_range": "Normal range",
      "status": "normal" or "borderline" or "abnormal",
      "explanation": "Simple explanation of what this means for the patient"
    }}
  ],
  "recommendations": "Brief recommendation for the doctor"
}}

Be accurate. Be concise. Use plain language a patient can understand.
""".strip()


async def interpret_lab_report(file_path: str, report_name: str) -> dict:
    """
    Main entry point.
    Takes local file path → returns structured interpretation dict.
    """

    # ── 1. Extract text from PDF ───────────────────────────────
    pdf_text = extract_text_from_pdf(file_path)

    if not pdf_text or len(pdf_text) < 50:
        return {
            "summary": "Could not extract meaningful text from PDF.",
            "overall_status": "unknown",
            "tests": [],
            "recommendations": "Please upload a text-based PDF (not a scanned image).",
            "raw_text": pdf_text,
        }

    # ── 2. Build prompt & call Groq ────────────────────────────
    prompt = build_interpretation_prompt(pdf_text, report_name)

    import asyncio
    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
            )
        )
        raw = response.choices[0].message.content.strip()

        # ── 3. Parse JSON response ─────────────────────────────
        import json
        # Strip markdown code fences if present
        raw = re.sub(r"```json|```", "", raw).strip()
        result = json.loads(raw)

    except json.JSONDecodeError:
        result = {
            "summary": "AI interpretation generated but could not be parsed.",
            "overall_status": "unknown",
            "tests": [],
            "recommendations": raw if 'raw' in dir() else "Please try again.",
        }
    except Exception as e:
        result = {
            "summary": f"AI interpretation failed: {str(e)}",
            "overall_status": "unknown",
            "tests": [],
            "recommendations": "Please try again.",
        }

    # ── 4. Add color coding ────────────────────────────────────
    color_map = {
        "normal":     "#00e5a0",   # green
        "borderline": "#ff8c42",   # orange
        "abnormal":   "#ff4466",   # red
        "unknown":    "#6b90b0",   # grey
    }

    result["overall_color"] = color_map.get(
        result.get("overall_status", "unknown"), "#6b90b0"
    )

    for test in result.get("tests", []):
        test["color"] = color_map.get(test.get("status", "unknown"), "#6b90b0")

    result["raw_text_length"] = len(pdf_text)

    return result
