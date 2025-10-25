'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, Metric, Text, Flex, ProgressBar, BarChart } from '@tremor/react';

interface KPIData {
  totalRevenueCents: number;
  orderCount: number;
  conversionRate: number;
  topSkus: Array<{
    sku: string;
    name: string;
    quantity: number;
    revenueCents: number;
  }>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
  }>;
}

async function fetchKPIs(): Promise<KPIData> {
  const res = await fetch('/api/admin/kpis');
  if (!res.ok) throw new Error('Failed to fetch KPIs');
  return res.json();
}

export function KPICards() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-kpis'],
    queryFn: fetchKPIs,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <p className="text-sm text-red-800">Failed to load KPI data</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <Text>Total Revenue</Text>
          <Metric>${(data.totalRevenueCents / 100).toFixed(2)}</Metric>
          <Flex className="mt-4">
            <Text className="truncate">30-day total</Text>
          </Flex>
        </Card>

        <Card>
          <Text>Total Orders</Text>
          <Metric>{data.orderCount}</Metric>
          <Flex className="mt-4">
            <Text className="truncate">All time</Text>
          </Flex>
        </Card>

        <Card>
          <Text>Conversion Rate</Text>
          <Metric>{data.conversionRate.toFixed(2)}%</Metric>
          <Flex className="mt-4">
            <Text className="truncate">Checkout sessions</Text>
          </Flex>
          <ProgressBar value={data.conversionRate} className="mt-2" />
        </Card>

        <Card>
          <Text>Avg Order Value</Text>
          <Metric>
            ${data.orderCount > 0 ? ((data.totalRevenueCents / data.orderCount) / 100).toFixed(2) : '0.00'}
          </Metric>
          <Flex className="mt-4">
            <Text className="truncate">Per order</Text>
          </Flex>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <Text className="text-lg font-semibold mb-4">Revenue by Day (Last 7 Days)</Text>
          <BarChart
            data={data.revenueByDay}
            index="date"
            categories={['revenue']}
            colors={['orange']}
            valueFormatter={(value) => `$${value.toFixed(2)}`}
            yAxisWidth={60}
            showLegend={false}
          />
        </Card>

        <Card>
          <Text className="text-lg font-semibold mb-4">Top Products</Text>
          <div className="space-y-3">
            {data.topSkus.slice(0, 5).map((item, index) => (
              <div key={item.sku} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.sku}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">
                    ${(item.revenueCents / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">{item.quantity} sold</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
