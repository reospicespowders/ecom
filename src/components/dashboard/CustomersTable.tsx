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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter,
  Download,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  ShoppingBag,
  AlertCircle
} from "lucide-react";
import { useCustomerProfile } from "@/hooks/useCustomer";

// Enhanced Customer Interface
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  registration: string;
  orders: number;
  spent: number;
  status: "active" | "inactive" | "blocked";
  avatar?: string;
  lastOrderDate?: string;
  tags?: string[];
  notes?: string;
}

// Enhanced mock data
const mockCustomers: Customer[] = [
  {
    id: "C001",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 555-1234",
    registration: "2024-01-10",
    orders: 12,
    spent: 1200,
    status: "active",
    lastOrderDate: "2024-06-15",
    tags: ["VIP", "Loyal"],
    notes: "Prefers express shipping"
  },
  {
    id: "C002",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1 555-5678",
    registration: "2024-02-15",
    orders: 5,
    spent: 350,
    status: "inactive",
    lastOrderDate: "2024-05-20",
    tags: ["Retail"],
  },
  {
    id: "C003",
    name: "Alice Brown",
    email: "alice@example.com",
    phone: "+1 555-8765",
    registration: "2024-03-20",
    orders: 8,
    spent: 800,
    status: "active",
    lastOrderDate: "2024-06-20",
    tags: ["Wholesale"],
  },
  {
    id: "C004",
    name: "Bob Lee",
    email: "bob@example.com",
    phone: "+1 555-4321",
    registration: "2024-04-05",
    orders: 2,
    spent: 100,
    status: "blocked",
    lastOrderDate: "2024-04-10",
    tags: ["Risk"],
    notes: "Payment issues reported"
  },
  {
    id: "C005",
    name: "Carol Wilson",
    email: "carol@example.com",
    phone: "+1 555-9876",
    registration: "2024-05-12",
    orders: 15,
    spent: 2500,
    status: "active",
    lastOrderDate: "2024-06-25",
    tags: ["VIP", "Premium"],
  },
  {
    id: "C006",
    name: "David Chen",
    email: "david@example.com",
    phone: "+1 555-2468",
    registration: "2024-06-01",
    orders: 1,
    spent: 50,
    status: "active",
    lastOrderDate: "2024-06-02",
    tags: ["New"],
  }
];

const statusConfig = {
  active: { 
    variant: "default" as const, 
    color: "tw-bg-green-100 tw-text-green-800",
    label: "Active"
  },
  inactive: { 
    variant: "secondary" as const, 
    color: "tw-bg-gray-100 tw-text-gray-800",
    label: "Inactive"
  },
  blocked: { 
    variant: "destructive" as const, 
    color: "tw-bg-red-100 tw-text-red-800",
    label: "Blocked"
  },
};

const ITEMS_PER_PAGE = 5;

