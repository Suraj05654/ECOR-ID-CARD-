'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { updateApplicationStatus } from '@/lib/actions/application';
import type { ApplicationStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Application } from "@/lib/new_admin_backend/types";

interface ApplicationActionsProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
  application: Application;
}

export default function ApplicationActions({ applicationId, currentStatus, application }: ApplicationActionsProps) {
  const [isLoading, setIsLoading] = useState<'approved' | 'rejected' | null>(null);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [rejectionRemarks, setRejectionRemarks] = useState("");
  const { toast } = useToast();

  const handleAction = async (newStatus: 'approved' | 'rejected') => {
    setIsLoading(newStatus);
    try {
      if (newStatus === 'rejected' && !rejectionRemarks) {
        setIsRejectionDialogOpen(true);
        return;
      }

      const result = await updateApplicationStatus(applicationId, newStatus, rejectionRemarks);
      if (result.success) {
        toast({
          title: `Application ${newStatus}`,
          description: result.message,
        });
      } else {
        toast({
          title: `Failed to ${newStatus === 'approved' ? 'Approve' : 'Reject'}`,
          description: result.message || 'An unknown error occurred.',
          variant: 'destructive',
        });
      }
      
      // Close dialog if open
      setIsRejectionDialogOpen(false);
      setRejectionRemarks("");
      
      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: "Error",
        description: "Failed to update application status. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(null);
  };

  if (currentStatus === 'approved' || currentStatus === 'rejected') {
    return (
      <div className="flex items-center space-x-2">
        {currentStatus === 'approved' && <CheckCircle className="h-5 w-5 text-green-600" />}
        {currentStatus === 'rejected' && <XCircle className="h-5 w-5 text-red-600" />}
        <p className="text-sm font-medium text-muted-foreground">
          This application has already been <span className={`font-semibold ${currentStatus === 'approved' ? 'text-green-600' : 'text-red-600'}`}>{currentStatus}</span>.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex space-x-4 w-full justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white group"
              disabled={!!isLoading}
            >
              {isLoading === 'rejected' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              )}
              Reject
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center"><AlertTriangle className="mr-2 text-red-500"/>Confirm Rejection</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reject this application? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={!!isLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => handleAction('rejected')} 
                disabled={!!isLoading}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
              >
                {isLoading === 'rejected' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirm Reject'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
             <Button 
              variant="default" 
              className="bg-green-600 hover:bg-green-700 group"
              disabled={!!isLoading}
             >
              {isLoading === 'approved' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              )}
              Approve
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center"><CheckCircle className="mr-2 text-green-500"/>Confirm Approval</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to approve this application? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={!!isLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => handleAction('approved')} 
                disabled={!!isLoading}
                className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
              >
                {isLoading === 'approved' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirm Approve'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejection Remarks</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application. This will be visible to the applicant.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection remarks..."
              value={rejectionRemarks}
              onChange={(e) => setRejectionRemarks(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleAction('rejected')}
              disabled={!rejectionRemarks.trim()}
            >
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
