"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Eye, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter,
  Download,
  Calendar,
  AlertCircle,
  DollarSign,
  Package,
  MapPin,
  Edit,
} from "lucide-react";
import { useUserOrders } from "@/hooks/useUserOrders";

// Order interface matching your database schema
interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  currency: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  order_date: string;
  shipped_date: string | null;
  delivered_date: string | null;
  shipping_address: any;
  billing_address: any;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string | null;
  notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  pending: { 
    variant: "outline" as const, 
    color: "bg-yellow-100 text-yellow-800",
    label: "Pending"
  },
  processing: { 
    variant: "secondary" as const, 
    color: "bg-blue-100 text-blue-800",
    label: "Processing"
  },
  shipped: { 
    variant: "default" as const, 
    color: "bg-purple-100 text-purple-800",
    label: "Shipped"
  },
  delivered: { 
    variant: "default" as const, 
    color: "bg-green-100 text-green-800",
    label: "Delivered"
  },
  cancelled: { 
    variant: "destructive" as const, 
    color: "bg-red-100 text-red-800",
    label: "Cancelled"
  },
  refunded: { 
    variant: "destructive" as const, 
    color: "bg-orange-100 text-orange-800",
    label: "Refunded"
  },
};

const paymentStatusConfig = {
  pending: { 
    variant: "outline" as const, 
    color: "bg-yellow-100 text-yellow-800",
    label: "Pending"
  },
  paid: { 
    variant: "default" as const, 
    color: "bg-green-100 text-green-800",
    label: "Paid"
  },
  failed: { 
    variant: "destructive" as const, 
    color: "bg-red-100 text-red-800",
    label: "Failed"
  },
  refunded: { 
    variant: "destructive" as const, 
    color: "bg-orange-100 text-orange-800",
    label: "Refunded"
  },
};

const ITEMS_PER_PAGE = 10;

