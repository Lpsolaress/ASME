import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.pdf_service import PDFService
from datetime import datetime

def test_pdf_with_charts():
    session = {
        "company_name": "Test Company",
        "department": "Engineering",
        "created_at": datetime.now()
    }
    
    activities = [
        {"name": "Soldadura de chasis", "category": "Operación", "classification": "VA", "time_unit": 30, "volume_daily": 10, "annual_minutes": 72000},
        {"name": "Inspección de calidad", "category": "Revisión", "classification": "NVA", "time_unit": 10, "volume_daily": 10, "annual_minutes": 24000},
        {"name": "Mover piezas a almacén", "category": "Traslado", "classification": "NVA", "time_unit": 15, "volume_daily": 5, "annual_minutes": 18000},
    ]
    
    buffer = PDFService.generate_asme_report(session, activities)
    
    with open("test_report_with_charts.pdf", "wb") as f:
        f.write(buffer.getvalue())
    
    print("PDF generated successfully: test_report_with_charts.pdf")

if __name__ == "__main__":
    test_pdf_with_charts()
