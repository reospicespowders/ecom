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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  AlertCircle,
  User
} from "lucide-react";
import { useCustomerProfile, useAllCustomers } from "@/hooks/useCustomer";
import { useUser } from "@clerk/nextjs";

// Customer interface matching your database schema
interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  status: "active" | "inactive" | "blocked" | "prospect";
  source: string | null;
  total_orders: number | null;
  total_spent: number | null;
  average_order_value: number | null;
  last_order_date: string | null;
  last_contact_date: string | null;
  preferred_contact_method: "email" | "phone" | "sms" | "mail" | null;
  notes: string | null;
  custom_fields: Record<string, any> | null;
  created_at: string | null;
  updated_at: string | null;
  clerk_user_id: string | null;
}

const statusConfig = {
  active: { 
    variant: "default" as const, 
    color: "bg-green-100 text-green-800",
    label: "Active"
  },
  inactive: { 
    variant: "secondary" as const, 
    color: "bg-gray-100 text-gray-800",
    label: "Inactive"
  },
  blocked: { 
    variant: "destructive" as const, 
    color: "bg-red-100 text-red-800",
    label: "Blocked"
  },
  prospect: { 
    variant: "outline" as const, 
    color: "bg-blue-100 text-blue-800",
    label: "Prospect"
  },
};

const ITEMS_PER_PAGE = 10;

