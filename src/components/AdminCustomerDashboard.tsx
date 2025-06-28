"use client";

import React from "react";
import CustomersTable from "./dashboard/CustomersTable";

export default function AdminCustomerDashboard() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
        <p className="text-gray-600">Manage all customers in your system</p>
      </div>
      
      <CustomersTable />
    </div>
  );
} 