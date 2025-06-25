import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import type { User, Group, UserRole, UserStatus, BulkUploadResult } from '~/types/admin';
import { useStore } from '~/store/store';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkUpload: (users: Omit<User, 'id' | 'groupName' | 'balance' | 'createdAt'>[]) => BulkUploadResult; // Simulates backend processing
}

// --- Icons ---
function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
  );
}
function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
  );
}
function AlertCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
  );
}
function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
  );
}


// Expected columns in the template/upload
const expectedColumns = ["FullName", "Email", "GroupName", "Role", "Status"];
const validRoles: UserRole[] = ["Super Admin", "Admin", "User"];
const validStatuses: UserStatus[] = ["Active", "Suspended"];

export function BulkUploadModal({ isOpen, onClose, onBulkUpload }: BulkUploadModalProps) {
  const { groups } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [processingError, setProcessingError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setUploadResult(null); // Reset previous results
        setProcessingError(null);
      } else {
        alert('Please upload a valid .xlsx file.');
        event.target.value = ''; // Clear the input
      }
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([expectedColumns]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users Template");
    XLSX.writeFile(wb, "LifeEconomy_User_Template.xlsx");
  };

  const processUpload = useCallback(async () => {
    if (!file) return;

    setIsProcessing(true);
    setUploadResult(null);
    setProcessingError(null);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) throw new Error("Failed to read file data.");

          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 }); // Read as array of arrays

          if (!jsonData || jsonData.length < 2) { // Header + at least one data row
             throw new Error("File is empty or contains only headers.");
          }

          const headers = jsonData[0] as string[];
          const missingHeaders = expectedColumns.filter(h => !headers.includes(h));
          if (missingHeaders.length > 0) {
            throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
          }

          const usersToUpload: Omit<User, 'id' | 'groupName' | 'balance' | 'createdAt'>[] = [];
          const errors: { row: number; message: string }[] = [];
          const groupMap = new Map(groups.map(g => [g.name.toLowerCase(), g.id])); // For quick lookup

          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            const rowData: { [key: string]: any } = {};
            headers.forEach((header, index) => {
              rowData[header] = row[index];
            });

            const rowNum = i + 1; // User-friendly row number (1-based index including header)
            const fullName = rowData.FullName?.trim();
            const email = rowData.Email?.trim();
            const groupName = rowData.GroupName?.trim();
            const role = rowData.Role?.trim() as UserRole;
            const status = rowData.Status?.trim() as UserStatus;

            // --- Validation ---
            let rowHasError = false;
            if (!fullName) { errors.push({ row: rowNum, message: "FullName is required." }); rowHasError = true; }
            if (!email) { errors.push({ row: rowNum, message: "Email is required." }); rowHasError = true; }
            else if (!/\S+@\S+\.\S+/.test(email)) { errors.push({ row: rowNum, message: "Email format is invalid." }); rowHasError = true; }
            // Add email uniqueness check against existing users if needed here
            if (!groupName) { errors.push({ row: rowNum, message: "GroupName is required." }); rowHasError = true; }
            const groupId = groupMap.get(groupName?.toLowerCase());
            if (groupName && !groupId) { errors.push({ row: rowNum, message: `Group '${groupName}' not found.` }); rowHasError = true; }
            if (!role) { errors.push({ row: rowNum, message: "Role is required." }); rowHasError = true; }
            else if (!validRoles.includes(role)) { errors.push({ row: rowNum, message: `Invalid Role '${role}'. Valid roles: ${validRoles.join(', ')}` }); rowHasError = true; }
            if (!status) { errors.push({ row: rowNum, message: "Status is required." }); rowHasError = true; }
            else if (!validStatuses.includes(status)) { errors.push({ row: rowNum, message: `Invalid Status '${status}'. Valid statuses: ${validStatuses.join(', ')}` }); rowHasError = true; }
            // --- End Validation ---

            if (!rowHasError && groupId) {
              usersToUpload.push({ fullName, email, groupId, role, status });
            }
          }

          if (errors.length > 0) {
             // Only show validation errors, don't proceed with upload yet
             setUploadResult({ successCount: 0, errors });
          } else if (usersToUpload.length > 0) {
            // Simulate backend processing
            const result = onBulkUpload(usersToUpload);
            setUploadResult(result);
          } else {
             // No valid users found, but no specific errors (e.g., empty data rows)
             setProcessingError("No valid user data found in the file to upload.");
          }

        } catch (err: any) {
          console.error("Error processing XLSX file:", err);
          setProcessingError(`Error processing file: ${err.message || 'Unknown error'}`);
          setUploadResult(null); // Clear any partial results
        } finally {
          setIsProcessing(false);
        }
      };
      reader.onerror = (err) => {
        console.error("FileReader error:", err);
        setProcessingError("Error reading the file.");
        setIsProcessing(false);
      };
      reader.readAsArrayBuffer(file);

    } catch (error: any) {
      console.error("Upload error:", error);
      setProcessingError(`An unexpected error occurred: ${error.message}`);
      setIsProcessing(false);
    }
  }, [file, onBulkUpload]);


  const handleClose = () => {
    setFile(null);
    setFileName('');
    setIsProcessing(false);
    setUploadResult(null);
    setProcessingError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Bulk Upload Users</h2>

        {/* Download Template */}
        <div className="mb-4">
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
          >
            <DownloadIcon className="h-4 w-4" />
            Download .xlsx Template
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Download the template, fill in user details, and upload the file below. Required columns: {expectedColumns.join(', ')}.
          </p>
        </div>

        {/* Upload Area */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload .xlsx File</label>
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
             <label htmlFor="file-upload" className="flex-grow px-3 py-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer truncate">
               {fileName || "Choose file..."}
             </label>
             <input
                id="file-upload"
                type="file"
                accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
                className="hidden" // Hide default input, use label for styling
              />
             <button
                onClick={() => document.getElementById('file-upload')?.click()}
                className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 text-sm"
                disabled={isProcessing}
              >
                Browse
              </button>
          </div>

        </div>

         {/* Processing Indicator */}
        {isProcessing && (
          <div className="text-center my-4 text-blue-600 dark:text-blue-400">
            Processing... Please wait.
          </div>
        )}

        {/* Error Display */}
        {processingError && (
          <div className="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            <div className="flex items-center gap-2">
              <AlertCircleIcon className="h-5 w-5 flex-shrink-0"/>
              <span>{processingError}</span>
            </div>
          </div>
        )}


        {/* Upload Results */}
        {uploadResult && (
          <div className="mt-4 space-y-3">
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">Upload Summary</h3>
            {uploadResult.successCount > 0 && (
               <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
                 <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 flex-shrink-0"/>
                    <span>Successfully processed {uploadResult.successCount} users.</span>
                 </div>
               </div>
            )}
             {uploadResult.errors.length > 0 && (
               <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                 <div className="flex items-center gap-2 mb-2">
                    <AlertCircleIcon className="h-5 w-5 flex-shrink-0"/>
                    <span className="font-medium">Found {uploadResult.errors.length} errors:</span>
                 </div>
                 <ul className="list-disc list-inside max-h-40 overflow-y-auto text-xs space-y-1">
                    {uploadResult.errors.map((err, index) => (
                      <li key={index}>Row {err.row}: {err.message}</li>
                    ))}
                 </ul>
               </div>
            )}
             {(uploadResult.successCount === 0 && uploadResult.errors.length === 0 && !processingError) && (
                 <div className="p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md text-sm">
                    <div className="flex items-center gap-2">
                        <AlertCircleIcon className="h-5 w-5 flex-shrink-0"/>
                        <span>No users were processed. Check the file for valid data or errors.</span>
                    </div>
                 </div>
             )}
          </div>
        )}


        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
            disabled={isProcessing}
          >
            {uploadResult ? 'Close' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={processUpload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!file || isProcessing || !!uploadResult} // Disable if no file, processing, or results shown
          >
             <UploadIcon className="h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Upload & Validate'}
          </button>
        </div>
      </div>
    </div>
  );
}
