from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from io import BytesIO
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg') # Necessary for non-GUI environments

class PDFService:
    @staticmethod
    def _generate_efficiency_chart(activities):
        total_va = len([a for a in activities if a['classification'] == 'VA'])
        total_nva = len([a for a in activities if a['classification'] == 'NVA'])
        
        # Colors matching dashboard
        YELLOW = '#FFD600'
        GRAY = '#E5E7EB'
        
        fig, ax = plt.subplots(figsize=(4, 4))
        wedges, _ = ax.pie([total_va, total_nva], 
                           colors=[YELLOW, GRAY], 
                           startangle=90, 
                           wedgeprops={'width': 0.4, 'edgecolor': 'w'})
        
        ax.set_title("EFICIENCIA DEL PROCESO\nDistribución VA vs NVA", 
                     fontsize=10, fontweight='bold', pad=20)
        
        # Legend
        ax.legend(wedges, ['Valor Añadido (VA)', 'No Valor Añadido (NVA)'],
                  loc="center", bbox_to_anchor=(0.5, -0.1), 
                  frameon=False, fontsize=8)

        img_buffer = BytesIO()
        plt.savefig(img_buffer, format='png', dpi=300, bbox_inches='tight', transparent=True)
        img_buffer.seek(0)
        plt.close(fig)
        return img_buffer

    @staticmethod
    def _generate_category_chart(activities):
        # Calculate minutes per category
        category_map = {}
        for a in activities:
            cat = a['category']
            mins = a.get('annual_minutes', 0)
            category_map[cat] = category_map.get(cat, 0) + mins
        
        # Sort by minutes descending
        sorted_cats = sorted(category_map.items(), key=lambda x: x[1], reverse=True)
        names = [x[0] for x in sorted_cats]
        values = [x[1] for x in sorted_cats]
        
        YELLOW = '#FFD600'
        TEXT_COLOR = '#4B5563'

        fig, ax = plt.subplots(figsize=(6, 4))
        bars = ax.barh(names, values, color=YELLOW)
        ax.invert_yaxis() # Highest on top
        
        ax.set_title("CARGA POR CATEGORÍA\nMinutos anuales totales", 
                     fontsize=10, fontweight='bold', pad=20)
        
        # Hide spines
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['bottom'].set_visible(False)
        ax.set_xticks([]) # Hide x-axis ticks
        
        # Add labels
        for i, v in enumerate(values):
            ax.text(v + (max(values)*0.02), i, f"{v:,.0f} min", 
                    color=TEXT_COLOR, fontweight='bold', va='center', fontsize=8)

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
        
        # Layout for summary and charts
        # We'll use a table to put text summary next to charts or just stack them
        elements.append(summary_table)
        elements.append(Spacer(1, 20))

        # 3. Visual Analytics (Charts)
        elements.append(Paragraph("ANÁLISIS VISUAL DE PROCESO", styles['Heading3']))
        
        try:
            eff_img_buf = PDFService._generate_efficiency_chart(activities)
            cat_img_buf = PDFService._generate_category_chart(activities)
            
            # Add images to elements
            # We wrap them in a table to put them side-by-side
            eff_img = Image(eff_img_buf, width=200, height=200)
            cat_img = Image(cat_img_buf, width=280, height=180)
            
            chart_table = Table([[eff_img, cat_img]], colWidths=[220, 300])
            chart_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            elements.append(chart_table)
        except Exception as e:
            elements.append(Paragraph(f"Error generando gráficos: {str(e)}", styles['Normal']))
        
        elements.append(Spacer(1, 10))

        # 4. Detailed Activities Table
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

        # 5. Global AI Analysis (Optional)
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
