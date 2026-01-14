#!/usr/bin/env python3
"""
Script para processar PDF de Ciclos de Teste e gerar JSON
Uso: python3 process_ciclos_pdf.py <caminho_pdf> <caminho_json_saida>
"""
import sys
import json
import pdfplumber

def processar_ciclos_pdf(pdf_path, json_output_path):
    """Extrai dados do PDF de Ciclos de Teste e salva em JSON"""
    
    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[0]
        tables = page.extract_tables()
        
        if not tables:
            raise ValueError("Nenhuma tabela encontrada no PDF")
        
        table = tables[0]
        
        # Encontrar linha de headers (contém "GERENTE")
        header_row_idx = None
        for i, row in enumerate(table):
            if row and 'GERENTE' in (row[1] or ''):
                header_row_idx = i
                break
        
        if header_row_idx is None:
            raise ValueError("Linha de headers não encontrada")
        
        # Processar dados (linhas após headers até "TOTAL:")
        ciclos = []
        for row in table[header_row_idx + 1:]:
            if not row or not row[1]:  # Linha vazia ou sem gerente
                continue
            
            if 'TOTAL:' in (row[1] or ''):  # Fim dos dados
                break
            
            # Extrair dados
            gerente = (row[1] or '').strip()
            cliente = (row[2] or '').strip()
            projeto = (row[3] or '').strip()
            sprint = (row[4] or '').strip()
            inicio = (row[5] or '').strip()
            fim = (row[6] or '').strip()
            duracao_str = (row[7] or '').strip()
            ciclo1 = (row[8] or '').strip()
            ciclo2 = (row[9] or '').strip()
            ciclo3 = (row[10] or '').strip()
            status = (row[11] or '').strip()
            correcoes_horas_str = (row[12] or '').strip()
            correcoes_cards_str = (row[13] or '').strip()
            total_horas_str = (row[14] or '').strip()
            total_cards_str = (row[15] or '').strip()
            tempo_previsto_str = (row[16] or '').strip()
            retrabalho_str = (row[17] or '').strip()
            
            # Converter valores numéricos
            try:
                duracao = int(duracao_str) if duracao_str else 0
            except:
                duracao = 0
            
            try:
                correcoes_horas = float(correcoes_horas_str.replace(',', '.')) if correcoes_horas_str else 0
            except:
                correcoes_horas = 0
            
            try:
                correcoes_cards = int(correcoes_cards_str) if correcoes_cards_str else 0
            except:
                correcoes_cards = 0
            
            try:
                total_horas = float(total_horas_str.replace(',', '.')) if total_horas_str else 0
            except:
                total_horas = 0
            
            try:
                total_cards = int(total_cards_str) if total_cards_str else 0
            except:
                total_cards = 0
            
            try:
                tempo_previsto = float(tempo_previsto_str.replace(',', '.')) if tempo_previsto_str else 0
            except:
                tempo_previsto = 0
            
            try:
                retrabalho = float(retrabalho_str.replace(',', '.').replace('%', '')) if retrabalho_str else 0
            except:
                retrabalho = 0
            
            ciclo = {
                "gerente": gerente,
                "cliente": cliente,
                "projeto": projeto,
                "sprint": sprint,
                "inicio": inicio,
                "fim": fim,
                "duracao": duracao,
                "ciclo1": ciclo1,
                "ciclo2": ciclo2,
                "ciclo3": ciclo3,
                "status": status,
                "correcoes_horas": correcoes_horas,
                "correcoes_cards": correcoes_cards,
                "total_horas": total_horas,
                "total_cards": total_cards,
                "tempo_previsto": tempo_previsto,
                "retrabalho": retrabalho
            }
            ciclos.append(ciclo)
        
        # Salvar JSON
        with open(json_output_path, 'w', encoding='utf-8') as f:
            json.dump(ciclos, f, ensure_ascii=False, indent=2)
        
        return ciclos

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Uso: python3 process_ciclos_pdf.py <caminho_pdf> <caminho_json_saida>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    json_output_path = sys.argv[2]
    
    try:
        ciclos = processar_ciclos_pdf(pdf_path, json_output_path)
        print(f"✅ {len(ciclos)} ciclos extraídos e salvos em {json_output_path}")
    except Exception as e:
        print(f"❌ Erro: {e}")
        sys.exit(1)
