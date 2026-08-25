import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Download, FileUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminBulkImport() {
  const [csvContent, setCsvContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [uploadMode, setUploadMode] = useState<'paste' | 'excel'>('paste');

  const bulkImportMutation = trpc.products.bulkImportCSV.useMutation({
    onSuccess: (data: any) => {
      setResult(data);
      toast.success(`Imported ${data.imported} products!`);
      setCsvContent("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Import failed");
      setResult(null);
    },
  });

  const handleImport = async () => {
    if (!csvContent.trim()) {
      toast.error("Please paste CSV content or upload Excel file");
      return;
    }

    setIsLoading(true);
    try {
      await bulkImportMutation.mutateAsync({ csvData: csvContent });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      toast.error("Please upload an .xlsx workbook or use the CSV import option.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Excel workbooks must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];
      if (!worksheet) throw new Error("The workbook does not contain a worksheet.");

      // Extract products from Excel
      let csvLines = ['name,category,dosageInfo,description,brand'];
      let currentCategory = '';

      worksheet.eachRow({ includeEmpty: false }, (row) => {
        const cell = row.getCell(1).text.trim();
        if (!cell) return;
        
        // Check if this is a category header (ends with colon)
        if (cell.endsWith(':')) {
          currentCategory = cell.replace(':', '').trim();
        } else if (cell && currentCategory) {
          // This is a product
          const productName = cell;
          const dosage = row.getCell(2).text.trim();
          
          // Determine brand based on current category or file name
          const fileName = file.name.toUpperCase();
          const brand = fileName.includes('HD') ? 'HD Labs' : fileName.includes('BP') ? 'BP Pharma' : 'Unknown';
          
          csvLines.push(`"${productName}","${currentCategory}","${dosage}","${brand} - ${currentCategory}","${brand}"`);
        }
      });

      if (csvLines.length > 1) {
        setCsvContent(csvLines.join('\n'));
        toast.success(`Extracted ${csvLines.length - 1} products from Excel`);
      } else {
        toast.error('No products found in Excel file');
      }
    } catch (error: any) {
      toast.error(`Failed to read Excel file: ${error.message}`);
    }
  };

  const downloadTemplate = () => {
    const template = `name,category,dosageInfo,description,brand
Product Name,Category Name,Dosage Info,Description,Brand Name
HD TESTOVIRON 250mg 1ml AMP,AMPS,1ML AMP,1ML AMP,HD Labs
BP ANAPOLAN 25,ORAL STEROIDS,25,BP Pharma - ORAL STEROIDS,BP Pharma`;

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(template));
    element.setAttribute("download", "products-template.csv");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Bulk Import Products</h1>
        <p className="text-gray-400">Import multiple products at once using a CSV file</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Import Card */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white">CSV Import</CardTitle>
              <CardDescription>Paste your CSV content below (name, category, dosageInfo, description, brand)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
            {uploadMode === 'paste' ? (
              <Textarea
                placeholder="Paste CSV content here...&#10;name,category,dosageInfo,description,brand&#10;Product Name,Category,Dosage,Description,Brand"
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                className="min-h-64 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                disabled={isLoading}
              />
            ) : (
              <div className="min-h-64 bg-gray-800 border border-gray-700 rounded-md flex items-center justify-center">
                <label className="cursor-pointer text-center">
                  <FileUp className="h-12 w-12 mx-auto mb-3 text-blue-400" />
                  <p className="text-white font-semibold mb-1">Click to upload Excel file</p>
                  <p className="text-gray-400 text-sm">.xlsx format, up to 5 MB</p>
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleExcelUpload}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
              </div>
            )}

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  onClick={handleImport}
                  disabled={isLoading || !csvContent.trim()}
                  className="min-h-11 bg-blue-600 text-white hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    "Import Products"
                  )}
                </Button>

              <Button
                onClick={() => setUploadMode(uploadMode === 'paste' ? 'excel' : 'paste')}
                variant="outline"
                className="min-h-11 border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                {uploadMode === 'paste' ? 'Upload Excel' : 'Paste CSV'}
              </Button>

              <Button
                onClick={downloadTemplate}
                variant="outline"
                className="min-h-11 border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <Download className="mr-2 h-4 w-4" />
                Template
              </Button>

                <Button
                  onClick={() => {
                    setCsvContent("");
                    setResult(null);
                  }}
                  variant="outline"
                  className="min-h-11 border-gray-700 text-gray-300 hover:bg-gray-800"
                  disabled={isLoading}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <div className="space-y-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">CSV Format</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-400 space-y-2">
              <p>Required columns:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><span className="text-blue-400">name</span> - Product name</li>
                <li><span className="text-blue-400">category</span> - Category name</li>
                <li><span className="text-blue-400">dosageInfo</span> - Dosage (optional)</li>
                <li><span className="text-blue-400">description</span> - Description (optional)</li>
                <li><span className="text-blue-400">brand</span> - Brand name (optional)</li>
              </ul>
              <p className="pt-2 text-xs">Categories will be created automatically if they don't exist.</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-400 space-y-2">
              <ul className="list-disc list-inside space-y-1">
                <li>First row must be headers</li>
                <li>Duplicates will be skipped</li>
                <li>Price defaults to 0</li>
                <li>Stock defaults to 100</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results */}
      {result && (
        <Card className={`border-2 ${result.imported > 0 ? "border-green-500/50 bg-green-950/20" : "border-yellow-500/50 bg-yellow-950/20"}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              {result.imported > 0 ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Import Complete
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Import Finished
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-gray-400 text-sm">Imported</p>
                <p className="text-2xl font-bold text-green-400">{result.imported}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Skipped</p>
                <p className="text-2xl font-bold text-yellow-400">{result.skipped}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-blue-400">{result.imported + result.skipped}</p>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <Alert className="bg-red-950/20 border-red-500/50">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">
                  <p className="font-semibold mb-2">Errors encountered:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.errors.map((err: string, i: number) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <p className="text-gray-400 text-sm">{result.message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
