'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, AlertTriangle, CheckCircle } from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (products: any[]) => void;
}

export default function BulkImportModal({
  isOpen,
  onClose,
  onImport,
}: BulkImportModalProps) {
  const [csvData, setCsvData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvData(text);
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string) => {
    try {
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const products = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const product: any = {};
        
        headers.forEach((header, i) => {
          const value = values[i] || '';
          if (header === 'current_stock' || header === 'low_stock_threshold') {
            product[header] = parseInt(value) || 0;
          } else {
            product[header] = value;
          }
        });
        
        return product;
      });

      setPreview(products);
      setError(null);
    } catch (err) {
      setError('Invalid CSV format. Please check your file.');
      setPreview([]);
    }
  };

  const handleManualInput = (value: string) => {
    setCsvData(value);
    if (value.trim()) {
      parseCSV(value);
    } else {
      setPreview([]);
    }
  };

  const handleImport = async () => {
    if (preview.length === 0) {
      setError('No valid data to import');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onImport(preview);
      setCsvData('');
      setPreview([]);
      onClose();
    } catch (err) {
      setError('Failed to import data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `sanity_product_id,product_title,category,current_stock,low_stock_threshold
product-1,Organic Apples,Fruits,50,10
product-2,Fresh Milk,Dairy,30,5
product-3,Whole Grain Bread,Bakery,25,8`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Inventory</DialogTitle>
          <DialogDescription>
            Import multiple products at once using CSV format or manual input.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
            <div>
              <h4 className="font-medium">CSV Template</h4>
              <p className="text-sm text-muted-foreground">
                Download the template to see the required format
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csvFile">Upload CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
          </div>

          {/* Manual Input */}
          <div className="space-y-2">
            <Label htmlFor="csvData">Or Paste CSV Data</Label>
            <Textarea
              id="csvData"
              value={csvData}
              onChange={(e) => handleManualInput(e.target.value)}
              placeholder="Paste your CSV data here..."
              rows={6}
            />
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <Label className="font-medium">
                  Preview ({preview.length} products)
                </Label>
              </div>
              <div className="max-h-40 overflow-y-auto border rounded-md">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-2 text-left">Product ID</th>
                      <th className="p-2 text-left">Title</th>
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-right">Stock</th>
                      <th className="p-2 text-right">Threshold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 5).map((product, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{product.sanity_product_id}</td>
                        <td className="p-2">{product.product_title}</td>
                        <td className="p-2">{product.category}</td>
                        <td className="p-2 text-right">{product.current_stock}</td>
                        <td className="p-2 text-right">{product.low_stock_threshold}</td>
                      </tr>
                    ))}
                    {preview.length > 5 && (
                      <tr>
                        <td colSpan={5} className="p-2 text-center text-muted-foreground">
                          ... and {preview.length - 5} more products
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={isLoading || preview.length === 0}
          >
            {isLoading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-pulse" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import {preview.length} Products
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 