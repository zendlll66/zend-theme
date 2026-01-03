import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-2">Revenue</h3>
            <p className="text-2xl font-bold">$12,345</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-2">Users</h3>
            <p className="text-2xl font-bold">1,234</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-2">Orders</h3>
            <p className="text-2xl font-bold">567</p>
          </div>
        </Card>
      </div>
      
      <div className="mt-6">
        <Button>View Reports</Button>
      </div>
    </div>
  )
}

