import React, { useState, useMemo } from 'react';
import { useStore } from '~/store/store';

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
function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
  );
}
function DatabaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
  );
}
function ArchiveIcon(props: React.SVGProps<SVGSVGElement>) { // For ZIP
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>
    )
}


// Placeholder types
type ExportModule = 'config' | 'groups' | 'essenceSettings' | 'users' | 'balances' | 'transactions' | 'activityLogs' | 'economySetup';
type ExportFormat = 'json' | 'csv';
type ImportMode = 'merge' | 'overwrite';

interface AuditLogEntry {
  id: string;
  actionType: 'Import' | 'Export';
  fileName?: string; // For import/export of single files
  modules?: ExportModule[]; // For export all / zip
  performedBy: string; // User ID or Name
  timestamp: string;
  status: 'Success' | 'Partial Success' | 'Failed';
  details?: string; // Error messages or summary
}

export function BackupRestore() {
  const { users, groups, transactions } = useStore();
  const [exportModules, setExportModules] = useState<ExportModule[]>([]);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [includeLogs, setIncludeLogs] = useState(false);

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFileName, setImportFileName] = useState('');
  const [importModule, setImportModule] = useState<ExportModule | ''>(''); // Which module the file corresponds to
  const [importMode, setImportMode] = useState<ImportMode>('merge');
  const [importPreview, setImportPreview] = useState<any>(null); // Placeholder for preview data
  const [importErrors, setImportErrors] = useState<string[]>([]);

  // Audit Log State
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([
    // Placeholder data
    { id: 'log1', actionType: 'Export', modules: ['config', 'groups'], performedBy: 'Super Admin', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'Success' },
    { id: 'log2', actionType: 'Import', fileName: 'users_import_v2.csv', performedBy: 'Super Admin', timestamp: new Date().toISOString(), status: 'Failed', details: 'Row 15: Invalid email format. Row 22: User ID not found.' },
  ]);
  const [filterDate, setFilterDate] = useState('');
  const [filterAction, setFilterAction] = useState<'Import' | 'Export' | ''>('');


  // --- Placeholder Handlers ---
  const handleExportSelection = (module: ExportModule, type: 'config' | 'full') => {
    // Basic logic to handle selection - needs refinement for exclusive choices etc.
    setExportModules(prev => {
        if (type === 'config') {
            // Allow selecting individual config items
            return prev.includes(module) ? prev.filter(m => m !== module) : [...prev, module];
        } else {
             // Allow selecting individual full data items (excluding logs initially)
             if (module === 'activityLogs') return prev; // Handled by separate checkbox
             return prev.includes(module) ? prev.filter(m => m !== module) : [...prev, module];
        }
    });
  };

  const handleExport = (type: 'selected' | 'all_config' | 'all_data' | 'zip') => {
    // Simulate export file generation
    console.log(`Exporting... Type: ${type}`);
    console.log("Data to export:", {
      users: users.length,
      groups: groups.length,
      transactions: transactions.length,
      selectedModules: exportModules,
      includeLogs,
      format: exportFormat
    });

    let modulesToExport: ExportModule[] = [];
    if (type === 'selected') modulesToExport = exportModules;
    if (type === 'all_config') modulesToExport = ['config', 'groups', 'essenceSettings']; // Define what 'config' means
    // FIX: Corrected conditional spread syntax
    if (type === 'all_data') modulesToExport = ['users', 'balances', 'transactions', 'economySetup', ...(includeLogs ? ['activityLogs'] : [])]; // Define what 'data' means
    // FIX: Corrected conditional spread syntax
    if (type === 'zip') modulesToExport = ['config', 'groups', 'essenceSettings', 'users', 'balances', 'transactions', 'economySetup', ...(includeLogs ? ['activityLogs'] : [])]; // All

    if (modulesToExport.length === 0 && type === 'selected') {
        alert("Please select at least one module to export.");
        return;
    }

    // TODO: Generate mock data based on selection and format
    // TODO: Trigger file download (single file or zip)
    // TODO: Add entry to Audit Log
    alert(`Export initiated for ${type} with ${users.length} users, ${groups.length} groups, and ${transactions.length} transactions as ${exportFormat}. Check console.`);
    // Add mock audit log entry
    setAuditLog(prev => [{
        id: `log${Date.now()}`,
        actionType: 'Export',
        modules: modulesToExport,
        performedBy: 'Current Super Admin', // Get actual user later
        timestamp: new Date().toISOString(),
        status: 'Success', // Assume success for placeholder
    }, ...prev]);
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImportFile(file);
      setImportFileName(file.name);
      setImportPreview(null); // Reset preview
      setImportErrors([]);
      // Try to guess module from filename? Or require selection?
      // For now, require selection via dropdown.
    }
  };

  const handleImport = () => {
    if (!importFile || !importModule) {
      alert("Please select a file and the corresponding data module to import.");
      return;
    }
    console.log(`Importing file: ${importFileName}`);
    console.log(`Module: ${importModule}`);
    console.log(`Mode: ${importMode}`);

    // TODO: Read file content (FileReader)
    // TODO: Parse data (JSON/CSV)
    // TODO: Validate data structure and content
    // TODO: Show preview (first few rows?)
    // TODO: Show validation errors
    // TODO: If valid, show confirmation for 'overwrite' mode
    // TODO: Simulate merge/overwrite action
    // TODO: Add entry to Audit Log

    alert(`Placeholder: Import initiated for ${importModule} from ${importFileName} (Mode: ${importMode}). Check console.`);
    // Add mock audit log entry
     setAuditLog(prev => [{
        id: `log${Date.now()}`,
        actionType: 'Import',
        fileName: importFileName,
        modules: [importModule],
        performedBy: 'Current Super Admin', // Get actual user later
        timestamp: new Date().toISOString(),
        status: 'Success', // Assume success for placeholder
    }, ...prev]);
     // Reset import form
     setImportFile(null);
     setImportFileName('');
     setImportModule('');
     setImportPreview(null);
     setImportErrors([]);
  };

  const filteredAuditLog = useMemo(() => {
    return auditLog.filter(log => {
        const dateMatch = !filterDate || log.timestamp.startsWith(filterDate);
        const actionMatch = !filterAction || log.actionType === filterAction;
        return dateMatch && actionMatch;
    });
  }, [auditLog, filterDate, filterAction]);


  return (
    <div className="p-4 border rounded-md dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm space-y-8">
      {/* Export Section */}
      <section>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Export Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Configuration Export */}
          <div className="p-4 border rounded dark:border-gray-600">
            <h4 className="font-medium mb-2 flex items-center gap-2"><FileTextIcon className="w-5 h-5"/>Configuration Modules</h4>
            <div className="space-y-2 text-sm">
              {/* Add checkboxes for config modules */}
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={exportModules.includes('groups')} onChange={() => handleExportSelection('groups', 'config')} className="form-checkbox h-4 w-4 text-blue-600"/> Groups
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={exportModules.includes('essenceSettings')} onChange={() => handleExportSelection('essenceSettings', 'config')} className="form-checkbox h-4 w-4 text-blue-600"/> Essence Settings
              </label>
               {/* Add more config modules as needed */}
            </div>
             <button
                onClick={() => handleExport('all_config')}
                className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
             >
                <DownloadIcon className="h-3 w-3" /> Export All Config
             </button>
          </div>

          {/* Full Data Export */}
          <div className="p-4 border rounded dark:border-gray-600">
            <h4 className="font-medium mb-2 flex items-center gap-2"><DatabaseIcon className="w-5 h-5"/>Full Data Modules</h4>
            <div className="space-y-2 text-sm">
              {/* Add checkboxes for data modules */}
               <label className="flex items-center gap-2">
                <input type="checkbox" checked={exportModules.includes('users')} onChange={() => handleExportSelection('users', 'full')} className="form-checkbox h-4 w-4 text-blue-600"/> Users
              </label>
               <label className="flex items-center gap-2">
                <input type="checkbox" checked={exportModules.includes('balances')} onChange={() => handleExportSelection('balances', 'full')} className="form-checkbox h-4 w-4 text-blue-600"/> User Balances
              </label>
               <label className="flex items-center gap-2">
                <input type="checkbox" checked={exportModules.includes('transactions')} onChange={() => handleExportSelection('transactions', 'full')} className="form-checkbox h-4 w-4 text-blue-600"/> Transactions
              </label>
               <label className="flex items-center gap-2">
                <input type="checkbox" checked={exportModules.includes('economySetup')} onChange={() => handleExportSelection('economySetup', 'full')} className="form-checkbox h-4 w-4 text-blue-600"/> Economy Setup (Activities/Expenses)
              </label>
              <hr className="my-2 dark:border-gray-600"/>
               <label className="flex items-center gap-2">
                <input type="checkbox" checked={includeLogs} onChange={(e) => setIncludeLogs(e.target.checked)} className="form-checkbox h-4 w-4 text-blue-600"/> Include Activity Logs (Optional)
              </label>
            </div>
             <button
                onClick={() => handleExport('all_data')}
                className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
             >
                <DownloadIcon className="h-3 w-3" /> Export All Data
             </button>
          </div>
        </div>

        {/* Export Controls */}
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border dark:border-gray-700">
           <div className="flex-shrink-0">
             <label htmlFor="exportFormat" className="text-sm font-medium mr-2">Format:</label>
             <select
                id="exportFormat"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                className="px-3 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
             >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
             </select>
           </div>
           <div className="flex-grow flex flex-wrap gap-2">
             <button
                onClick={() => handleExport('selected')}
                disabled={exportModules.length === 0}
                className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <DownloadIcon className="h-4 w-4" /> Export Selected ({exportModules.length})
             </button>
              <button
                onClick={() => handleExport('zip')}
                className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
             >
                <ArchiveIcon className="h-4 w-4" /> Download All as ZIP
             </button>
           </div>
        </div>
      </section>

      <hr className="dark:border-gray-700"/>

      {/* Import Section */}
      <section>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Import Data</h3>
        <div className="p-4 border rounded dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* File Upload */}
            <div>
              <label htmlFor="importFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select File (.json or .csv)</label>
              <input
                type="file"
                id="importFile"
                accept=".json,.csv"
                onChange={handleImportFileChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200 dark:hover:file:bg-gray-600"
              />
              {importFileName && <p className="text-xs mt-1 text-gray-600 dark:text-gray-400 truncate">Selected: {importFileName}</p>}
            </div>

            {/* Module Selection */}
            <div>
              <label htmlFor="importModule" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Module</label>
              <select
                id="importModule"
                value={importModule}
                onChange={(e) => setImportModule(e.target.value as ExportModule | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="" disabled>Select module...</option>
                <option value="users">Users</option>
                <option value="balances">User Balances</option>
                <option value="transactions">Transactions</option>
                <option value="groups">Groups</option>
                <option value="economySetup">Economy Setup (Activities/Expenses)</option>
                 {/* Add other importable modules */}
              </select>
            </div>

            {/* Import Mode & Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2">
               <div>
                 <label htmlFor="importMode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Import Mode</label>
                 <select
                    id="importMode"
                    value={importMode}
                    onChange={(e) => setImportMode(e.target.value as ImportMode)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                 >
                    <option value="merge">Merge with existing</option>
                    <option value="overwrite">Overwrite existing</option>
                 </select>
               </div>
               <button
                  onClick={handleImport}
                  disabled={!importFile || !importModule}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <UploadIcon className="h-4 w-4" /> Import
               </button>
            </div>
          </div>
           {/* Placeholder for Preview/Validation */}
           {importErrors.length > 0 && (
             <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                <p className="font-medium mb-1">Import Validation Errors:</p>
                <ul className="list-disc list-inside text-xs">
                    {importErrors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
             </div>
           )}
           {importPreview && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded text-sm">
                <p className="font-medium mb-1">Import Preview:</p>
                <pre className="text-xs max-h-40 overflow-auto bg-white dark:bg-gray-900 p-2 rounded">{JSON.stringify(importPreview, null, 2)}</pre>
             </div>
           )}
           <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Note: 'Overwrite' mode requires confirmation. Validation checks headers, data types, and references (e.g., User IDs). Preview shows sample data before import.</p>
        </div>
      </section>

       <hr className="dark:border-gray-700"/>

      {/* Audit Trail Section */}
      <section>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Import/Export Audit Trail</h3>
         {/* Filters */}
         <div className="flex flex-wrap gap-4 mb-4">
             <div>
                <label htmlFor="filterDate" className="text-sm font-medium mr-2">Date:</label>
                <input
                    type="date"
                    id="filterDate"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                />
             </div>
             <div>
                <label htmlFor="filterAction" className="text-sm font-medium mr-2">Action:</label>
                <select
                    id="filterAction"
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value as 'Import' | 'Export' | '')}
                    className="px-3 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                >
                    <option value="">All Actions</option>
                    <option value="Import">Import</option>
                    <option value="Export">Export</option>
                </select>
             </div>
         </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto border rounded dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Timestamp</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Action</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Details</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Performed By</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {filteredAuditLog.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    No audit log entries found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredAuditLog.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.actionType === 'Import' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                            {log.actionType}
                        </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {log.fileName ? `File: ${log.fileName}` : ''}
                        {log.modules ? ` Modules: ${log.modules.join(', ')}` : ''}
                        {log.details ? <p className="text-xs text-red-600 dark:text-red-400 mt-1">{log.details}</p> : ''}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.performedBy}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.status === 'Success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : log.status === 'Failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                         {log.status}
                       </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
