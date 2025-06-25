import React, { useState, useEffect } from 'react';
import { useStore } from '~/store/store';

// Placeholder type for settings
interface EssenceSettingsData {
  maxRewardAmount: number | string; // Use string for input field binding
  maxFineAmount: number | string;
  centralFineAccountId: string; // User ID or Email
  enableGroupActions: boolean;
}

export function EssenceSettings() {
  const { users } = useStore();
  const centralFineAccount = users.find(u => u.role === 'Super Admin'); // Example: Use first Super Admin as central account

  // Simulate fetching settings - replace with actual data fetching
  const [settings, setSettings] = useState<EssenceSettingsData>({
    maxRewardAmount: 1000,
    maxFineAmount: 500,
    centralFineAccountId: centralFineAccount?.email || '', // Use actual user email
    enableGroupActions: true,
  });
  const [isEditing, setIsEditing] = useState(false); // To toggle edit mode if needed
  const [tempSettings, setTempSettings] = useState<EssenceSettingsData>(settings);

  useEffect(() => {
    if (centralFineAccount) {
      setSettings(prev => ({ ...prev, centralFineAccountId: centralFineAccount.email }));
      setTempSettings(prev => ({ ...prev, centralFineAccountId: centralFineAccount.email }));
    }
  }, [centralFineAccount]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked; // For checkbox

    setTempSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    // TODO: Add validation (e.g., amounts are numbers, account ID format)
    console.log("Saving Essence Settings:", tempSettings);
    setSettings(tempSettings);
    setIsEditing(false);
    // TODO: Show success toast
    // TODO: Call API to save settings
  };

  const handleCancel = () => {
    setTempSettings(settings); // Revert changes
    setIsEditing(false);
  };

  return (
    <div className="p-4 border rounded-md dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Essence Settings</h3>
        {!isEditing && (
          <button
            onClick={() => { setTempSettings(settings); setIsEditing(true); }}
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            Edit Settings
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Max Reward Amount */}
        <div>
          <label htmlFor="maxRewardAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maximum Reward Amount</label>
          <input
            type="number"
            id="maxRewardAmount"
            name="maxRewardAmount"
            value={isEditing ? tempSettings.maxRewardAmount : settings.maxRewardAmount}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-700"
            min="0"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Set the highest amount allowed for a single reward.</p>
        </div>

        {/* Max Fine Amount */}
        <div>
          <label htmlFor="maxFineAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maximum Fine Amount</label>
          <input
            type="number"
            id="maxFineAmount"
            name="maxFineAmount"
            value={isEditing ? tempSettings.maxFineAmount : settings.maxFineAmount}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-700"
            min="0"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Set the highest amount allowed for a single fine.</p>
        </div>

        {/* Central Fine Account */}
        <div>
          <label htmlFor="centralFineAccountId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Central Fine Account Identifier</label>
          <input
            type="text" // Could be email, user ID, etc.
            id="centralFineAccountId"
            name="centralFineAccountId"
            value={isEditing ? tempSettings.centralFineAccountId : settings.centralFineAccountId}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Enter User ID or Email"
            className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-700"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Specify the user account where collected fines are sent.</p>
        </div>

        {/* Enable Group Actions */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableGroupActions"
            name="enableGroupActions"
            checked={isEditing ? tempSettings.enableGroupActions : settings.enableGroupActions}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-70"
          />
          <label htmlFor="enableGroupActions" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            Enable Group-Based Economic Actions
          </label>
        </div>
         <p className="text-xs text-gray-500 dark:text-gray-400 -mt-3 ml-6">Allow admins to assign rewards/fines/expenses to entire groups.</p>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
