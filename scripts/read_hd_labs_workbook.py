from pathlib import Path
import json
import re
from openpyxl import load_workbook

input_path = Path('/home/ubuntu/upload/WebsiteHDBPPricelist2026.xlsx')
output_path = Path('/home/ubuntu/alpha-compound/hd_labs_workbook_extract.json')

wb = load_workbook(input_path, data_only=True, read_only=True)
print('SHEETS:', wb.sheetnames)

sheet = next((ws for ws in wb.worksheets if 'hd' in ws.title.lower() and 'lab' in ws.title.lower()), wb.worksheets[0])
rows = list(sheet.iter_rows(values_only=True))

nonempty = []
for index, row in enumerate(rows, start=1):
    values = [None if value is None else str(value).strip() for value in row]
    if any(value not in (None, '') for value in values):
        nonempty.append({'row_number': index, 'values': values})

header_row = next((item for item in nonempty if any('product' in (value or '').lower() or 'name' in (value or '').lower() for value in item['values'])), None)
header = header_row['values'] if header_row else []

records = []
if header_row:
    start = header_row['row_number']
    for item in nonempty:
        if item['row_number'] <= start:
            continue
        values = item['values']
        if not any(values):
            continue
        record = {header[i] if i < len(header) and header[i] else f'column_{i+1}': values[i] if i < len(values) else None for i in range(len(values))}
        records.append({'row_number': item['row_number'], 'data': record})

payload = {
    'source_file': str(input_path),
    'sheet': sheet.title,
    'sheetnames': wb.sheetnames,
    'header_row': header_row,
    'record_count': len(records),
    'records': records,
}
output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding='utf-8')
print(json.dumps({'sheet': sheet.title, 'record_count': len(records), 'header': header}, indent=2, ensure_ascii=False))
print(f'WROTE {output_path}')

for item in records[:12]:
    print(item)

wb.close()
_by_number = re.compile(r'(?<![A-Za-z])([0-9]{1,5})\s*(?:mg|mcg|iu|ml|tabs?|caps?)?\b', re.I)
# Keep compilation in this script so future audit extensions use one normalization module.
assert _by_number
