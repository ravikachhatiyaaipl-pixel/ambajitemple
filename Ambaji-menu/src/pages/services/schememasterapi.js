/***
*
*  Application Name: I3EMS
*
*  Developed By: Aark InfoSoft Pvt Ltd.
*
*  Version: Ambaji Mata Temple Management
*  
*  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
*  All source code, database structures, UI/UX designs, workflows,
*  business logic, and documentation are confidential intellectual property.
*  Reverse engineering, duplication, or redistribution without written permission
*  is strictly prohibited and may result in legal action.
*  
*/

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

export const SchemeMasterApi = {
  getAll: async (params = {}) => {
    try {
      const url = new URL(`${API_BASE_URL}/lst-schemes`);
      
      if (params.per_page) url.searchParams.append('per_page', params.per_page);
      if (params.page) url.searchParams.append('page', params.page);
      if (params.search) url.searchParams.append('search', params.search);
      
      const response = await fetch(url,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (!response.ok) throw new Error('Failed to fetch schemes');
      const data = await response.json();
      
      return {
        data: data.data, 
        success: data.success,
        message: data.message
      };
    } catch (error) {
      console.error('Error fetching schemes:', error);
      throw error;
    }
  },


  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/schemes/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (!response.ok) throw new Error('Failed to fetch scheme');
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching scheme:', error);
      throw error;
    }
  },

  create: async (schemeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/schemes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(schemeData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create scheme');
      }
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error creating scheme:', error);
      throw error;
    }
  },

  update: async (id, schemeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/schemes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(schemeData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update scheme');
      }
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error updating scheme:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/schemes/${id}`, {
        method: 'DELETE',
      },{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete scheme');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting scheme:', error);
      throw error;
    }
  },

  getGrantTypes: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/grant-types/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (!response.ok) throw new Error('Failed to fetch grant types');
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching grant types:', error);
      throw error;
    }
  }
};