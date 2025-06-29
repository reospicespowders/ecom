'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Edit, 
  Package, 
  AlertTriangle, 
  X,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface InventoryProduct {
  id: string;
  sanity_product_id: string;
  product_title: string;
  category: string;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  low_stock_threshold: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

interface InventoryTableProps {
  inventory: InventoryProduct[];
  isLoading: boolean;
  onStockUpdate: (product: InventoryProduct) => void;
}

export default function InventoryTable({ 
  inventory, 
  isLoading, 
  onStockUpdate 
}: InventoryTableProps) {
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ [key: string]: number }>({});

  const getStockStatus = (product: InventoryProduct) => {
    if (product.current_stock === 0) {
      return { status: 'out-of-stock', label: 'Out of Stock', color: 'destructive' as const };
    } else if (product.current_stock <= product.low_stock_threshold) {
      return { status: 'low-stock', label: 'Low Stock', color: 'secondary' as const };
    } else {
      return { status: 'in-stock', label: 'In Stock', color: 'default' as const };
    }
  };

  const handleEdit = (product: InventoryProduct) => {
    setEditingProduct(product.id);
    setEditValues({
      current_stock: product.current_stock,
      low_stock_threshold: product.low_stock_threshold,
    });
  };

  const handleSave = (productId: string) => {
    onStockUpdate({
      ...inventory.find(p => p.id === productId)!,
      ...editValues,
    });
    setEditingProduct(null);
    setEditValues({});
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setEditValues({});
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        ))}
      </div>
    );
  }

  if (inventory.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">No products found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or add some products to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Current Stock</TableHead>
            <TableHead className="text-right">Available</TableHead>
            <TableHead className="text-right">Threshold</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventory.map((product) => {
            const stockStatus = getStockStatus(product);
            const isEditing = editingProduct === product.id;

            return (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{product.product_title}</div>
                    <div className="text-xs text-muted-foreground">
                      ID: {product.sanity_product_id}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{product.category}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editValues.current_stock || product.current_stock}
                      onChange={(e) => setEditValues({
                        ...editValues,
                        current_stock: parseInt(e.target.value) || 0
                      })}
                      className="w-20 text-right"
                    />
                  ) : (
                    <span className="font-mono">{product.current_stock}</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-mono">{product.available_stock}</span>
                </TableCell>
                <TableCell className="text-right">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editValues.low_stock_threshold || product.low_stock_threshold}
                      onChange={(e) => setEditValues({
                        ...editValues,
                        low_stock_threshold: parseInt(e.target.value) || 0
                      })}
                      className="w-20 text-right"
                    />
                  ) : (
                    <span className="font-mono">{product.low_stock_threshold}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={stockStatus.color}>
                    {stockStatus.status === 'out-of-stock' && <X className="h-3 w-3 mr-1" />}
                    {stockStatus.status === 'low-stock' && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {stockStatus.status === 'in-stock' && <Package className="h-3 w-3 mr-1" />}
                    {stockStatus.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(product.last_updated)}
                </TableCell>
                <TableCell className="text-right">
                  {isEditing ? (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleSave(product.id)}
                        className="h-8"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        className="h-8"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                      className="h-8"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
} 