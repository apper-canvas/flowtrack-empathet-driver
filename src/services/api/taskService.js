import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";
import React from "react";

const TABLE_NAME = "task_c";

export const taskService = {
  async getAll() {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [
          {"fieldName": "CreatedOn", "sorttype": "DESC"}
        ]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      // Transform data to match expected format
      const transformedData = (response.data || []).map(item => ({
        Id: item.Id,
        title: item.title_c || "",
        description: item.description_c || "",
        priority: item.priority_c || "medium",
        status: item.status_c || "active",
        createdAt: item.CreatedOn || new Date().toISOString(),
        completedAt: item.status_c === "completed" ? item.CreatedOn : null
      }));

      return transformedData;
    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error);
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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (!response.data) {
        throw new Error(`Task with Id ${id} not found`);
      }

      // Transform data to match expected format
      const item = response.data;
      return {
        Id: item.Id,
        title: item.title_c || "",
        description: item.description_c || "",
        priority: item.priority_c || "medium",
        status: item.status_c || "active",
        createdAt: item.CreatedOn || new Date().toISOString(),
        completedAt: item.status_c === "completed" ? item.CreatedOn : null
      };
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(taskData) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [
          {
            title_c: taskData.title || "",
            description_c: taskData.description || "",
            priority_c: taskData.priority || "medium",
            status_c: taskData.status || "active"
          }
        ]
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
          console.error(`Failed to create ${failed.length} tasks:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const item = successful[0].data;
          return {
            Id: item.Id,
            title: item.title_c || "",
            description: item.description_c || "",
            priority: item.priority_c || "medium",
            status: item.status_c || "active",
            createdAt: item.CreatedOn || new Date().toISOString(),
            completedAt: item.status_c === "completed" ? item.CreatedOn : null
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error);
      return null;
    }
  },

  async update(id, updates) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const updateData = {
        Id: parseInt(id)
      };

      // Map updates to database field names
      if (updates.title !== undefined) updateData.title_c = updates.title;
      if (updates.description !== undefined) updateData.description_c = updates.description;
      if (updates.priority !== undefined) updateData.priority_c = updates.priority;
      if (updates.status !== undefined) updateData.status_c = updates.status;

      const params = {
        records: [updateData]
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
          console.error(`Failed to update ${failed.length} tasks:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const item = successful[0].data;
          return {
            Id: item.Id,
            title: item.title_c || "",
            description: item.description_c || "",
            priority: item.priority_c || "medium",
            status: item.status_c || "active",
            createdAt: item.CreatedOn || new Date().toISOString(),
            completedAt: item.status_c === "completed" ? item.CreatedOn : null
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating task:", error?.response?.data?.message || error);
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
          console.error(`Failed to delete ${failed.length} tasks:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error("Error deleting task:", error?.response?.data?.message || error);
      return false;
return false;
    }
  }
};