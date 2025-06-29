'use client';

import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, X } from 'lucide-react';

interface StockUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onSave: (updates: any) => void;
}

export default function StockUpdateModal({
  isOpen,
  onClose,
  product,
  onSave,
}: StockUpdateModalProps) {
  const [currentStock, setCurrentStock] = useState(0);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setCurrentStock(product.current_stock || 0);
      setLowStockThreshold(product.low_stock_threshold || 10);
      setReason('');
    }
  }, [product]);

  const handleSave = async () => {
    if (!product) return;

    setIsLoading(true);
    try {
      await onSave({
        current_stock: currentStock,
        low_stock_threshold: lowStockThreshold,
        reason: reason || 'Manual stock adjustment',
      });
    } catch (error) {
      console.error('Error saving stock update:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStockStatus = () => {
    if (currentStock === 0) {
      return { status: 'out-of-stock', label: 'Out of Stock', color: 'destructive' as const };
    } else if (currentStock <= lowStockThreshold) {
      return { status: 'low-stock', label: 'Low Stock', color: 'secondary' as const };
    } else {
      return { status: 'in-stock', label: 'In Stock', color: 'default' as const };
    }
  };

  const stockChange = product ? currentStock - product.current_stock : 0;
  const stockStatus = getStockStatus();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Stock Level</DialogTitle>
          <DialogDescription>
            Update the stock level and low stock threshold for this product.
          </DialogDescription>
        </DialogHeader>

        {product && (
          <div className="space-y-6">
            {/* Product Info */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Product</Label>
              <div className="p-3 border rounded-md bg-muted/50">
                <div className="font-medium">{product.product_title}</div>
                <div className="text-sm text-muted-foreground">
                  Category: {product.category}
                </div>
                <div className="text-sm text-muted-foreground">
                  ID: {product.sanity_product_id}
                </div>
              </div>
            </div>

            {/* Current Stock */}
            <div className="space-y-2">
              <Label htmlFor="currentStock">Current Stock</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="currentStock"
                  type="number"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)}
                  min="0"
                  className="flex-1"
                />
                <Badge variant={stockStatus.color}>
                  {stockStatus.status === 'out-of-stock' && <X className="h-3 w-3 mr-1" />}
                  {stockStatus.status === 'low-stock' && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {stockStatus.status === 'in-stock' && <Package className="h-3 w-3 mr-1" />}
                  {stockStatus.label}
                </Badge>
              </div>
            </div>

            {/* Stock Change Indicator */}
            {stockChange !== 0 && (
              <div className="p-3 border rounded-md bg-muted/30">
                <div className="text-sm font-medium">
                  Stock Change: {stockChange > 0 ? '+' : ''}{stockChange}
                </div>
                <div className="text-xs text-muted-foreground">
                  Previous: {product.current_stock} → New: {currentStock}
                </div>
              </div>
            )}

            {/* Low Stock Threshold */}
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)}
                min="0"
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground">
                Products will be marked as "Low Stock" when current stock falls below this number.
              </p>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Change (Optional)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Restocked from supplier, Damaged items removed, etc."
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 