import requests
import pandas as pd
import time
from datetime import datetime
from bs4 import BeautifulSoup
import traceback

# Компании и их URL для получения данных
companies = [
    {"name": "ВК", "url": "https://smart-lab.ru/q/VKCO/f/y/"},
    {"name": "Яндекс", "url": "https://smart-lab.ru/q/YDEX/f/y/"},
    {"name": "HeadHunter", "url": "https://smart-lab.ru/q/HEAD/f/y/"},
    {"name": "Позитив", "url": "https://smart-lab.ru/q/POSI/f/y/"},
    {"name": "Астра", "url": "https://smart-lab.ru/q/ASTR/f/y/"},
    {"name": "Аренадата", "url": "https://smart-lab.ru/q/DATA/f/y/"},
    {"name": "Диасофт", "url": "https://smart-lab.ru/q/DIAS/f/y/"},
    {"name": "Софтлайн", "url": "https://smart-lab.ru/q/SOFL/f/y/"},
    {"name": "Whoosh", "url": "https://smart-lab.ru/q/WUSH/f/y/"},
    {"name": "IVA Technologies", "url": "https://smart-lab.ru/q/IVAT/f/y/"},
    {"name": "Циан", "url": "https://smart-lab.ru/q/CIAN/f/y/"},
    {"name": "OZON", "url": "https://smart-lab.ru/q/OZON/f/y/"}
]

# Годы для извлечения данных
years = ["2023", "2024"]
ltm = ["LTM"]

def get_smart_lab_data_from_url(url, company_name):
    try: #получим данные с сайта smart-lab
        response = requests.get(url)
        if response.status_code != 200:
            return None

        html = response.text        
        soup = BeautifulSoup(html, 'html.parser')
        
        # извлечение тикера из URL
        ticker_start = url.rfind('/q/') + 3
        ticker_end = url.find('/', ticker_start)
        ticker = "Unknown"
        if ticker_start > 0 and ticker_end > ticker_start:
            ticker = url[ticker_start:ticker_end]        
        # создаем словарь с данными о компании
        company_data = {
            "Компания": company_name,
            "Тикер": ticker
        }
        
        # находим таблицу с финансовыми показателями
        tables = soup.find_all('table')        
        main_table = None
        
        for i, table in enumerate(tables):
            table_text = table.text.strip()
            if ('P/E' in table_text or 'P\/E' in table_text) and ('EV/EBITDA' in table_text or 'EV\/EBITDA' in table_text):
                main_table = table
                break
        
        if not main_table:
            return None
        
        # Получаем все строки таблицы
        rows = main_table.find_all('tr')
        
        # Находим заголовок таблицы (с годами)
        header_row = None
        for i, row in enumerate(rows):
            cells = row.find_all('td')
            if not cells:
                continue
                
            year_count = 0
            
            # Проверяем наличие стандартных годов и альтернативных названий LTM
            for cell in cells:
                cell_text = cell.text.strip()
                if cell_text in years:
                    year_count += 1
                # Проверяем альтернативные названия для LTM
                for ltm_alt in ltm:
                    if ltm_alt in cell_text:
                        year_count += 1
                        break
            
            if year_count >= 2:  # Если нашли как минимум 2 года/периода, считаем это заголовком
                header_row = row
                break
        
        if not header_row:
            return None
        
        # Определяем индексы колонок для каждого года
        year_columns = {}
        header_cells = header_row.find_all('td')
        
        for i, cell in enumerate(header_cells):
            cell_text = cell.text.strip()
            # Проверяем прямое совпадение для стандартных годов
            if cell_text in years:
                year_columns[cell_text] = i
            
            # Проверяем LTM альтернативы
            for ltm_alt in ltm:
                if ltm_alt in cell_text:
                    year_columns["LTM"] = i  # Всегда записываем как LTM для совместимости
                    break
        
        # Ищем строки с нужными метриками
        metrics = {
            "P/E": ["P/E", "P\/E"],
            "EV/EBITDA": ["EV/EBITDA", "EV\/EBITDA"],
            "P/S": ["P/S", "P\/S"],
            "P/BV": ["P/BV", "P\/BV"],
            "Капитализация": ["Капитализация"],
            "Число акций": ["Число акций", "Кол-во акций"],
            "Див. доходность": ["Див. доходность", "Дивидендная доходность", "Див доход, ао"],
            "Чистая прибыль": ["Чистая прибыль", "Чистая прибыль (убыток)"],
            "Выручка": ["Выручка", "Выручка и доходы"]
        }
        
        # Извлекаем значения для каждой метрики
        for metric_key, metric_searches in metrics.items():
            metric_row = None
            
            # Ищем строку с метрикой
            for i, row in enumerate(rows):
                row_text = row.text.strip()
                found = False
                for search_text in metric_searches:
                    if search_text in row_text:
                        metric_row = row
                        found = True
                        break
                if found:
                    break
            
            if not metric_row:
                continue
            
            # Получаем значения для каждого года
            cells = metric_row.find_all('td')
            
            for year, col_index in year_columns.items():
                if col_index < len(cells):
                    value = cells[col_index].text.strip()
                    
                    # Добавляем единицы измерения
                    if metric_key == "Капитализация" and value and value != "Н/Д":
                        value = f"{value} млрд. руб."
                    elif metric_key == "Число акций" and value and value != "Н/Д":
                        value = f"{value} млн."
                    
                    company_data[f"{metric_key}_{year}"] = value if value else "Н/Д"
                else:
                    company_data[f"{metric_key}_{year}"] = "Н/Д"
        
        return company_data
                
    except Exception as e:
        print(f"Ошибка при получении данных для {company_name}: {e}")
        traceback.print_exc()
        return None