export default function CustomersTable() {
  // State management
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Customer>("first_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  // Fetch data
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { customer: currentUserCustomer, isLoading: isCurrentLoading, isError: isCurrentError } = useCustomerProfile();
  const { customers: allCustomers, isLoading: isAllLoading, isError: isAllError } = useAllCustomers();

  // Determine what data to show
  const customersData: Customer[] = useMemo(() => {
    // If we have all customers data (admin view), use that
    if (allCustomers && Array.isArray(allCustomers) && allCustomers.length > 0) {
      return allCustomers;
    }
    
    // If we have current user's customer data, show just that
    if (currentUserCustomer) {
      return [currentUserCustomer];
    }
    
    // If user is loaded but no customer profile exists, create a basic entry
    if (isUserLoaded && isSignedIn && user && !isCurrentLoading) {
      const basicCustomer: Customer = {
        id: user.id,
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        email: user.emailAddresses?.[0]?.emailAddress || null,
        phone: user.phoneNumbers?.[0]?.phoneNumber || null,
        avatar_url: user.imageUrl || null,
        address_line_1: null,
        address_line_2: null,
        city: null,
        state: null,
        postal_code: null,
        country: "US",
        status: "active",
        source: "clerk",
        total_orders: 0,
        total_spent: 0,
        average_order_value: 0,
        last_order_date: null,
        last_contact_date: null,
        preferred_contact_method: null,
        notes: null,
        custom_fields: {},
        created_at: user.createdAt ? new Date(user.createdAt).toISOString() : null,
        updated_at: null,
        clerk_user_id: user.id,
      };
      return [basicCustomer];
    }
    
    return [];
  }, [allCustomers, currentUserCustomer, user, isUserLoaded, isSignedIn, isCurrentLoading]);

  // Helper functions
  const getFullName = (customer: Customer) => {
    return `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "No Name";
  };

  const getInitials = (customer: Customer) => {
    const firstName = customer.first_name || "";
    const lastName = customer.last_name || "";
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "?";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "$0";
    return `$${amount.toLocaleString()}`;
  };

  // Memoized filtered and sorted data
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customersData.filter((customer) => {
      const fullName = getFullName(customer);
      const matchesSearch = !search || 
        fullName.toLowerCase().includes(search.toLowerCase()) ||
        (customer.email && customer.email.toLowerCase().includes(search.toLowerCase())) ||
        customer.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || customer.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle null values
      if (aValue === null) aValue = "";
      if (bValue === null) bValue = "";
      
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

  const handleExport = useCallback(() => {
    const dataToExport = filteredAndSortedCustomers;
    console.log("Exporting customers:", dataToExport);
    // TODO: Implement CSV export logic
  }, [filteredAndSortedCustomers]);

  const handleDeleteCustomer = useCallback((customerId: string) => {
    console.log("Deleting customer:", customerId);
    setShowDeleteDialog(false);
    setCustomerToDelete(null);
    // TODO: Implement delete logic
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("");
    setCurrentPage(1);
  }, []);

  // Loading and error states
  const isLoading = isCurrentLoading || isAllLoading;
  const isError = isCurrentError || isAllError;

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
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="prospect">Prospect</SelectItem>
          </SelectContent>
        </Select>

        {/* Export */}
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Results summary */}
      <div className="text-sm text-gray-600">
        Showing {paginatedCustomers.length} of {filteredAndSortedCustomers.length} customers
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">Loading customers...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">Failed to load customers.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("first_name")}
                >
                  Customer
                  {sortField === "first_name" && (
                    <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("created_at")}
                >
                  Registration
                  {sortField === "created_at" && (
                    <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("total_orders")}
                >
                  Orders
                  {sortField === "total_orders" && (
                    <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("total_spent")}
                >
                  Total Spent
                  {sortField === "total_spent" && (
                    <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-500">No customers found</p>
                      {(search || statusFilter) && (
                        <Button variant="outline" size="sm" onClick={resetFilters}>
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={customer.avatar_url || undefined} />
                          <AvatarFallback>
                            {getInitials(customer)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{getFullName(customer)}</div>
                          <div className="text-sm text-gray-500">ID: {customer.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {customer.email || "No email"}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {customer.phone || "No phone"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {formatDate(customer.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {customer.total_orders || 0}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(customer.total_spent)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={statusConfig[customer.status].variant}
                        className={statusConfig[customer.status].color}
                      >
                        {statusConfig[customer.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedCustomer(customer)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              setCustomerToDelete(customer.id);
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
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

      {/* Customer Details Modal */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedCustomer ? getFullName(selectedCustomer) : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedCustomer.avatar_url || undefined} />
                      <AvatarFallback>
                        {getInitials(selectedCustomer)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{getFullName(selectedCustomer)}</h3>
                      <p className="text-gray-600">{selectedCustomer.email || "No email"}</p>
                      <p className="text-gray-600">{selectedCustomer.phone || "No phone"}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={statusConfig[selectedCustomer.status].variant}>
                          {statusConfig[selectedCustomer.status].label}
                        </Badge>
                        {selectedCustomer.source && (
                          <Badge variant="outline">{selectedCustomer.source}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{selectedCustomer.total_orders || 0}</div>
                    <p className="text-gray-600">Total Orders</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{formatCurrency(selectedCustomer.total_spent)}</div>
                    <p className="text-gray-600">Total Spent</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{formatCurrency(selectedCustomer.average_order_value)}</div>
                    <p className="text-gray-600">Avg Order Value</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium">{formatDate(selectedCustomer.last_order_date)}</div>
                    <p className="text-gray-600">Last Order</p>
                  </CardContent>
                </Card>
              </div>

              {selectedCustomer.notes && (
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Notes</h4>
                    <p className="text-gray-700">{selectedCustomer.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Address */}
              {(selectedCustomer.address_line_1 || selectedCustomer.city) && (
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Address</h4>
                    <div className="text-sm text-gray-700">
                      {selectedCustomer.address_line_1 && <div>{selectedCustomer.address_line_1}</div>}
                      {selectedCustomer.address_line_2 && <div>{selectedCustomer.address_line_2}</div>}
                      <div>
                        {selectedCustomer.city && `${selectedCustomer.city}, `}
                        {selectedCustomer.state && `${selectedCustomer.state} `}
                        {selectedCustomer.postal_code}
                      </div>
                      {selectedCustomer.country && <div>{selectedCustomer.country}</div>}
                    </div>
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