export default function UserOrdersTable() {
  // State management
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Order>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch data
  const { orders, isLoading, error } = useUserOrders();

  // Helper functions
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined || isNaN(amount)) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    try {
      if (!Array.isArray(orders)) {
        return [];
      }

      let filtered = orders.filter((order) => {
        if (!order) return false;
        
        const matchesSearch = search === "" || 
          order.order_number?.toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = statusFilter === "all" || order.status === statusFilter;
        const matchesPaymentStatus = paymentStatusFilter === "all" || order.payment_status === paymentStatusFilter;
        
        return matchesSearch && matchesStatus && matchesPaymentStatus;
      });

      // Sort orders
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === "asc" 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
      });

      return filtered;
    } catch (error) {
      console.error('Error filtering and sorting orders:', error);
      return [];
    }
  }, [orders, search, statusFilter, paymentStatusFilter, sortField, sortDirection]);

  // Pagination
  const paginatedOrders = useMemo(() => {
    try {
      if (!Array.isArray(filteredAndSortedOrders)) {
        return [];
      }
      
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = currentPage * ITEMS_PER_PAGE;
      
      return filteredAndSortedOrders.slice(startIndex, endIndex);
    } catch (error) {
      console.error('Error paginating orders:', error);
      return [];
    }
  }, [filteredAndSortedOrders, currentPage]);

  const totalPages = useMemo(() => {
    try {
      const totalItems = Array.isArray(filteredAndSortedOrders) ? filteredAndSortedOrders.length : 0;
      return Math.ceil(totalItems / ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error calculating total pages:', error);
      return 1;
    }
  }, [filteredAndSortedOrders]);

  // Event handlers
  const handleSort = useCallback((field: keyof Order) => {
    if (field === sortField) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  }, [sortField]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
    setPaymentStatusFilter("all");
    setCurrentPage(1);
  }, []);

  // Handle edit form changes
  const handleEditChange = (field: string, value: any) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };

  // Save order changes
  const handleSaveEdit = async () => {
    if (!editOrder) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await fetch(`/api/orders/${editOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!response.ok) {
        throw new Error(`Failed to update order: ${response.statusText}`);
      }
      setEditOrder(null);
      setEditForm({});
      // Optionally: refetch orders
      window.location.reload();
    } catch (err: any) {
      setSaveError(err.message || "Failed to update order");
    } finally {
      setIsSaving(false);
    }
  };

  // Safe array access for display
  const safeFilteredOrders = Array.isArray(filteredAndSortedOrders) ? filteredAndSortedOrders : [];
  const safePaginatedOrders = Array.isArray(paginatedOrders) ? paginatedOrders : [];

  return (
    <div className="space-y-4">
      {/* Header with search and filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 flex items-center max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <DollarSign className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Payments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={resetFilters}>
            Clear Filters
          </Button>
        </div>

        {/* Export */}
        <Button variant="outline" onClick={() => console.log("Export orders")}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Results summary */}
      <div className="text-sm text-gray-600">
        Showing {safePaginatedOrders.length} of {safeFilteredOrders.length} orders
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">Loading orders...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Failed to load orders: {error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("order_number")}
                >
                  Order #
                  {sortField === "order_number" && (
                    <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("total_amount")}
                >
                  Total
                  {sortField === "total_amount" && (
                    <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("created_at")}
                >
                  Date
                  {sortField === "created_at" && (
                    <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safePaginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-500">No orders found</p>
                      {(search || statusFilter !== "all" || paymentStatusFilter !== "all") && (
                        <Button variant="outline" size="sm" onClick={resetFilters}>
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                safePaginatedOrders.map((order) => {
                  if (!order || !order.id) return null;
                  
                  return (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="font-medium">{order.order_number}</div>
                        <div className="text-sm text-gray-500">ID: {order.id.slice(0, 8)}...</div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.total_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={statusConfig[order.status].variant}
                          className={statusConfig[order.status].color}
                        >
                          {statusConfig[order.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={paymentStatusConfig[order.payment_status].variant}
                          className={paymentStatusConfig[order.payment_status].color}
                        >
                          {paymentStatusConfig[order.payment_status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {formatDate(order.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setEditOrder(order); setEditForm({ notes: order.notes, shipping_address: order.shipping_address }); }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder.order_number}</DialogTitle>
              <DialogDescription>
                Complete order information and tracking details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-4">Order Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Subtotal</div>
                      <div className="font-medium">{formatCurrency(selectedOrder.subtotal)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Tax</div>
                      <div className="font-medium">{formatCurrency(selectedOrder.tax_amount)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Shipping</div>
                      <div className="font-medium">{formatCurrency(selectedOrder.shipping_amount)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Total</div>
                      <div className="font-bold text-lg">{formatCurrency(selectedOrder.total_amount)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Status */}
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Status
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Order Status</div>
                      <Badge 
                        variant={statusConfig[selectedOrder.status].variant}
                        className={statusConfig[selectedOrder.status].color}
                      >
                        {statusConfig[selectedOrder.status].label}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Payment Status</div>
                      <Badge 
                        variant={paymentStatusConfig[selectedOrder.payment_status].variant}
                        className={paymentStatusConfig[selectedOrder.payment_status].color}
                      >
                        {paymentStatusConfig[selectedOrder.payment_status].label}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Order Date</div>
                      <div className="font-medium">{formatDate(selectedOrder.order_date)}</div>
                    </div>
                    {selectedOrder.shipped_date && (
                      <div>
                        <div className="text-sm text-gray-500">Shipped Date</div>
                        <div className="font-medium">{formatDate(selectedOrder.shipped_date)}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Shipping Address
                    </h4>
                    <div className="text-sm">
                      <div>{selectedOrder.shipping_address.first_name} {selectedOrder.shipping_address.last_name}</div>
                      {selectedOrder.shipping_address.company && (
                        <div>{selectedOrder.shipping_address.company}</div>
                      )}
                      <div>{selectedOrder.shipping_address.address}</div>
                      {selectedOrder.shipping_address.apartment && (
                        <div>Apt {selectedOrder.shipping_address.apartment}</div>
                      )}
                      <div>
                        {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}
                      </div>
                      <div>{selectedOrder.shipping_address.country}</div>
                      <div className="mt-2">{selectedOrder.shipping_address.phone}</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Notes */}
              {selectedOrder.notes && (
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Order Notes</h4>
                    <p className="text-gray-700">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Order Modal */}
      {editOrder && (
        <Dialog open={!!editOrder} onOpenChange={() => setEditOrder(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Order #{editOrder.order_number}</DialogTitle>
              <DialogDescription>Update your order details below.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-1">Order Notes</label>
                <Input
                  value={editForm.notes || ""}
                  onChange={e => handleEditChange("notes", e.target.value)}
                  placeholder="Add notes for your order"
                />
              </div>
              {/* Shipping Address (simple example) */}
              <div>
                <label className="block text-sm font-medium mb-1">Shipping Address</label>
                <Input
                  value={editForm.shipping_address?.address || ""}
                  onChange={e => handleEditChange("shipping_address", { ...editForm.shipping_address, address: e.target.value })}
                  placeholder="Shipping address"
                />
              </div>
              {/* Cancel Order (if allowed) */}
              {editOrder.status === "pending" && (
                <Button
                  variant="destructive"
                  onClick={() => handleEditChange("status", "cancelled")}
                  disabled={isSaving}
                >
                  Cancel Order
                </Button>
              )}
              {saveError && <div className="text-red-500 text-sm">{saveError}</div>}
            </div>
            <DialogFooter>
              <Button onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 