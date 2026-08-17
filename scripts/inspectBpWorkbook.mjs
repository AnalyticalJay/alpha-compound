import XLSX from "xlsx";

const workbookPath = "/home/ubuntu/upload/BPPHARMAPRICElIST.xlsx";
const workbook = XLSX.readFile(workbookPath, { cellDates: false });

const report = workbook.SheetNames.map((sheetName) => {
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: false })
    .map((row, index) => ({ row: index + 1, values: row }))
    .filter(({ values }) => values.some((value) => String(value ?? "").trim() !== ""));

  return { sheetName, rowCount: rows.length, rows };
});

console.log(JSON.stringify({ workbookPath, sheets: report }, null, 2));