def update_excel_data(new_data, file_path="stock_metrics_by_year.xlsx"):
    date_now = datetime.now().strftime("%Y-%m-%d")
    
    # Убеждаемся, что все данные включают дату обновления
    for data in new_data:
        if data:
            data["Дата обновления"] = date_now
    
    # Преобразуем новые данные в DataFrame, пропуская None
    valid_data = [d for d in new_data if d is not None]
    if not valid_data:
        return "Нет данных для сохранения в Excel"
    
    # Определим размерности для каждого показателя
    metrics_with_units = {
        "P/E": "P/E",
        "EV/EBITDA": "EV/EBITDA",
        "P/S": "P/S",
        "P/BV": "P/BV",
        "Капитализация": "Капитализация, млрд. руб.",
        "Число акций": "Число акций, млн.",
        "Див. доходность": "Див. доходность, %",
        "Чистая прибыль": "Чистая прибыль, млрд. руб.",
        "Выручка": "Выручка, млрд. руб."
    }
    
    # Создаем Excel-писатель для сохранения нескольких листов
    file_path_with_date = f"stock_metrics_{date_now}.xlsx"
    with pd.ExcelWriter(file_path_with_date, engine='xlsxwriter') as writer:
        # Отдельные листы для каждого года
        metrics = [
            "P/E", "EV/EBITDA", "P/S", "P/BV", 
            "Капитализация", "Число акций", "Див. доходность",
            "Чистая прибыль", "Выручка"
        ]
        
        workbook = writer.book
        
        # Формат для чисел с двумя десятичными знаками
        number_format = workbook.add_format({'num_format': '0.00'})
        percent_format = workbook.add_format({'num_format': '0.00%'})
        
        for year in years + ["LTM"]:
            # Создаем данные для каждого года
            year_data = []
            
            for metric in metrics:
                display_metric = metrics_with_units.get(metric, metric)
                row = {"Показатель": display_metric}
                numeric_values = []  # Список для хранения числовых значений
                numeric_values_no_vk = []  # Список для хранения числовых значений без ВК
                
                # Добавляем значение для каждой компании
                for company_data in valid_data:
                    company_name = company_data["Компания"]
                    metric_key = f"{metric}_{year}"
                    value = company_data.get(metric_key, "Н/Д")
                    
                    # Удаляем единицы измерения и конвертируем в числа
                    numeric_value = None
                    
                    if value != "Н/Д" and isinstance(value, str):
                        # Очищаем значение от единиц измерения
                        if "млрд. руб." in value:
                            value = value.replace(" млрд. руб.", "")
                        elif "млн." in value:
                            value = value.replace(" млн.", "")
                        elif "%" in value:
                            value = value.replace("%", "")
                        
                        # Заменяем запятые на точки и пробелы на пустоту
                        value = value.replace(",", ".").replace(" ", "")
                        
                        # Пробуем преобразовать в число
                        try:
                            numeric_value = float(value)
                            value = numeric_value  # Используем числовое значение
                            numeric_values.append(numeric_value)  # Добавляем в список для расчета среднего
                            if company_name != "ВК":  # Добавляем в список для расчета среднего без ВК
                                numeric_values_no_vk.append(numeric_value)
                        except (ValueError, TypeError):
                            pass
                    
                    row[company_name] = value
                
                # Рассчитываем среднее значение
                if numeric_values:
                    avg_value = sum(numeric_values) / len(numeric_values)
                    row["Среднее"] = avg_value
                else:
                    row["Среднее"] = "Н/Д"
                
                # Рассчитываем среднее значение без ВК
                if numeric_values_no_vk:
                    avg_value_no_vk = sum(numeric_values_no_vk) / len(numeric_values_no_vk)
                    row["Среднее без ВК"] = avg_value_no_vk
                else:
                    row["Среднее без ВК"] = "Н/Д"
                
                year_data.append(row)
            
            # Создаем DataFrame для года и сохраняем его на отдельном листе
            if year_data:
                year_df = pd.DataFrame(year_data)
                year_df.to_excel(writer, sheet_name=f"{year}", index=False)
                
                # Получаем объект листа
                worksheet = writer.sheets[year]
                
                # Устанавливаем форматы и формулы для средних
                for i, metric in enumerate(metrics):
                    row = i + 1  # +1 для учета заголовка
                    
                    # Находим количество компаний (колонок)
                    company_count = len(valid_data)
                    
                    # Формат для ячеек средних значений
                    if metric in ["P/E", "EV/EBITDA", "P/S", "P/BV"]:
                        worksheet.set_column(company_count + 1, company_count + 2, 12, number_format)
                    elif metric == "Див. доходность":
                        worksheet.set_column(company_count + 1, company_count + 2, 12, percent_format)
                    else:
                        worksheet.set_column(company_count + 1, company_count + 2, 12, number_format)
    
    return f"Создан файл с данными, размерностями показателей и расчетом средних значений"

def main():
    results = []
    
    for company in companies:
        company_name = company["name"]
        url = company["url"]
        
        data = get_smart_lab_data_from_url(url, company_name)
        if data:
            results.append(data)
        
        # Пауза между запросами, чтобы не перегружать сервер
        time.sleep(1)
    
    # Обновляем или создаем файл Excel в новом формате
    status = update_excel_data(results)
    print(f"\n{status}")
    
    # Также сохраним в старом формате для совместимости
    old_format_file = "stock_metrics_by_year.xlsx"
    
    # Для старого формата
    old_df = pd.DataFrame(results)
    if not old_df.empty:
        old_df.to_excel(old_format_file, index=False)
        print(f"Также сохранены данные в исходном формате: {old_format_file}")

if __name__ == "__main__":
    main()
