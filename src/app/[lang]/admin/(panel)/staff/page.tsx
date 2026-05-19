import StaffTable from '@/components/admin/StaffTable'

export default function AdminStaffPage() {
  return (
    <div>
      <h1 className="apple-headline text-2xl text-text">Staff</h1>
      <p className="mt-2 text-sm text-text-secondary">Manage staff accounts and permissions</p>
      <div className="mt-6">
        <StaffTable />
      </div>
    </div>
  )
}
