"use client";
import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert } from "@/components/ui/alert";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function InventoryGrid() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    async function fetchInventory() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/inventory");
        if (!res.ok) throw new Error("Failed to fetch inventory");
        const data = await res.json();
        setInventory(data);
      } catch (e: any) {
        setError(e.message);
      }
      setLoading(false);
    }
    fetchInventory();
  }, []);

  const lowStock = inventory.filter(item => item.stock_quantity <= item.reorder_point);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Inventory</h2>
      {error && <Alert variant="destructive">{error}</Alert>}
      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="low">Low Stock</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <InventoryTable items={inventory} loading={loading} setSelectedItem={setSelectedItem} />
        </TabsContent>
        <TabsContent value="low">
          <InventoryTable items={lowStock} loading={loading} setSelectedItem={setSelectedItem} />
        </TabsContent>
      </Tabs>
      {/* Inventory details dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          <h3 className="text-lg font-semibold mb-2">Inventory Item Details</h3>
          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-96">{JSON.stringify(selectedItem, null, 2)}</pre>
        </DialogContent>
      </Dialog>
      {/* Real-time updates placeholder */}
    </div>
  );
}

function InventoryTable({ items, loading, setSelectedItem }: { items: any[], loading: boolean, setSelectedItem: (item: any) => void }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Reorder Point</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>
          ) : items.length === 0 ? (
            <TableRow><TableCell colSpan={5}>No items found.</TableCell></TableRow>
          ) : items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.product_name}</TableCell>
              <TableCell>{item.sku}</TableCell>
              <TableCell>{item.stock_quantity}</TableCell>
              <TableCell>{item.reorder_point}</TableCell>
              <TableCell>
                <Button size="sm" variant="outline" onClick={() => setSelectedItem(item)}>View</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 