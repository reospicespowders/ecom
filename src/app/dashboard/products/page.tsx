'use client';

import { useState } from 'react';
import { useProductsWithInventory } from '@/hooks/useRealTimeInventory';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Package, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Database,
  Upload
} from 'lucide-react';
import { InventoryStatus } from '@/components/InventoryStatus';
import { InventoryManager } from '@/components/admin/InventoryManager';
import { isAdminUser } from '@/lib/auth-helpers';

export default function ProductsDashboardPage() {
  const { user, isLoaded } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Check if user is admin
  const isAdmin = isAdminUser(user);

  const {
    products,
    loading,
    error,
    pagination,
    stats,
    refetch
  } = useProductsWithInventory({
    search: searchTerm || undefined,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    lowStock: showLowStock,
    page: 1,
    limit: 50
  });

  const handleSearch = () => {
    refetch();
  };

  const handleSyncFromSanity = async () => {
    if (!isAdmin) return;

    try {
      setIsSyncing(true);
      const response = await fetch('/api/products/sync', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to sync products');
      }

      const result = await response.json();
      alert(`Successfully synced ${result.synced} products from Sanity!`);
      refetch();
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync products. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(selectedProduct?.product._id === product.product._id ? null : product);
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Admin access required to view products management.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products Management</h1>
          <p className="text-muted-foreground">
            Manage product inventory and stock levels
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSyncFromSanity}
            disabled={isSyncing}
          >
            <Database className="h-4 w-4 mr-2" />
            {isSyncing ? 'Syncing...' : 'Sync from Sanity'}
          </Button>
          <Button
            variant="outline"
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.inStock || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.lowStock || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.outOfStock || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Products</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="Search by title, SKU, or brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Categories</option>
                {stats?.filters?.categories?.map((category: string) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Stock Status</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="lowStock"
                  checked={showLowStock}
                  onChange={(e) => setShowLowStock(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="lowStock" className="text-sm">
                  Low stock only
                </label>
              </div>
            </div>

            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full" disabled={loading}>
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product: any) => (
                <div
                  key={product.product._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {product.product.image && (
                        <img
                          src={product.product.image}
                          alt={product.product.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="font-medium">{product.product.title}</h3>
                        <p className="text-sm text-gray-600">
                          SKU: {product.product.sku || 'N/A'} | 
                          Brand: {product.product.brand || 'N/A'}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {product.product.category && (
                            <Badge variant="outline">{product.product.category.name}</Badge>
                          )}
                          <InventoryStatus 
                            productId={product.product._id} 
                            showExactCount={true}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium">${product.product.price}</div>
                      <div className="text-sm text-gray-600">
                        {product.product.quantity && (
                          <span>Sanity Qty: {product.product.quantity}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Inventory Manager */}
                  {selectedProduct?.product._id === product.product._id && (
                    <div className="mt-4 pt-4 border-t">
                      <InventoryManager productId={product.product._id} />
                    </div>
                  )}
                </div>
              ))}

              {products.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No products found. Try adjusting your filters or sync from Sanity.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 