import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const orders = [
  { id: "1234", customer: "John Doe", total: "$120.00", status: "Paid", date: "2024-06-01" },
  { id: "1233", customer: "Jane Smith", total: "$80.00", status: "Pending", date: "2024-05-31" },
  { id: "1232", customer: "Alice Brown", total: "$45.00", status: "Shipped", date: "2024-05-30" },
  { id: "1231", customer: "Bob Lee", total: "$200.00", status: "Paid", date: "2024-05-29" },
];

export default function OrdersTable() {
  return (
    <Card className="tw-p-4 tw-bg-white tw-shadow-sm">
      <div className="tw-font-semibold tw-mb-2">Recent Orders</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>{order.total}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>{order.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
} 