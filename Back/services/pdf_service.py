from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from io import BytesIO

class PDFService:
    @staticmethod
    def generate_asme_report(session, activities, global_analysis=None):
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
        elements = []
        styles = getSampleStyleSheet()

        # Custom Styles
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.black,
            spaceAfter=20,
            alignment=1, # Center
            fontName='Helvetica-Bold'
        )
        
        info_style = ParagraphStyle(
            'InfoStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.grey,
            spaceAfter=10
        )

        # 1. Header
        elements.append(Paragraph(f"INFORME DE ANÁLISIS ASME", title_style))
        elements.append(Paragraph(f"EMPRESA: {session['company_name'].upper()}", styles['Heading2']))
        elements.append(Paragraph(f"DEPARTAMENTO: {session['department']}", info_style))
        elements.append(Paragraph(f"FECHA: {str(session['created_at'])[:10]}", info_style))
        elements.append(Spacer(1, 20))

        # 2. Executive Summary Metrics
        total_activities = len(activities)
        total_va = len([a for a in activities if a['classification'] == 'VA'])
        total_nva = total_activities - total_va
        va_percent = (total_va / total_activities * 100) if total_activities > 0 else 0
        total_annual_min = sum([a['annual_minutes'] for a in activities])

        summary_data = [
            ["Métrica", "Valor"],
            ["Total Actividades", str(total_activities)],
            ["Valor Añadido (VA)", f"{total_va} ({va_percent:.1f}%)"],
            ["No Valor Añadido (NVA)", f"{total_nva} ({100-va_percent:.1f}%)"],
            ["Carga Anual Capturada", f"{total_annual_min:,.0f} min"]
        ]
        
        summary_table = Table(summary_data, colWidths=[150, 150])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (1, 0), colors.HexColor("#FFD600")),
            ('TEXTCOLOR', (0, 0), (1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        
        elements.append(Paragraph("RESUMEN EJECUTIVO", styles['Heading3']))
        elements.append(summary_table)
        elements.append(Spacer(1, 30))

        # 3. Detailed Activities Table
        elements.append(Paragraph("DETALLE DE ACTIVIDADES", styles['Heading3']))
        
        table_data = [["Actividad", "Categoría", "Tipo", "Tiempo", "Vol.", "Anual (min)"]]
        
        for act in activities:
            table_data.append([
                act['name'],
                act['category'],
                act['classification'],
                f"{act['time_unit']} min",
                str(act['volume_daily']),
                f"{act['annual_minutes']:,.0f}"
            ])

        act_table = Table(table_data, colWidths=[200, 80, 50, 60, 40, 80])
        act_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.black),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.2, colors.grey),
        ]))
        
        for i, act in enumerate(activities):
            color = colors.HexColor("#E8F5E9") if act['classification'] == 'VA' else colors.HexColor("#FFEBEE")
            act_table.setStyle(TableStyle([
                ('BACKGROUND', (0, i+1), (-1, i+1), color),
            ]))

        elements.append(act_table)

        # 4. Global AI Analysis (Optional)
        if global_analysis:
            elements.append(PageBreak())
            elements.append(Paragraph("PLAN DE OPTIMIZACIÓN ESTRATÉGICA (IA)", styles['Heading1']))
            elements.append(Spacer(1, 10))
            
            # Executive Summary of analysis
            elements.append(Paragraph(global_analysis.executive_summary, styles['Normal']))
            elements.append(Spacer(1, 20))
            
            # Savings Metric
            savings_text = f"Ahorro Anual Estimado: {global_analysis.estimated_annual_savings_min:,.0f} minutos"
            elements.append(Paragraph(savings_text, ParagraphStyle('Savings', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=12, textColor=colors.green)))
            elements.append(Spacer(1, 20))
            
            # Suggestions Table
            sugg_data = [["Actividad", "Acción", "Herramienta Sugerida", "Impacto"]]
            for sugg in global_analysis.suggestions:
                sugg_data.append([
                    sugg.activity_name,
                    sugg.action,
                    sugg.tool_type,
                    sugg.impact
                ])
            
            sugg_table = Table(sugg_data, colWidths=[150, 100, 150, 80])
            sugg_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#FFD600")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            elements.append(sugg_table)
            
            # Detailed Reasoning
            elements.append(Spacer(1, 20))
            elements.append(Paragraph("DETALLE TÉCNICO Y JUSTIFICACIÓN", styles['Heading3']))
            for sugg in global_analysis.suggestions:
                elements.append(Paragraph(f"<b>{sugg.activity_name}:</b> {sugg.reasoning}", styles['Normal']))
                elements.append(Spacer(1, 5))
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer
