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

import { useState, useEffect } from 'react';
import axios from 'axios';

export const useOrganization = () => {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/lst-org-master`,
         {
         headers : {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
        }
      );

      if (response.data.success && response.data.data?.length > 0) {
        setOrganization(response.data.data[0]);
      }
    } catch (err) {
      console.error('Error fetching organization data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { organization, loading, error };
};