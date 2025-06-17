'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getEmployeesService, updateEmployee } from '@/lib/new_admin_backend/services';
import { updateApplicationStatus } from '@/lib/actions/application';
import { Loader2, RefreshCw, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface EmployeeDoc {
  id: string;
  employeeName?: string;
  applicantType?: string;
  status?: string;
  applicationDate?: string;
}

export default function DashboardPage() {
  const [employees, setEmployees] = useState<EmployeeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEmployees = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const { employees } = await getEmployeesService({}, 0, 500);
      setEmployees(
        employees.map((e: any) => ({
          id: e.id ?? e.$id,
          employeeName: e.employeeName ?? e.empName ?? e.name ?? 'Unknown',
          applicantType: e.applicantType ?? 'non-gazetted',
          status: (e.status ?? 'Pending').toLowerCase(),
          applicationDate: e.applicationDate ?? e.createdAt ?? e.$createdAt,
        }))
      );
    } catch (err: any) {
      toast.error('Failed to load applications');
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(false);
  }, []);

  const handleStatus = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      await updateApplicationStatus(id, newStatus.toLowerCase() as 'approved' | 'rejected');
      toast.success(`Application ${newStatus.toLowerCase()}`);
      fetchEmployees(true);
    } catch (e: any) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>
    );
  }

  const total = employees.length;
  const pending = employees.filter(e => e.status === 'pending').length;
  const approved = employees.filter(e => e.status === 'approved').length;
  const rejected = employees.filter(e => e.status === 'rejected').length;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Card className="flex-1"><CardHeader><CardTitle>Total</CardTitle></CardHeader><CardContent>{total}</CardContent></Card>
        <Card className="flex-1"><CardHeader><CardTitle>Pending</CardTitle></CardHeader><CardContent>{pending}</CardContent></Card>
        <Card className="flex-1"><CardHeader><CardTitle>Approved</CardTitle></CardHeader><CardContent>{approved}</CardContent></Card>
        <Card className="flex-1"><CardHeader><CardTitle>Rejected</CardTitle></CardHeader><CardContent>{rejected}</CardContent></Card>
        <Button variant="outline" size="sm" onClick={() => fetchEmployees(true)} disabled={refreshing} className="self-start">
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border text-sm">
          <thead>
            <tr className="bg-muted text-left">
              <th className="p-2">ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Type</th>
              <th className="p-2">Date</th>
              <th className="p-2">Status</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id} className="border-t">
                <td className="p-2 whitespace-nowrap">{emp.id ? emp.id.slice(-6) : '-'}</td>
                <td className="p-2 whitespace-nowrap">{emp.employeeName}</td>
                <td className="p-2 whitespace-nowrap">{emp.applicantType}</td>
                <td className="p-2 whitespace-nowrap">{emp.applicationDate?.split('T')[0]}</td>
                <td className="p-2 capitalize">{emp.status}</td>
                <td className="p-2 space-x-1">
                  <Button variant="ghost" size="icon" disabled={emp.status==='approved'} onClick={() => handleStatus(emp.id,'Approved')}><Check className="h-4 w-4 text-green-600" /></Button>
                  <Button variant="ghost" size="icon" disabled={emp.status==='rejected'} onClick={() => handleStatus(emp.id,'Rejected')}><X className="h-4 w-4 text-red-600" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
