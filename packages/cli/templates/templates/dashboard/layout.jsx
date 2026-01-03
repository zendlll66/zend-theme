export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="px-6 py-4">
          <h2 className="text-lg font-semibold">Dashboard</h2>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}