export default function CustomersTable() {
  // State management
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selected, setSelected] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Customer>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  // Fetch real customer data
  const { customer, isLoading, isError } = useCustomerProfile();

  // Use real data if available, otherwise fallback to mock
  const customersData = customer ? [customer] : mockCustomers;

  // Memoized filtered and sorted data
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customersData.filter((customer) => {
      const matchesSearch = !search || 
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.email.toLowerCase().includes(search.toLowerCase()) ||
        customer.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || customer.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    // Sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
    return filtered;
  }, [customersData, search, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = filteredAndSortedCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Event handlers
  const handleSort = useCallback((field: keyof Customer) => {
    if (field === sortField) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }, [sortField]);

  const handleSelectAll = useCallback((checked: boolean) => {
    setSelected(checked ? paginatedCustomers.map(c => c.id) : []);
  }, [paginatedCustomers]);

  const handleSelectCustomer = useCallback((customerId: string, checked: boolean) => {
    setSelected(prev => 
      checked 
        ? [...prev, customerId]
        : prev.filter(id => id !== customerId)
    );
  }, []);

  const handleBulkAction = useCallback((action: string) => {
    console.log(`Bulk action: ${action} for customers:`, selected);
    // Implement bulk actions here
    setSelected([]);
  }, [selected]);

  const handleExport = useCallback(() => {
    const dataToExport = selected.length > 0 
      ? customersData.filter(c => selected.includes(c.id))
      : filteredAndSortedCustomers;
    
    console.log("Exporting customers:", dataToExport);
    // Implement CSV export logic here
  }, [selected, filteredAndSortedCustomers]);

  const handleDeleteCustomer = useCallback((customerId: string) => {
    console.log("Deleting customer:", customerId);
    setShowDeleteDialog(false);
    setCustomerToDelete(null);
    // Implement delete logic here
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("");
    setCurrentPage(1);
  }, []);

  // Get customer initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map(n => n[0] || "")
      .join("")
      .toUpperCase();
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="tw-space-y-4">
      {/* Header with search and filters */}
      <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-justify-between tw-gap-6 tw-mb-6">
        {/* Search */}
        <div className="tw-flex-1 tw-flex tw-items-center">
          <div className="tw-relative tw-w-full md:tw-max-w-xs">
            <Search className="tw-absolute tw-left-4 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-h-5 tw-w-5 tw-text-[var(--color-primary-700)]" />
            <Input
              className="tw-w-full tw-pl-12 tw-h-12 tw-rounded-xl tw-bg-white/80 tw-backdrop-blur-lg tw-shadow-md tw-border-none tw-text-base tw-font-medium tw-placeholder-gray-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-[var(--color-primary-500)] focus:tw-bg-white"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {/* Filter */}
        <div className="tw-flex-1 tw-flex tw-justify-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="tw-h-16 tw-px-8 tw-rounded-xl tw-bg-white/80 tw-backdrop-blur-lg tw-shadow-md tw-border-none tw-flex tw-items-center tw-gap-3 tw-font-bold tw-text-lg tw-text-[var(--color-primary-700)] hover:tw-bg-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-[var(--color-primary-500)]">
              <Filter className="tw-h-6 tw-w-6" />
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Export */}
        <div className="tw-flex-1 tw-flex tw-justify-end">
          <Button
            variant="outline"
            size="lg"
            className="tw-h-16 tw-px-8 tw-rounded-xl tw-bg-white/80 tw-backdrop-blur-lg tw-shadow-md tw-border-none tw-flex tw-items-center tw-gap-3 tw-font-bold tw-text-lg tw-text-[var(--color-primary-700)] hover:tw-bg-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-[var(--color-primary-500)]"
            onClick={handleExport}
          >
            <Download className="tw-h-6 tw-w-6" />
            Export
          </Button>
        </div>
      </div>

      {/* Results summary */}
      <div className="tw-text-sm tw-text-gray-600">
        Showing {paginatedCustomers.length} of {filteredAndSortedCustomers.length} customers
        {selected.length > 0 && ` (${selected.length} selected)`}
      </div>

      {/* Table */}
      <div className="card-modern tw-shadow-lg tw-rounded-xl tw-bg-white tw-p-0 tw-overflow-x-auto">
        {isLoading ? (
          <div className="tw-p-8 tw-text-center">Loading customers...</div>
        ) : isError ? (
          <div className="tw-p-8 tw-text-center tw-text-red-500">Failed to load customers.</div>
        ) : (
          <Table className="tw-min-w-full tw-border-separate tw-border-spacing-0">
            <TableHeader>
              <TableRow>
                <TableHead className="tw-w-12 tw-bg-white/90 tw-sticky tw-top-0 tw-z-10 tw-backdrop-blur-md tw-shadow-sm"></TableHead>
                <TableHead className="tw-font-bold tw-text-lg tw-text-[var(--color-primary-900)] tw-bg-white/90 tw-sticky tw-top-0 tw-z-10 tw-backdrop-blur-md tw-shadow-sm">Customer</TableHead>
                <TableHead className="tw-font-bold tw-text-lg tw-text-[var(--color-primary-900)] tw-bg-white/90 tw-sticky tw-top-0 tw-z-10 tw-backdrop-blur-md tw-shadow-sm">Registration</TableHead>
                <TableHead className="tw-font-bold tw-text-lg tw-text-[var(--color-primary-900)] tw-bg-white/90 tw-sticky tw-top-0 tw-z-10 tw-backdrop-blur-md tw-shadow-sm">Orders</TableHead>
                <TableHead className="tw-font-bold tw-text-lg tw-text-[var(--color-primary-900)] tw-bg-white/90 tw-sticky tw-top-0 tw-z-10 tw-backdrop-blur-md tw-shadow-sm">Total Spent</TableHead>
                <TableHead className="tw-font-bold tw-text-lg tw-text-[var(--color-primary-900)] tw-bg-white/90 tw-sticky tw-top-0 tw-z-10 tw-backdrop-blur-md tw-shadow-sm">Status</TableHead>
                <TableHead className="tw-font-bold tw-text-lg tw-text-[var(--color-primary-900)] tw-bg-white/90 tw-sticky tw-top-0 tw-z-10 tw-backdrop-blur-md tw-shadow-sm tw-text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="tw-text-center tw-py-8">
                    <div className="tw-flex tw-flex-col tw-items-center tw-gap-2">
                      <AlertCircle className="tw-h-8 tw-w-8 tw-text-gray-400" />
                      <p className="tw-text-gray-500">No customers found</p>
                      {(search || statusFilter) && (
                        <Button variant="outline" size="sm" onClick={resetFilters}>
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCustomers.map((customer, index) => {
                  const status = customer.status as keyof typeof statusConfig;
                  const statusInfo = statusConfig[status] || { label: "Unknown", color: "tw-bg-gray-200 tw-text-gray-600", variant: "secondary" };
                  return (
                    <TableRow key={customer.id} className={`${index % 2 === 0 ? 'tw-bg-white' : 'tw-bg-[var(--color-neutral-100)]'} hover:tw-shadow-lg hover:tw-scale-[1.01] tw-transition tw-rounded-lg`}>
                      <TableCell className="tw-px-6 tw-py-4 tw-align-middle">
                        <div className="tw-h-7 tw-w-7 tw-rounded-full tw-bg-gradient-to-br tw-from-[var(--color-primary-100)] tw-to-[var(--color-primary-500)] tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-[var(--color-primary-700)]">
                          {getInitials(customer.name)}
                        </div>
                      </TableCell>
                      <TableCell className="tw-px-6 tw-py-4 tw-align-middle">
                        <div className="tw-font-semibold tw-text-[var(--color-primary-900)]">{customer.name}</div>
                        <div className="tw-text-sm tw-text-gray-500">{customer.email}</div>
                        <div className="tw-text-xs tw-text-gray-400 tw-flex tw-items-center"><Phone className="tw-h-3 tw-w-3 tw-mr-1" />{customer.phone}</div>
                      </TableCell>
                      <TableCell className="tw-px-6 tw-py-4 tw-align-middle">
                        <div className="tw-flex tw-items-center tw-gap-1 tw-text-sm">
                          <Calendar className="tw-h-3 tw-w-3 tw-text-gray-400" />
                          {formatDate(customer.registration)}
                        </div>
                      </TableCell>
                      <TableCell className="tw-px-6 tw-py-4 tw-align-middle tw-font-semibold tw-text-[var(--color-primary-900)]">
                        {customer.orders}
                      </TableCell>
                      <TableCell className="tw-px-6 tw-py-4 tw-align-middle tw-font-semibold tw-text-[var(--color-primary-900)]">
                        ${typeof customer.spent === "number" ? customer.spent.toLocaleString() : "0"}
                      </TableCell>
                      <TableCell className="tw-px-6 tw-py-4 tw-align-middle">
                        <span className={`tw-inline-block tw-rounded-full tw-px-4 tw-py-1 tw-text-xs tw-font-semibold tw-shadow-sm ${customer.status === 'active' ? 'tw-bg-[var(--color-primary-500)] tw-text-white' : customer.status === 'inactive' ? 'tw-bg-gray-400 tw-text-white' : 'tw-bg-blue-200 tw-text-blue-900'}`}>
                          {statusInfo.label}
                        </span>
                        {customer.tags && (
                          <div className="tw-flex tw-gap-1 tw-mt-1">
                            {customer.tags.slice(0, 2).map((tag: string) => (
                              <span key={tag} className="tw-inline-block tw-bg-gray-100 tw-text-gray-700 tw-rounded-full tw-px-2 tw-py-0.5 tw-text-xs tw-font-medium tw-mr-1">{tag}</span>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="tw-px-6 tw-py-4 tw-align-middle tw-text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="tw-h-5 tw-w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedCustomer(customer)}>
                              <Eye className="tw-h-4 tw-w-4 tw-mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="tw-h-4 tw-w-4 tw-mr-2" />
                              Edit Customer
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="tw-h-4 tw-w-4 tw-mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                setCustomerToDelete(customer.id);
                                setShowDeleteDialog(true);
                              }}
                              className="tw-text-red-600"
                            >
                              <Trash2 className="tw-h-4 tw-w-4 tw-mr-2" />
                              Delete
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
        <div className="tw-flex tw-items-center tw-justify-between">
          <div className="tw-text-sm tw-text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="tw-flex tw-gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="tw-h-4 tw-w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="tw-h-4 tw-w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="tw-max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="tw-space-y-4">
              <Card>
                <CardContent className="tw-pt-6">
                  <div className="tw-flex tw-items-start tw-gap-4">
                    <Avatar className="tw-h-16 tw-w-16">
                      <AvatarImage src={selectedCustomer.avatar} />
                      <AvatarFallback>
                        {getInitials(selectedCustomer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="tw-flex-1">
                      <h3 className="tw-text-lg tw-font-semibold">{selectedCustomer.name}</h3>
                      <p className="tw-text-gray-600">{selectedCustomer.email}</p>
                      <p className="tw-text-gray-600">{selectedCustomer.phone}</p>
                      <div className="tw-flex tw-gap-2 tw-mt-2">
                        <Badge variant={statusConfig[selectedCustomer.status as keyof typeof statusConfig].variant} className="tw-bg-[var(--color-primary-500)] tw-text-white tw-rounded-full tw-px-3 tw-py-1 tw-text-xs tw-font-semibold tw-shadow-sm tw-inline-flex tw-items-center tw-gap-1 tw-animate-pulse">
                          {statusConfig[selectedCustomer.status as keyof typeof statusConfig].label}
                        </Badge>
                        {selectedCustomer.tags?.map(tag => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                <Card>
                  <CardContent className="tw-pt-6">
                    <div className="tw-text-2xl tw-font-bold">{selectedCustomer.orders}</div>
                    <p className="tw-text-gray-600">Total Orders</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="tw-pt-6">
                    <div className="tw-text-2xl tw-font-bold">${selectedCustomer.spent}</div>
                    <p className="tw-text-gray-600">Total Spent</p>
                  </CardContent>
                </Card>
              </div>

              {selectedCustomer.notes && (
                <Card>
                  <CardContent className="tw-pt-6">
                    <h4 className="tw-font-semibold tw-mb-2">Notes</h4>
                    <p className="tw-text-gray-700">{selectedCustomer.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this customer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => customerToDelete && handleDeleteCustomer(customerToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}