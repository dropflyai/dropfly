'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge } from '@tremor/react';

interface Order {
  id: string;
  email: string;
  total_cents: number;
  status: string;
  supplier_order_id: string | null;
  tracking_number: string | null;
  created_at: string;
  cj_tracking_status?: string;
}

async function fetchOrders(): Promise<Order[]> {
  const res = await fetch('/api/admin/orders');
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'gray',
    processing: 'blue',
    shipped: 'orange',
    delivered: 'green',
    cancelled: 'red',
  };
  return colors[status] || 'gray';
}

export function OrdersTable() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: fetchOrders,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">Failed to load orders</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Order ID</TableHeaderCell>
            <TableHeaderCell>Customer</TableHeaderCell>
            <TableHeaderCell>Amount</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>CJ Order ID</TableHeaderCell>
            <TableHeaderCell>Tracking</TableHeaderCell>
            <TableHeaderCell>Date</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <a
                  href={`/admin/orders/${order.id}`}
                  className="font-mono text-xs text-orange-600 hover:text-orange-700"
                >
                  {order.id.slice(0, 8)}
                </a>
              </TableCell>
              <TableCell>{order.email}</TableCell>
              <TableCell>${(order.total_cents / 100).toFixed(2)}</TableCell>
              <TableCell>
                <Badge color={getStatusColor(order.status)} size="sm">
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>
                {order.supplier_order_id ? (
                  <span className="font-mono text-xs">{order.supplier_order_id}</span>
                ) : (
                  <span className="text-gray-400 text-xs">N/A</span>
                )}
              </TableCell>
              <TableCell>
                {order.tracking_number ? (
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-xs">{order.tracking_number}</span>
                    {order.cj_tracking_status && (
                      <Badge color="blue" size="xs">
                        {order.cj_tracking_status}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">Pending</span>
                )}
              </TableCell>
              <TableCell>
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
