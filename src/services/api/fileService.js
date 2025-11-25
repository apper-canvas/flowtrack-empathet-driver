import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

const TABLE_NAME = 'file_c';

export const fileService = {
  async getAll() {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "file_data_c"}},
          {"field": {"Name": "task_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "file_size_kb_c"}},
          {"field": {"Name": "file_type_c"}},
          {"field": {"Name": "upload_date_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map(item => ({
        Id: item.Id,
        name: item.Name || "",
        fileData: item.file_data_c || null,
        taskId: item.task_c?.Id || null,
        taskName: item.task_c?.Name || "",
        description: item.description_c || "",
        fileSizeKb: item.file_size_kb_c || 0,
        fileType: item.file_type_c || "",
        uploadDate: item.upload_date_c || item.CreatedOn || new Date().toISOString()
      }));

    } catch (error) {
      console.error("Error fetching files:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getByTaskId(taskId) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "file_data_c"}},
          {"field": {"Name": "task_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "file_size_kb_c"}},
          {"field": {"Name": "file_type_c"}},
          {"field": {"Name": "upload_date_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        where: [{
          "FieldName": "task_c",
          "Operator": "EqualTo",
          "Values": [parseInt(taskId)]
        }],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map(item => ({
        Id: item.Id,
        name: item.Name || "",
        fileData: item.file_data_c || null,
        taskId: item.task_c?.Id || null,
        taskName: item.task_c?.Name || "",
        description: item.description_c || "",
        fileSizeKb: item.file_size_kb_c || 0,
        fileType: item.file_type_c || "",
        uploadDate: item.upload_date_c || item.CreatedOn || new Date().toISOString()
      }));

    } catch (error) {
      console.error(`Error fetching files for task ${taskId}:`, error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "file_data_c"}},
          {"field": {"Name": "task_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "file_size_kb_c"}},
          {"field": {"Name": "file_type_c"}},
          {"field": {"Name": "upload_date_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);

      if (!response?.data) {
        return null;
      }

      const item = response.data;
      return {
        Id: item.Id,
        name: item.Name || "",
        fileData: item.file_data_c || null,
        taskId: item.task_c?.Id || null,
        taskName: item.task_c?.Name || "",
        description: item.description_c || "",
        fileSizeKb: item.file_size_kb_c || 0,
        fileType: item.file_type_c || "",
        uploadDate: item.upload_date_c || item.CreatedOn || new Date().toISOString()
      };

    } catch (error) {
      console.error(`Error fetching file ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(fileData) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Only include Updateable fields for create operation
      const params = {
        records: [{
          Name: fileData.name || "",
          file_data_c: fileData.fileData || null,
          task_c: fileData.taskId ? parseInt(fileData.taskId) : null,
          description_c: fileData.description || "",
          file_size_kb_c: fileData.fileSizeKb || 0,
          file_type_c: fileData.fileType || "",
          upload_date_c: fileData.uploadDate || new Date().toISOString()
        }]
      };

      const response = await apperClient.createRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} files:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const item = successful[0].data;
          return {
            Id: item.Id,
            name: item.Name || "",
            fileData: item.file_data_c || null,
            taskId: item.task_c?.Id || null,
            taskName: item.task_c?.Name || "",
            description: item.description_c || "",
            fileSizeKb: item.file_size_kb_c || 0,
            fileType: item.file_type_c || "",
            uploadDate: item.upload_date_c || item.CreatedOn || new Date().toISOString()
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating file:", error?.response?.data?.message || error);
      return null;
    }
  },

  async update(id, fileData) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Only include Updateable fields for update operation
      const params = {
        records: [{
          Id: parseInt(id),
          Name: fileData.name || "",
          file_data_c: fileData.fileData || null,
          task_c: fileData.taskId ? parseInt(fileData.taskId) : null,
          description_c: fileData.description || "",
          file_size_kb_c: fileData.fileSizeKb || 0,
          file_type_c: fileData.fileType || "",
          upload_date_c: fileData.uploadDate || new Date().toISOString()
        }]
      };

      const response = await apperClient.updateRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} files:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const item = successful[0].data;
          return {
            Id: item.Id,
            name: item.Name || "",
            fileData: item.file_data_c || null,
            taskId: item.task_c?.Id || null,
            taskName: item.task_c?.Name || "",
            description: item.description_c || "",
            fileSizeKb: item.file_size_kb_c || 0,
            fileType: item.file_type_c || "",
            uploadDate: item.upload_date_c || item.CreatedOn || new Date().toISOString()
          };
        }
      }

      return null;
    } catch (error) {
      console.error(`Error updating file ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async delete(id) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} files:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0;
      }

      return false;
    } catch (error) {
      console.error(`Error deleting file ${id}:`, error?.response?.data?.message || error);
      return false;
    }
  }
};