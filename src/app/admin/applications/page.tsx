'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RailwayIdCardDynamic } from '@/components/railway-id-card-dynamic';
import { format } from 'date-fns';
import { Check, X, StickyNote, Eye, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { updateApplicationStatus } from '@/lib/actions/application';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from "@/components/ui/label";

interface FamilyMemberApi {
  name: string;
  relationship: string;
  dob: string;
  bloodGroup: string;
}

interface ApplicationApi {
  id: string;
  empNo: string;
  empName: string;
  designation: string;
  dob: string;
  department: string;
  station: string;
  mobileNumber: string;
  emergencyName: string;
  emergencyPhone: string;
  applicationDate: string;
  photoUrl: string;
  signatureUrl: string;
  qrUrl: string;
  status: string;
  remark?: string;
  familyMembers: FamilyMemberApi[];
  hindiNameUrl?: string;
  hindiDesignationUrl?: string;
  ruidNo?: string;
}

function StatusBadge({ status }: { status: string }) {
  const variant = status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary';
  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  );
}

export default function ApplicationsPage() {
  const [rows, setRows] = useState<ApplicationApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ApplicationApi | null>(null);
  const [action, setAction] = useState<{
    type: 'accept' | 'reject';
    rec: ApplicationApi;
  } | null>(null);
  const [remark, setRemark] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('pending');

  const params = useSearchParams();
  const type = params?.get('type');
  const title = type === 'ng' ? 'Non-Gazetted Applications' : 'Gazetted Applications';

  const fetchRows = async () => {
    try {
      setLoading(true);
      const applicantType = type === 'ng' ? 'non-gazetted' : type === 'gaz' ? 'gazetted' : '';
      const qs = new URLSearchParams();
      if (applicantType) qs.set('applicantType', applicantType);
      if (selectedStatus !== 'all') qs.set('status', selectedStatus);
      const res = await fetch(`/api/employees?${qs.toString()}`);
      if (!res.ok) throw new Error('Failed');
      const { employees } = await res.json();

      const mapped: ApplicationApi[] = employees.map((e: any) => ({
        id: e.id || e.$id,
        empNo: e.employeeNo || e.empNo,
        ruidNo: e.ruidNo,
        empName: e.employeeName || e.empName,
        designation: e.designation,
        dob: e.dateOfBirth || e.dob,
        department: e.department,
        station: e.station,
        mobileNumber: e.mobileNumber,
        emergencyName: e.emergencyContactName,
        emergencyPhone: e.emergencyContactNumber,
        applicationDate: (e.applicationDate || e.$createdAt).split('T')[0],
        photoUrl: e.photoUrl || (e.photoFileId ? `/api/file/${e.photoFileId}` : ''),
        signatureUrl: e.signatureUrl || (e.signatureFileId ? `/api/file/${e.signatureFileId}` : ''),
        hindiNameUrl: e.hindiNameUrl || (e.hindiNameFileId ? `/api/file/${e.hindiNameFileId}` : ''),
        hindiDesignationUrl: e.hindiDesignationUrl || (e.hindiDesignationFileId ? `/api/file/${e.hindiDesignationFileId}` : ''),
        qrUrl: e.qrFileId ? `/api/file/${e.qrFileId}` : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({
          name: e.employeeName || e.empName,
          pfNumber: e.ruidNo || e.employeeNo || e.empNo,
          designation: e.designation,
          dateOfBirth: e.dateOfBirth || e.dob,
          station: e.station,
          department: e.department
        }))}`,
        status: (e.status || 'Pending').toLowerCase(),
        remark: e.remark,
        familyMembers: e.familyMembersJson ? JSON.parse(e.familyMembersJson) : []
      }));

      setRows(mapped);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, [type, selectedStatus]);

  const updateStatus = async (rec: ApplicationApi, type: 'accept' | 'reject') => {
    try {
      if (type === 'reject' && !remark.trim()) {
        toast.error('Please provide rejection remarks');
        return;
      }

      console.log(`[UPDATE_STATUS] Starting update for application:`, {
        id: rec.id,
        type,
        currentStatus: rec.status,
        name: rec.empName
      });

      const result = await updateApplicationStatus(
        rec.id,
        type === 'accept' ? 'approved' : 'rejected',
        type === 'reject' ? remark : undefined
      );
      
      console.log(`[UPDATE_STATUS] Update result:`, result);

      if (!result.success) {
        console.error(`[UPDATE_STATUS] Failed:`, result.message);
        toast.error(result.message || 'Failed to update status');
        return;
      }

      toast.success(`${type === 'accept' ? 'Accepted' : 'Rejected'} ${rec.empName}`);
      setAction(null);
      setRemark('');
      await fetchRows();
      console.log(`[UPDATE_STATUS] Successfully completed update and refreshed data`);
    } catch (e: any) {
      console.error('[UPDATE_STATUS] Error:', e);
      toast.error(e.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchRows} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedStatus === 'all' ? 'All' : selectedStatus === 'pending' ? 'Pending' : selectedStatus === 'approved' ? 'Approved' : 'Rejected'} Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sl No</TableHead>
                  <TableHead>QR</TableHead>
                  <TableHead>Photo</TableHead>
                  <TableHead>Sign</TableHead>
                  {type === 'gaz' && (
                    <>
                      <TableHead>Hindi Name</TableHead>
                      <TableHead>Hindi Desig</TableHead>
                    </>
                  )}
                  <TableHead>{type === 'gaz' ? 'RUID No' : 'Employee No'}</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={`${r.id || ''}-${i}`}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      {r.qrUrl && (
                        <div className="w-16 h-16 border border-gray-200 rounded-lg flex items-center justify-center bg-white">
                          <img src={r.qrUrl} alt="QR" className="w-full h-full object-contain p-1" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.photoUrl && (
                        <img src={r.photoUrl} alt="Photo" className="w-14 h-14 object-cover rounded-sm" />
                      )}
                    </TableCell>
                    <TableCell>
                      {r.signatureUrl && (
                        <img src={r.signatureUrl} alt="Signature" className="w-14 h-14 object-contain" />
                      )}
                    </TableCell>
                    {type === 'gaz' && (
                      <>
                        <TableCell>
                          {r.hindiNameUrl && (
                            <img src={r.hindiNameUrl} alt="Hindi Name" className="w-14 h-14 object-contain" />
                          )}
                        </TableCell>
                        <TableCell>
                          {r.hindiDesignationUrl && (
                            <img src={r.hindiDesignationUrl} alt="Hindi Designation" className="w-14 h-14 object-contain" />
                          )}
                        </TableCell>
                      </>
                    )}
                    <TableCell>{type === 'gaz' ? r.ruidNo : r.empNo}</TableCell>
                    <TableCell className="max-w-[120px] truncate">{r.empName}</TableCell>
                    <TableCell>{r.designation}</TableCell>
                    <TableCell>{format(new Date(r.dob), 'dd-MM-yyyy')}</TableCell>
                    <TableCell>{r.department}</TableCell>
                    <TableCell>{r.station}</TableCell>
                    <TableCell>{r.mobileNumber}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="h-8 w-8" 
                          onClick={() => setAction({ type: 'accept', rec: r })}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="destructive" 
                          className="h-8 w-8" 
                          onClick={() => setAction({ type: 'reject', rec: r })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="h-8 w-8" 
                          onClick={() => setPreview(r)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={action?.type === 'reject'} onOpenChange={(open) => {
        if (!open) {
          setAction(null);
          setRemark('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide remarks explaining why this application is being rejected.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="remark" className="text-sm font-medium">
              Rejection Remarks <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="remark"
              placeholder="Enter rejection remarks..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="min-h-[100px] mt-2"
            />
            {!remark.trim() && (
              <p className="text-sm text-muted-foreground mt-2">
                Remarks are required to reject an application
              </p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
              setAction(null);
              setRemark('');
            }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (action?.rec) {
                  updateStatus(action.rec, 'reject');
                }
              }}
              disabled={!remark.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>ID Card Preview</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 pt-2 pb-6">
            {preview && (
              <RailwayIdCardDynamic
                name={preview.empName}
                designation={preview.designation}
                pfNumber={preview.empNo}
                station={preview.station}
                dateOfBirth={preview.dob}
                bloodGroup={preview.familyMembers[0]?.bloodGroup || 'N/A'}
                contactNumber={preview.mobileNumber || 'N/A'}
                address={preview.station}
                emergencyContact={preview.familyMembers.find(f => f.relationship?.toLowerCase() !== 'self')?.name || preview.empName}
                emergencyPhone={preview.mobileNumber || ''}
                medicalInfo={`Blood Group: ${preview.familyMembers[0]?.bloodGroup || 'N/A'}`}
                photoUrl={preview.photoUrl}
                signatureUrl={preview.signatureUrl}
                familyMembers={preview.familyMembers.map((fm) => ({
                  name: fm.name,
                  relation: fm.relationship,
                  dob: fm.dob,
                  bloodGroup: fm.bloodGroup
                }))}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Accept Dialog */}
      <Dialog open={action?.type === 'accept'} onOpenChange={(open) => !open && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to accept this application? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAction(null)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => {
                if (action?.rec) {
                  updateStatus(action.rec, 'accept');
                }
              }}
            >
              Confirm Acceptance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

