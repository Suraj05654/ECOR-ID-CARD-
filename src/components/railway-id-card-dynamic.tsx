'use client';

import { Button } from "@/components/ui/button";
import { Printer, RotateCcw } from "lucide-react";
import { useState } from "react";
// Date formatting utility
const formatDate = (dateString: string, formatType: string = 'dd/MM/yyyy') => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  if (formatType === 'dd-MM-yyyy') {
    return `${day}-${month}-${year}`;
  } else if (formatType === 'dd-MM-yy') {
    return `${day}-${month}-${year.toString().slice(-2)}`;
  }
  return `${day}/${month}/${year}`;
};

interface FamilyMember {
  name: string;
  relation: string;
  dob: string;
  bloodGroup: string;
}

export interface RailwayIdCardProps {
  // Employee Details
  name: string;
  designation: string;
  pfNumber: string;
  ruidNo?: string; // Optional RUID number for gazetted officers
  station: string;
  dateOfBirth: string;
  bloodGroup: string;
  contactNumber: string;
  address: string;
  
  // Family Details
  familyMembers: FamilyMember[];
  
  // Images
  photoUrl: string;
  signatureUrl: string;
  
  // Card Design
  cardNumber?: string;
  issueDate?: string;
  validUntil?: string;
  
  // Back Side Content
  emergencyContact: string;
  emergencyPhone: string;
  medicalInfo: string;
  termsAndConditions?: string[];
  qrUrl?: string; // Optional QR code URL
}

