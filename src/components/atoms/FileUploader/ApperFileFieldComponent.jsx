import { useState, useEffect, useRef, useMemo } from 'react';

const ApperFileFieldComponent = ({ config, elementId }) => {
  // State for UI-driven values
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  // Refs for tracking lifecycle and preventing memory leaks
  const mountedRef = useRef(false);
  const elementIdRef = useRef(elementId);
  const existingFilesRef = useRef([]);

  // Update elementIdRef when elementId changes
  useEffect(() => {
    elementIdRef.current = elementId;
  }, [elementId]);

  // Memoized existingFiles to prevent unnecessary re-renders
  const memoizedExistingFiles = useMemo(() => {
    if (!config.existingFiles || !Array.isArray(config.existingFiles)) {
      return [];
    }
    
    // Return empty array if no files exist to prevent re-renders
    if (config.existingFiles.length === 0) {
      return [];
    }
    
    // Detect actual changes by comparing length and first file's ID
    const currentLength = config.existingFiles.length;
    const firstFileId = config.existingFiles[0]?.Id || config.existingFiles[0]?.id;
    
    return config.existingFiles;
  }, [config.existingFiles?.length, config.existingFiles?.[0]?.Id || config.existingFiles?.[0]?.id]);

  // Initial Mount Effect
  useEffect(() => {
    const initializeFileField = async () => {
      try {
        // Initialize ApperSDK: 50 attempts × 100ms
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.ApperSDK && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!window.ApperSDK) {
          throw new Error('ApperSDK not loaded. Please ensure the SDK script is included before this component.');
        }

        const { ApperFileUploader } = window.ApperSDK;
        
        if (!ApperFileUploader) {
          throw new Error('ApperFileUploader not available in ApperSDK.');
        }

        // Set element ID for uploader instance
        elementIdRef.current = elementId; // CRITICAL: Always set elementId directly

        // Mount the file field with full config
        await ApperFileUploader.FileField.mount(elementIdRef.current, {
          ...config,
          existingFiles: memoizedExistingFiles
        });

        mountedRef.current = true;
        setIsReady(true);
        setError(null);

      } catch (err) {
        console.error('Error mounting ApperFileFieldComponent:', err);
        setError(err.message);
        setIsReady(false);
      }
    };

    initializeFileField();

    // Cleanup on component destruction
    return () => {
      try {
        if (mountedRef.current && window.ApperSDK?.ApperFileUploader) {
          window.ApperSDK.ApperFileUploader.FileField.unmount(elementIdRef.current);
        }
        mountedRef.current = false;
        existingFilesRef.current = [];
      } catch (err) {
        console.error('Error unmounting ApperFileFieldComponent:', err);
      }
    };
  }, [elementId, config.fieldName, config.fieldKey, config.tableName]);

  // File Update Effect
  useEffect(() => {
    const updateFiles = async () => {
      // Early returns: check prerequisites
      if (!isReady || !window.ApperSDK?.ApperFileUploader || !config.fieldKey) {
        return;
      }

      try {
        // Deep equality check with JSON.stringify
        const currentFilesJson = JSON.stringify(memoizedExistingFiles);
        const existingFilesJson = JSON.stringify(existingFilesRef.current);
        
        if (currentFilesJson === existingFilesJson) {
          return; // No changes detected
        }

        // Format detection: check for .Id vs .id property
        let filesToUpdate = memoizedExistingFiles;
        
        if (memoizedExistingFiles.length > 0) {
          const firstFile = memoizedExistingFiles[0];
          
          // Check if format conversion is needed (API format has .Id)
          if (firstFile.Id !== undefined) {
            // Convert from API format to UI format
            filesToUpdate = window.ApperSDK.ApperFileUploader.toUIFormat(memoizedExistingFiles);
          }
        }

        // Update files or clear field based on content
        if (filesToUpdate.length > 0) {
          await window.ApperSDK.ApperFileUploader.FileField.updateFiles(config.fieldKey, filesToUpdate);
        } else {
          await window.ApperSDK.ApperFileUploader.FileField.clearField(config.fieldKey);
        }

        // Update ref to track current state
        existingFilesRef.current = memoizedExistingFiles;

      } catch (err) {
        console.error('Error updating files in ApperFileFieldComponent:', err);
        setError(err.message);
      }
    };

    updateFiles();
  }, [memoizedExistingFiles, isReady, config.fieldKey]);

  // Error UI
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="text-red-800">
            <h3 className="text-sm font-medium">File Upload Error</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Main container with unique ID
  return (
    <div className="w-full">
      <div id={elementId} className="min-h-[100px] border-2 border-dashed border-gray-300 rounded-lg p-4">
        {!isReady && (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading file uploader...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApperFileFieldComponent;