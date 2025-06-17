import { getApplicationById, updateApplicationStatus } from '@/lib/actions/application';
import type { StoredEmployee } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, FileText, Mail, Phone, User, Users, Home, CalendarDays, Briefcase, ShieldCheck, XCircle, Edit3, Info } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import type { Application } from '@/lib/new_admin_backend/types';

export async function generateStaticParams() {
  return [] as Array<{ id: string }>;
}

// @ts-expect-error -- directory name with parentheses confuses TS path mapping
import ApplicationActions from '../../../(components)/application-actions';
import type { StoredApplication } from '@/lib/types';

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string | number | null | React.ReactNode;
  className?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value, className }) => (
  <div className={`flex items-start space-x-3 py-2 ${className}`}>
    <span className="text-primary mt-1">{icon}</span>
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {typeof value === 'string' || typeof value === 'number' ? (
        <p className="text-md font-semibold text-foreground">{value || 'N/A'}</p>
      ) : (
        value || <p className="text-md font-semibold text-foreground">N/A</p>
      )}
    </div>
  </div>
);


type AppPageProps = {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function ApplicationDetailPage({ params }: AppPageProps) {
  const employeeData = await getApplicationById(params.id);

  if (!employeeData) {
    return (
      <div className="container mx-auto text-center py-12">
        <FileText className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Application Not Found</h1>
        <p className="text-muted-foreground">The application with ID {params.id} could not be found.</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  // Transform StoredEmployee to Application type
  const application: Application = {
    id: params.id,
    name: employeeData.employeeName || '',
    designation: employeeData.designation || '',
    dateOfBirth: employeeData.dateOfBirth?.toString() || '',
    station: employeeData.station || '',
    department: employeeData.department || '',
    pfNumber: employeeData.employeeNo || '',
    mobile: employeeData.mobileNumber || employeeData.rlyContactNumber || '',
    status: (employeeData.status?.toLowerCase() === 'approved' ? 'approved' : 
            employeeData.status?.toLowerCase() === 'rejected' ? 'rejected' : 'pending') as 'pending' | 'approved' | 'rejected',
    rejectionRemarks: employeeData.remark,
  };
  
  const getStatusBadge = (status: StoredApplication['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1"><CheckCircle className="mr-1.5 h-4 w-4"/>Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1"><Info className="mr-1.5 h-4 w-4"/>Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-sm px-3 py-1"><XCircle className="mr-1.5 h-4 w-4"/>Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-sm px-3 py-1">Unknown</Badge>;
    }
  };

  const documentUrl = (url?: string) => url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
      View Document <FileText className="ml-1 h-4 w-4"/>
    </a>
  ) : "Not Provided";


  return (
    <div className="container mx-auto max-w-5xl">
      <Button asChild variant="outline" size="sm" className="mb-6 group">
        <Link href="/admin/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>
      </Button>

      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle className="font-headline text-3xl text-primary">Application Details</CardTitle>
              <CardDescription className="text-md">
                Application ID: <span className="font-semibold text-foreground">{application.id}</span>
              </CardDescription>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              {getStatusBadge(application.status)}
              <p className="text-xs text-muted-foreground">
                Submitted: {employeeData.applicationDate ? format(new Date(employeeData.applicationDate), 'dd MMM yyyy, p') : '-'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3">
            {/* Column 1: Personal & Contact */}
            <div className="p-6 border-b md:border-b-0 md:border-r">
              <h3 className="text-lg font-semibold text-primary mb-3 border-b pb-2">Personal Information</h3>
              <DetailItem icon={<User size={18} />} label="Full Name" value={application.name} />
              <DetailItem icon={<Briefcase size={18} />} label="Employee ID" value={application.pfNumber} />
              <DetailItem icon={<CalendarDays size={18} />} label="Date of Birth" value={application.dateOfBirth ? format(new Date(application.dateOfBirth), 'PPP') : '-'} />
              <DetailItem icon={<ShieldCheck size={18} />} label="Applicant Type" value={<span className="capitalize">{employeeData.applicantType}</span>} />
              <DetailItem icon={<Briefcase size={18} />} label="Department" value={application.department} />
              {application.designation && <DetailItem icon={<Briefcase size={18} />} label="Designation" value={application.designation} />}
            </div>

             {/* Column 2: Contact & Address */}
            <div className="p-6 border-b md:border-b-0 lg:border-r">
              <h3 className="text-lg font-semibold text-primary mb-3 border-b pb-2">Contact & Address</h3>
              <DetailItem icon={<Phone size={18} />} label="Contact Number" value={application.mobile} />
              <DetailItem icon={<Mail size={18} />} label="Email Address" value={employeeData.email || 'N/A'} />
              <DetailItem icon={<Home size={18} />} label="Present Address" value={employeeData.residentialAddress} />
              <DetailItem icon={<Home size={18} />} label="Permanent Address" value={employeeData.residentialAddress} />
            </div>

            {/* Column 3: Documents & Family */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-primary mb-3 border-b pb-2">Documents</h3>
                <div className="grid grid-cols-2 gap-x-4">
                  <DetailItem icon={<FileText size={18} />} label="Photo" value={documentUrl(employeeData.photoUrl)} />
                  <DetailItem icon={<FileText size={18} />} label="Signature" value={documentUrl(employeeData.signatureUrl)} />
                  {employeeData.hindiNameUrl && (
                    <DetailItem icon={<FileText size={18} />} label="Hindi Name" value={documentUrl(employeeData.hindiNameUrl)} />
                  )}
                  {employeeData.hindiDesignationUrl && (
                    <DetailItem icon={<FileText size={18} />} label="Hindi Designation" value={documentUrl(employeeData.hindiDesignationUrl)} />
                  )}
                </div>
              {employeeData.familyMembersJson && (
                <>
                  <h3 className="text-lg font-semibold text-primary mt-6 mb-3 border-b pb-2">Family Members</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {JSON.parse(employeeData.familyMembersJson).map((member: { name: string; relationship: string; dob: string }, index: number) => (
                      <Card key={index} className="bg-muted/30 p-3 text-sm">
                        <p><strong>{member.name}</strong> ({member.relationship})</p>
                        <p>DOB: {format(new Date(member.dob || ''), 'PPP')}</p>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

           {/* Placeholder for Photo */}
          <div className="p-6 border-t">
            <h3 className="text-lg font-semibold text-primary mb-3 border-b pb-2">Applicant Photo</h3>
             <Image 
                src={employeeData.photoUrl || "https://placehold.co/150x200.png"} 
                alt={`${application.name}'s photo`} 
                width={150} 
                height={200} 
                className="rounded-md shadow-md object-cover"
                data-ai-hint="employee portrait"
             />
          </div>

        </CardContent>
        <CardFooter className="bg-muted/30 border-t p-6">
          <ApplicationActions 
            applicationId={application.id}
            currentStatus={application.status}
            application={application}
          />
        </CardFooter>
      </Card>
    </div>
  );
}