export function RailwayIdCardDynamic({
  name,
  designation,
  pfNumber,
  ruidNo,
  station,
  dateOfBirth,
  bloodGroup,
  contactNumber,
  address,
  familyMembers,
  photoUrl,
  signatureUrl,
  cardNumber = "4131413132",
  issueDate = "01/01/2023",
  validUntil = "31/12/2028",
  emergencyContact,
  emergencyPhone,
  medicalInfo,
  termsAndConditions = [
    "This card is the property of Indian Railways",
    "Must be carried at all times while on duty",
    "Report loss immediately to HR department",
    "Not transferable"
  ],
  qrUrl
}: RailwayIdCardProps) {
  const [showBack, setShowBack] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    const prev = showBack;
    setShowBack(false); // ensure front side
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
      setShowBack(prev);
    }, 100);
  };

  const toggleCardSide = () => {
    setShowBack(!showBack);
  };

  // Display RUID No if provided, otherwise show PF Number
  const idNumber = ruidNo || pfNumber;

  // Front of the card
  const FrontCard = () => (
    <div className="card-side">
      <div className="w-full max-w-[600px] mx-auto bg-white border-2 border-gray-400 rounded-lg overflow-hidden">
        {/* Header with Logo */}
        <div className="bg-white border-b-2 border-gray-400 p-3">
          <div className="flex items-center justify-between">
            <div className="w-14 h-14 flex-shrink-0">
              <img src="/ecor.png" alt="East Coast Railway Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 text-center px-2">
              <div className="text-2xl font-bold">पूर्व तट रेलवे</div>
              <div className="text-2xl font-extrabold tracking-wide uppercase">East Coast Railway</div>
            </div>
            <div className="w-14"></div>
          </div>
        </div>

        {/* Department Info Bar */}
        <div className="bg-[#00A5B4] text-white text-sm font-semibold grid grid-cols-4">
          <div className="py-1 text-center border-r border-white/20">विभाग</div>
          <div className="py-1 text-center border-r border-white/20">DEPARTMENT</div>
          <div className="py-1 text-center border-r border-white/20">व्यावसायिक</div>
          <div className="py-1 text-center">COMMERCIAL</div>
        </div>

        {/* Identity Card Header */}
        <div className="bg-[#004B85] text-white text-sm font-semibold grid grid-cols-4">
          <div className="py-1 text-center border-r border-white/20">पहचान पत्र</div>
          <div className="py-1 text-center border-r border-white/20">IDENTITY CARD</div>
          <div className="py-1 text-center border-r border-white/20">प्र.का</div>
          <div className="py-1 text-center">H.Q. SI.No. COMMERCIAL-</div>
        </div>

        {/* Card Content */}
        <div className="px-6 py-3">
          <div className="flex gap-6">
            {/* Photo Section */}
            <div className="w-28">
              <div className="border-2 border-gray-400 p-1 h-32 flex items-center justify-center bg-blue-50">
                {photoUrl ? (
                  <img src={photoUrl} alt={name} className="h-full w-full object-cover object-center" style={{ aspectRatio: '3/4' }} />
                ) : (
                  <div className="text-center">
                    <div className="text-blue-600 text-xs mb-1">👥</div>
                    <div className="text-blue-600 text-xs">PHOTO</div>
                  </div>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="flex-1 space-y-2 text-sm">
              <div className="flex items-center">
                <span className="w-24 font-semibold whitespace-nowrap text-gray-700">नाम</span>
                <span className="w-24 font-semibold whitespace-nowrap text-gray-700">Name</span>
                <span className="flex-1 font-medium">: {name.toUpperCase()}</span>
              </div>
              <div className="flex items-center">
                <span className="w-24 font-semibold whitespace-nowrap text-gray-700">पद नाम</span>
                <span className="w-24 font-semibold whitespace-nowrap text-gray-700">Desig</span>
                <span className="flex-1 font-medium">: {designation}</span>
              </div>
              <div className="flex items-center">
                <span className="w-24 font-semibold whitespace-nowrap text-gray-700">पी.एफ.नं</span>
                <span className="w-24 font-semibold whitespace-nowrap text-gray-700">P.F.No.</span>
                <span className="flex-1 font-medium">: {idNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <span className="w-24 font-semibold whitespace-nowrap text-gray-700">स्टेशन</span>
                <span className="w-24 font-semibold whitespace-nowrap text-gray-700">Station</span>
                <span className="flex-1 font-medium">: {station}</span>
              </div>
              <div className="flex items-center">
                <span className="w-24 font-semibold whitespace-nowrap text-gray-700">जन्म तारीख</span>
                <span className="w-24 font-semibold whitespace-nowrap text-gray-700">D.O.B</span>
                <span className="flex-1 font-medium">: {formatDate(dateOfBirth, 'dd-MM-yyyy')}</span>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="flex justify-between mt-6 px-2">
            <div className="text-center">
              <div className="h-8 w-28 mb-1">
                {signatureUrl && (
                  <img src={signatureUrl} alt="Card Holder Signature" className="h-full w-full object-contain" />
                )}
              </div>
              <div className="text-xs font-medium">
                <div className="text-gray-700">कार्डधारी का हस्ताक्षर</div>
                <div>Signature of Card Holder</div>
              </div>
            </div>
            <div className="text-center">
              <div className="h-8 w-28 mb-1">
                <img src="/authority sign.jpg" alt="Authority Signature" className="h-full w-full object-contain" />
              </div>
              <div className="text-xs font-medium">
                <div className="text-gray-700">जारीकर्ता प्राधिकारी का हस्ताक्षर</div>
                <div>Signature of Issuing Authority</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Back of the card
  const BackCard = () => (
    <div className="card-side mt-8">
      <div className="w-full max-w-[600px] mx-auto bg-white border-2 border-gray-400 rounded-lg overflow-hidden">
        <div className="p-4">
          <h3 className="text-base font-semibold mb-3 text-center">परिवार का विवरण/Details of the family</h3>
          
          {familyMembers && familyMembers.length > 0 ? (
            <table className="w-full mb-3">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-1 text-left text-sm font-semibold">Name</th>
                  <th className="py-1 text-left text-sm font-semibold">Relation</th>
                  <th className="py-1 text-left text-sm font-semibold">DOB</th>
                  <th className="py-1 text-left text-sm font-semibold">Blood Group</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {familyMembers.map((member, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-1">{member.name}</td>
                    <td className="py-1">{member.relation}</td>
                    <td className="py-1">{formatDate(member.dob)}</td>
                    <td className="py-1">{member.bloodGroup}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-500 mb-3 text-center">No family member details provided</p>
          )}

          <div className="space-y-1.5 mb-3 text-sm">
            <p><span className="font-semibold">Emergency Contact:</span> {emergencyContact} ({emergencyPhone})</p>
            <p><span className="font-semibold">Res. Address:</span> {address}</p>
            <p><span className="font-semibold">Blood Group:</span> {bloodGroup}</p>
          </div>

          <div className="mb-3">
            <h4 className="text-sm font-semibold mb-1">Terms & Conditions</h4>
            <ul className="list-disc list-inside space-y-0.5">
              {termsAndConditions.map((term, index) => (
                <li key={index} className="text-xs">{term}</li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between items-end">
            <div className="text-xs">
              <p className="text-gray-700">यदि यह कार्ड मिले तो कृपया निकटतम पोस्ट बॉक्स में डाल दें ।</p>
              <p>If found please drop it in the nearest Post Box</p>
            </div>
            {qrUrl && (
              <div className="w-20 h-20">
                <img src={qrUrl} alt="QR Code" className="w-full h-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Print-only layout */}
      <div id="railway-id-card-print" className="hidden print:block mt-0">
        <div className="print-card mt-0">
          <FrontCard />
        </div>
        <div className="print-card mt-4">
          <BackCard />
        </div>
      </div>

      {/* Interactive view */}
      <div className="flex flex-col items-center p-6 print:p-0">
        <div
          id="railway-id-card"
          className="relative w-full max-w-2xl h-[500px] perspective-1000 print:hidden mt-0"
        >
          <div
            className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${showBack ? 'rotate-y-180' : ''}`}
          >
            <div className="absolute w-full h-full backface-hidden">
              <FrontCard />
            </div>
            <div className="absolute w-full h-full backface-hidden rotate-y-180">
              <BackCard />
            </div>
          </div>
        </div>

        {/* Controls */}
        {!isPrinting && (
          <div className="mt-6 flex gap-4 print:hidden">
            <Button onClick={toggleCardSide} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              {showBack ? 'Show Front' : 'Show Back'}
            </Button>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print ID Card
            </Button>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 0.5cm;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .print-card {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin-bottom: 1cm !important;
            }

    
            /* Force backgrounds and colors */
            .bg-\\[\\#00A5B4\\] {
              background-color: #00A5B4 !important;
              color: white !important;
            }

            .bg-\\[\\#004B85\\] {
              background-color: #004B85 !important;
              color: white !important;
            }
          }

          /* 3D flip styles */
          .perspective-1000 {
            perspective: 1000px;
          }
          
          .transform-style-preserve-3d {
            transform-style: preserve-3d;
          }
          
          .backface-hidden {
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }

          .rotate-y-180 {
            transform: rotateY(180deg);
          }
        `
      }} />
    </>
  );
}