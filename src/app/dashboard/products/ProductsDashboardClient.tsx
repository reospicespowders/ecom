'use client';

import { useState, useMemo } from 'react';
import { useProductsWithInventory } from '@/hooks/useRealTimeInventory';
import { useDebounce } from '@/hooks/useDebounce';
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
import Image from 'next/image';

export function ProductsDashboardClient() {
  const { user, isLoaded } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Check if user is admin
  const isAdmin = user?.publicMetadata?.admin_role === "admin"

  const filterOptions = useMemo(() => ({
    search: debouncedSearchTerm || undefined,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    lowStock: showLowStock,
    page: 1,
    limit: 50
  }), [debouncedSearchTerm, selectedCategory, showLowStock]);

  const {
    products,
    loading,
    error,
    pagination,
    stats,
    refetch
  } = useProductsWithInventory(filterOptions);

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
                {products?.length > 0 && 
                  [...new Set(products.map((p: any) => p.category?.name).filter(Boolean))].map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-filter">Stock Filter</Label>
              <div className="flex items-center space-x-2">
                <input
                  id="low-stock"
                  type="checkbox"
                  checked={showLowStock}
                  onChange={(e) => setShowLowStock(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="low-stock" className="text-sm">Show Low Stock Only</Label>
              </div>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setShowLowStock(false);
                  refetch();
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({products?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : products?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No products found matching your criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {products?.map((product: any) => (
                <div
                  key={product.product._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {product.product.image && (
                        <Image
                          src={product.product.image}
                          alt={product.product.title}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{product.product.title}</h3>
                        <p className="text-gray-600 text-sm">
                          SKU: {product.product.sku || 'N/A'} | 
                          Brand: {product.product.brand || 'N/A'} |
                          Category: {product.product.category?.name || 'Uncategorized'}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-lg font-bold">
                            ${product.product.price}
                          </span>
                          {product.product.sale_price && (
                            <span className="text-sm text-red-600 line-through">
                              ${product.product.sale_price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <InventoryStatus 
                        inventory={product.inventory}
                        showExactCount={isAdmin}
                      />
                      
                      <div className="flex space-x-2">
                        <Badge variant={product.product.status === 'active' ? 'default' : 'secondary'}>
                          {product.product.status || 'active'}
                        </Badge>
                        {product.inventory?.low_stock && (
                          <Badge variant="destructive">Low Stock</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Inventory Management */}
                  {selectedProduct?.product._id === product.product._id && isAdmin && (
                    <div className="mt-4 pt-4 border-t">
                      <InventoryManager productId={product.product._id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 