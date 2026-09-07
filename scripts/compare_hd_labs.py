from pathlib import Path
import json
import re
from difflib import SequenceMatcher

workbook = json.loads(Path('/home/ubuntu/alpha-compound/hd_labs_workbook_extract.json').read_text())
catalogue = json.loads(Path('/home/ubuntu/alpha-compound/hd_labs_catalogue_export.json').read_text())

CATEGORY_MAP = {
    'ORALS': 'ORALS', 'SARMS': 'SARMS', 'PEPTIDES': 'PEPTIDES', 'INJECTABLES': 'INJECTABLES',
    'FAT LOSS': 'FAT LOSS', 'ANCILLARIES': 'ANCILLARIES', 'POST CYCLE': 'POST CYCLE',
    'AMPS': 'AMPS', 'PHARMA': 'PHARMA', 'OTHER': 'OTHER'
}

def clean(value):
    value = str(value or '').upper()
    value = re.sub(r'\.(JPG|JPEG|PNG|WEBP|XLSX)$', '', value)
    value = value.replace('&', ' AND ')
    value = re.sub(r'\bHD\s*LABS?\b', ' ', value)
    value = re.sub(r'\bHD\b', ' ', value)
    value = re.sub(r'\b(BP\s*PHARMA|BP)\b', ' ', value)
    value = re.sub(r'\b(AMP|AMPOULE|VIAL|TABLETS?|TABS?|CAPSULES?|CAPS?|BOTTLE|BOX|PACK)\b', ' ', value)
    value = re.sub(r'[^A-Z0-9]+', ' ', value)
    return re.sub(r'\s+', ' ', value).strip()

def dosage(value):
    text = str(value or '').upper().replace(',', '.')
    matches = re.findall(r'(?<![A-Z0-9])([0-9]+(?:\.[0-9]+)?)\s*(MG|MCG|G|IU|ML)\b', text)
    return tuple(f'{number}{unit}' for number, unit in matches)

def product_key(value):
    return clean(value)

# Parse workbook rows and carry section headers forward.
workbook_products = []
current_category = None
excluded_rows = {33, 76}
for item in workbook['records']:
    if item['row_number'] in excluded_rows:
        continue
    data = item['data']
    raw_name = data.get('PRODUCT') or ''
    raw_price = data.get('PRICE')
    upper = str(raw_name).strip().upper()
    header = upper.rstrip(':')
    if header in CATEGORY_MAP:
        current_category = CATEGORY_MAP[header]
        continue
    if not raw_name or raw_price in (None, ''):
        continue
    price_match = re.search(r'[-+]?[0-9]+(?:\.[0-9]+)?', str(raw_price).replace(',', ''))
    workbook_products.append({
        'row_number': item['row_number'],
        'source_name': str(raw_name).strip(),
        'source_price': float(price_match.group(0)) if price_match else None,
        'source_category': current_category,
        'source_key': product_key(raw_name),
        'source_dosage': dosage(raw_name),
    })

for item in catalogue:
    item['catalogue_key'] = product_key(item['name'])
    item['catalogue_dosage'] = dosage(item['name']) + dosage(item.get('dosageInfo'))

def score(source, product):
    a, b = source['source_key'], product['catalogue_key']
    ratio = SequenceMatcher(None, a, b).ratio()
    dosage_bonus = 0.12 if source['source_dosage'] and set(source['source_dosage']).intersection(product['catalogue_dosage']) else 0
    containment_bonus = 0.15 if a in b or b in a else 0
    return ratio + dosage_bonus + containment_bonus

matches = []
used = set()
for source in workbook_products:
    ranked = sorted(((score(source, product), product) for product in catalogue if product['id'] not in used), key=lambda x: x[0], reverse=True)
    best_score, best = ranked[0] if ranked else (0, None)
    if best and best_score >= 0.72:
        used.add(best['id'])
        matches.append({'status': 'matched', 'score': round(best_score, 3), 'source': source, 'catalogue': best})
    else:
        matches.append({'status': 'unmatched_source', 'score': round(best_score, 3), 'source': source, 'catalogue': best})

matched_ids = {m['catalogue']['id'] for m in matches if m['status'] == 'matched'}
for product in catalogue:
    if product['id'] not in matched_ids:
        matches.append({'status': 'website_only', 'score': None, 'source': None, 'catalogue': product})

for m in matches:
    if m['status'] != 'matched':
        continue
    source, product = m['source'], m['catalogue']
    m['checks'] = {
        'category_match': source['source_category'] == (product.get('categoryName') or '').upper(),
        'price_match': source['source_price'] == float(product['price']) if product.get('price') is not None else False,
        'dosage_overlap': bool(set(source['source_dosage']).intersection(product['catalogue_dosage'])) if source['source_dosage'] else True,
        'stock_present': int(product.get('stockQuantity') or 0) > 0,
    }

# User-approved manual mapping: workbook ANAVAR50 / ANAVAR 50MG -> website product ID 120010.
for match in matches:
    if match.get('status') == 'unmatched_source' and match.get('source', {}).get('row_number') == 57:
        approved = next((product for product in catalogue if str(product['id']) == '120010'), None)
        if approved:
            match['status'] = 'matched'
            match['score'] = 1.0
            match['catalogue'] = approved
            match['checks'] = {
                'category_match': match['source']['source_category'] == (approved.get('categoryName') or '').upper(),
                'price_match': match['source']['source_price'] == float(approved['price']),
                'dosage_overlap': True,
                'stock_present': int(approved.get('stockQuantity') or 0) > 0,
                'approved_manual_mapping': True,
            }

summary = {
    'workbook_sheet': workbook['sheet'],
    'workbook_product_rows': len(workbook_products),
    'excluded_workbook_rows': sorted(excluded_rows),
    'approved_manual_mappings': {'ANAVAR 50MG': 120010},
    'active_hd_labs_catalogue_count': len(catalogue),
    'matched': sum(1 for m in matches if m['status'] == 'matched'),
    'unmatched_source': sum(1 for m in matches if m['status'] == 'unmatched_source'),
    'website_only': sum(1 for m in matches if m['status'] == 'website_only'),
    'matched_category_mismatches': sum(1 for m in matches if m.get('checks', {}).get('category_match') is False),
    'matched_price_mismatches': sum(1 for m in matches if m.get('checks', {}).get('price_match') is False),
    'matched_dosage_mismatches': sum(1 for m in matches if m.get('checks', {}).get('dosage_overlap') is False),
    'matched_zero_stock': sum(1 for m in matches if m.get('checks', {}).get('stock_present') is False),
}
report = {'summary': summary, 'matches': matches}
Path('/home/ubuntu/alpha-compound/hd_labs_cross_reference_report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
print(json.dumps(summary, indent=2))
print('\nUNMATCHED WORKBOOK PRODUCTS')
for m in matches:
    if m['status'] == 'unmatched_source': print(m['source']['row_number'], m['source']['source_name'], 'best=', m['catalogue']['name'] if m['catalogue'] else None, 'score=', m['score'])
print('\nCATEGORY MISMATCHES')
for m in matches:
    if m.get('checks', {}).get('category_match') is False: print(m['source']['source_name'], '=>', m['catalogue']['name'], '|', m['source']['source_category'], 'vs', m['catalogue'].get('categoryName'))
print('\nWEBSITE-ONLY COUNT:', summary['website_only'])
