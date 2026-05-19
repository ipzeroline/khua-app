import MemberTable from '@/components/admin/MemberTable'

export default function AdminMembersPage() {
  return (
    <div>
      <h1 className="apple-headline text-2xl text-text">Members</h1>
      <p className="mt-2 text-sm text-text-secondary">Manage registered members</p>
      <div className="mt-6">
        <MemberTable />
      </div>
    </div>
  )
}
