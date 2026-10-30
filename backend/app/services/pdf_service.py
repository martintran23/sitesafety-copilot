"""ReportLab audit-ready daily JHA generation."""

from __future__ import annotations

from datetime import date
from pathlib import Path
from typing import Iterable

from app.schemas.hazard_schema import Hazard


def generate_jha_pdf(
    *,
    output_path: Path,
    site_name: str,
    foreman_name: str,
    hazards: Iterable[Hazard],
    weather: str = "Not recorded",
) -> Path:
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib.units import inch
        from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
    except ImportError as exc:
        raise RuntimeError("PDF export requires reportlab. Install backend requirements first.") from exc

    hazard_list = list(hazards)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(str(output_path), pagesize=letter, rightMargin=0.45 * inch, leftMargin=0.45 * inch)
    styles = getSampleStyleSheet()
    body = styles["BodyText"]
    story = [Paragraph("SITESAFETY COPILOT - DAILY JOB HAZARD ANALYSIS", styles["Title"]), Spacer(1, 8)]
    metadata = [["Site sector", site_name], ["Lead inspector", foreman_name], ["Assessment date", str(date.today())], ["Weather / surface", weather]]
    meta = Table(metadata, colWidths=[1.5 * inch, 5.9 * inch])
    meta.setStyle(TableStyle([("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#e8eef5")), ("GRID", (0, 0), (-1, -1), 0.4, colors.grey), ("VALIGN", (0, 0), (-1, -1), "TOP")]))
    story += [meta, Spacer(1, 12), Paragraph("PPE CHECKLIST", styles["Heading2"])]
    ppe = [["Item", "OSHA reference", "Status"], ["Hard hat", "1926.100(a)", "Verify on site"], ["Eye protection", "1926.102", "Verify on site"], ["Fall harness", "1926.502(d)", "Verify when exposed"], ["High-visibility vest", "Site policy", "Verify on site"], ["Steel-toe boots", "Site policy", "Verify on site"]]
    ppe_table = Table(ppe, colWidths=[2.8 * inch, 1.7 * inch, 2.9 * inch], repeatRows=1)
    ppe_table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("GRID", (0, 0), (-1, -1), 0.4, colors.grey), ("VALIGN", (0, 0), (-1, -1), "TOP")]))
    story += [ppe_table, Spacer(1, 12), Paragraph("HAZARD IDENTIFICATION MATRIX", styles["Heading2"])]
    rows = [["#", "Hazard / description", "CFR", "Severity", "Corrective action", "Status"]]
    for index, hazard in enumerate(hazard_list, 1):
        rows.append([str(index), Paragraph(f"{hazard.title}<br/>{hazard.description}", body), hazard.osha_citation, f"{hazard.severity.value} ({hazard.severity_weight})", Paragraph(hazard.corrective_action, body), "Open"])
    if not hazard_list:
        rows.append(["-", "No hazards detected", "-", "-", "Continue routine controls", "Clear"])
    table = Table(rows, colWidths=[0.28 * inch, 1.65 * inch, 1.1 * inch, 0.78 * inch, 2.35 * inch, 0.65 * inch], repeatRows=1)
    table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("GRID", (0, 0), (-1, -1), 0.35, colors.grey), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("FONTSIZE", (0, 0), (-1, -1), 7), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")])]))
    story += [table, Spacer(1, 22), Paragraph("SIGN-OFF", styles["Heading2"]), Paragraph("Safety superintendent: ________________________________    Date: ______________", body), Spacer(1, 12), Paragraph("Subcontractor / crew lead acknowledgement: ________________________________", body)]
    doc.build(story)
    return output_path
