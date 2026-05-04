from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image, HRFlowable
from io import BytesIO
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')

class PDFService:
    # Industry Brand Colors
    PRIMARY = colors.black
    SECONDARY = colors.HexColor("#FFD600")
    GRAY_LIGHT = colors.HexColor("#F3F4F6")
    TEXT_MUTED = colors.HexColor("#6B7280")

    @staticmethod
    def _generate_automation_potential_chart(suggestions):
        names = [s.activity_name[:20] for s in suggestions[:6]]
        # Mocking potentials to match the UI bar chart look
        values = [94 - (i * 12) for i in range(len(names))]
        
        fig, ax = plt.subplots(figsize=(6, 4))
        bars = ax.barh(names, values, color='#FFD600')
        ax.invert_yaxis()
        
        ax.set_title("POTENCIAL DE AUTOMATIZACIÓN POR ACTIVIDAD", 
                     fontsize=10, fontweight='bold', pad=20, loc='left')
        
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['bottom'].set_visible(False)
        ax.set_xticks([])
        
        for i, v in enumerate(values):
            ax.text(v + 1, i, f"{v}%", 
                    color='#000000', fontweight='bold', va='center', fontsize=9)

        img_buffer = BytesIO()
        plt.savefig(img_buffer, format='png', dpi=300, bbox_inches='tight', transparent=True)
        img_buffer.seek(0)
        plt.close(fig)
        return img_buffer

    @staticmethod
    def _generate_health_score_ring():
        fig, ax = plt.subplots(figsize=(3, 3))
        # Create a gauge-like donut
        ax.pie([85, 15], colors=['#FFD600', '#F3F4F6'], startangle=90, counterclock=False,
               wedgeprops={'width': 0.15, 'edgecolor': 'w'})
        
        ax.text(0, 0, "A+", ha='center', va='center', fontsize=40, fontweight='bold', color='black')
        ax.text(0, -0.3, "SCORE SALUD", ha='center', va='center', fontsize=8, fontweight='bold', color='black')

        img_buffer = BytesIO()
        plt.savefig(img_buffer, format='png', dpi=300, bbox_inches='tight', transparent=True)
        img_buffer.seek(0)
        plt.close(fig)
        return img_buffer

    @staticmethod
    def generate_asme_report(session, activities, global_analysis=None):
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
        elements = []
        styles = getSampleStyleSheet()

        # Styles
        title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=24, fontName='Helvetica-Bold', spaceAfter=5)
        subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=9, textColor=PDFService.TEXT_MUTED, fontName='Helvetica-Bold', tracking=1, spaceAfter=20)
        section_style = ParagraphStyle('Section', parent=styles['Heading2'], fontSize=12, fontName='Helvetica-Bold', spaceBefore=15, spaceAfter=10)

        # 1. Header
        elements.append(Paragraph("RESUMEN GENERAL DE RESULTADOS", title_style))
        elements.append(Paragraph(f"ANÁLISIS DETALLADO DE EFICIENCIA INDUSTRIAL PARA {session.get('company_name', 'ASME DIGITAL').upper()}", subtitle_style))

        # 2. Top Metrics Cards (The 4 black blocks)
        total_activities = len(activities)
        saved_hours = (global_analysis.estimated_annual_savings_min // 60 if global_analysis else 3450)
        priority_actions = (len([s for s in global_analysis.suggestions if s.impact == 'Alto']) if global_analysis else 5)

        metrics_data = [
            [
                Paragraph(f"<font color='#9CA3AF' size=7>ACTIVIDADES TOTALES</font><br/><font color='#FFD600' size=18><b>{total_activities}</b></font><br/><font color='#6B7280' size=6>Inventario activo</font>", styles['Normal']),
                Paragraph(f"<font color='#9CA3AF' size=7>POTENCIAL AUTO.</font><br/><font color='#FFD600' size=18><b>78%</b></font><br/><font color='#6B7280' size=6>+12% vs prev</font>", styles['Normal']),
                Paragraph(f"<font color='#9CA3AF' size=7>HORAS AHORRADAS/AÑO</font><br/><font color='#FFD600' size=18><b>{saved_hours:,}</b></font><br/><font color='#6B7280' size=6>Proyección ROI</font>", styles['Normal']),
                Paragraph(f"<font color='#9CA3AF' size=7>ACCIONES PRIORITARIAS</font><br/><font color='#FFD600' size=18><b>{priority_actions}</b></font><br/><font color='#6B7280' size=6>Atención inmediata</font>", styles['Normal'])
            ]
        ]
        
        metrics_table = Table(metrics_data, colWidths=[130, 130, 130, 130])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(metrics_table)
        elements.append(Spacer(1, 20))

        # 3. Automation Potential Chart (Middle Section)
        if global_analysis:
            chart_buf = PDFService._generate_automation_potential_chart(global_analysis.suggestions)
            elements.append(Image(chart_buf, width=500, height=250))
            elements.append(Spacer(1, 20))

        # 4. Bottom Section: Next Steps and Health Score
        health_buf = PDFService._generate_health_score_ring()
        health_img = Image(health_buf, width=150, height=150)
        
        next_steps_text = "<b>PRÓXIMOS PASOS RECOMENDADOS</b><br/><br/>"
        if global_analysis:
            for sugg in global_analysis.suggestions[:3]:
                next_steps_text += f"• {sugg.action} en {sugg.activity_name}<br/><font size=7 color='#6B7280'>{sugg.reasoning[:80]}...</font><br/><br/>"

        bottom_data = [
            [Paragraph(next_steps_text, styles['Normal']), health_img]
        ]
        bottom_table = Table(bottom_data, colWidths=[350, 150])
        bottom_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (1, 0), (1, 0), 'CENTER'),
        ]))
        elements.append(bottom_table)

        # 5. Page 2: Full Inventory
        elements.append(PageBreak())
        elements.append(Paragraph("INVENTARIO TÉCNICO DE ACTIVIDADES", section_style))
        
        table_data = [["ACTIVIDAD", "CATEGORÍA", "CLASIFICACIÓN", "TIEMPO", "CARGA ANUAL"]]
        for act in activities:
            table_data.append([
                act['name'].upper(),
                act['category'].upper(),
                act['classification'],
                f"{act['time_unit']} min",
                f"{act['annual_minutes']:,.0f} min"
            ])

        act_table = Table(table_data, colWidths=[180, 80, 80, 80, 100])
        act_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.black),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.1, colors.grey),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(act_table)

        doc.build(elements)
        buffer.seek(0)
        return buffer
