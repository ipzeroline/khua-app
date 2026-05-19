import OrderTable from '@/components/admin/OrderTable'

export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="apple-headline text-2xl text-text">Orders</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Update order status, tracking, and award loyalty points on completed orders.
      </p>
      <div className="mt-6">
        <OrderTable />
      </div>
    </div>
  )
}
