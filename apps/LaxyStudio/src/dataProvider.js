import axios from 'axios';

const API_URL = 'https://laxy-studio-strapi-c1d6d20cbc41.herokuapp.com/api';
const API_TOKEN = '67a3d41880416574637ea60f183d6410a54e62c747f6b433d9f3e636184a49a153cc82e417a1eb23c62e844f8373206f043e83c2a781834d9702b87512034fddd96757c3bef59e470fba5e1f96634e0b01bbe58e38d8765df4094a00fb218862074dc54344c5f7e5dfb959092387b5e1c2b17650d0a755a699a200486cda36ee';

// Configure axios with default headers
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

const strapiDataProvider = {
  getList: async (resource, params) => {
    console.log('strapiDataProvider.getList called with:', { resource, params });
    const { page = 1, perPage = 10 } = params.pagination || {};
    const { field = 'id', order = 'ASC' } = params.sort || {};
    const { q } = params.filter || {};
    const locale = params.meta?.locale;

    try {
      const query = new URLSearchParams({
        'pagination[page]': page.toString(),
        'pagination[pageSize]': perPage.toString(),
        'sort': `${field}:${order.toLowerCase()}`,
        'populate': '*', // Populate all related fields
        ...(q && { 'filters[$or][0][label][$containsi]': q }),
        ...(q && { 'filters[$or][1][address][$containsi]': q }),
        ...(q && { 'filters[$or][2][highlight][$containsi]': q }),
        ...(locale && { 'locale': locale }), // Add locale parameter if provided
      });

      const response = await apiClient.get(`/${resource}?${query}`);
      
      console.log('Raw Strapi response for getList:', response.data);
      
      const mappedData = response.data.data.map(item => {
        // Destructure to avoid overwriting our custom id field
        const { id: originalId, documentId, ...otherFields } = item;
        const mappedItem = {
          id: documentId, // Use documentId as the main identifier for React Admin
          documentId: documentId, // Keep original documentId
          numericId: originalId, // Keep the numeric ID for reference
          ...otherFields, // All other fields except the original id
        };
        console.log('Original item:', item);
        console.log('Mapped item in getList:', mappedItem);
        return mappedItem;
      });
      
      return {
        data: mappedData,
        total: response.data.meta?.pagination?.total || response.data.data.length,
      };
    } catch (error) {
      console.error('Error fetching list:', error);
      return Promise.reject(new Error(`Error fetching ${resource}: ${error.message}`));
    }
  },

  getOne: async (resource, params) => {
    console.log('strapiDataProvider.getOne called with:', { resource, params });
    const locale = params.meta?.locale;
    
    try {
      let url = `/${resource}/${params.id}?populate=*`;
      if (locale) {
        url += `&locale=${locale}`;
      }
      
      const response = await apiClient.get(url);
      const { id: originalId, documentId, ...otherFields } = response.data.data;
      const mappedData = {
        id: documentId, // Use documentId as the main identifier for React Admin
        documentId: documentId, // Keep original documentId
        numericId: originalId, // Keep the numeric ID for reference
        ...otherFields, // All other fields except the original id
      };
      console.log('getOne mapped data:', mappedData);
      return {
        data: mappedData,
      };
    } catch (error) {
      console.error('Error fetching one:', error);
      return Promise.reject(new Error(`Error fetching ${resource} with id ${params.id}: ${error.message}`));
    }
  },

  getMany: async (resource, params) => {
    console.log('strapiDataProvider.getMany called with:', { resource, params });
    const locale = params.meta?.locale;
    
    try {
      const promises = params.ids.map(id => {
        let url = `/${resource}/${id}?populate=*`;
        if (locale) {
          url += `&locale=${locale}`;
        }
        return apiClient.get(url);
      });
      const responses = await Promise.all(promises);
      return {
        data: responses.map(response => {
          const { id: originalId, documentId, ...otherFields } = response.data.data;
          return {
            id: documentId, // Use documentId as the main identifier for React Admin
            documentId: documentId, // Keep original documentId
            numericId: originalId, // Keep the numeric ID for reference
            ...otherFields, // All other fields except the original id
          };
        }),
      };
    } catch (error) {
      console.error('Error fetching many:', error);
      return Promise.reject(new Error(`Error fetching multiple ${resource}: ${error.message}`));
    }
  },

  getManyReference: async (resource, params) => {
    const { page = 1, perPage = 10 } = params.pagination || {};
    const { field = 'id', order = 'ASC' } = params.sort || {};
    const locale = params.meta?.locale;

    try {
      const query = new URLSearchParams({
        'pagination[page]': page.toString(),
        'pagination[pageSize]': perPage.toString(),
        'sort': `${field}:${order.toLowerCase()}`,
        'populate': '*', // Populate all related fields
        [`filters[${params.target}][id][$eq]`]: params.id,
        ...(locale && { 'locale': locale }), // Add locale parameter if provided
      });

      const response = await apiClient.get(`/${resource}?${query}`);
      
      return {
        data: response.data.data.map(item => {
          const { id: originalId, documentId, ...otherFields } = item;
          return {
            id: documentId, // Use documentId as the main identifier for React Admin
            documentId: documentId, // Keep original documentId
            numericId: originalId, // Keep the numeric ID for reference
            ...otherFields, // All other fields except the original id
          };
        }),
        total: response.data.meta?.pagination?.total || response.data.data.length,
      };
    } catch (error) {
      console.error('Error fetching many reference:', error);
      return Promise.reject(new Error(`Error fetching ${resource} references: ${error.message}`));
    }
  },

  create: async (resource, params) => {
    console.log('strapiDataProvider.create called with:', { resource, params });
    try {
      // If locale is in the data, it will be handled by Strapi automatically
      const response = await apiClient.post(`/${resource}`, {
        data: params.data,
      });
      const { id: originalId, documentId, ...otherFields } = response.data.data;
      return {
        data: {
          id: documentId, // Use documentId as the main identifier for React Admin
          documentId: documentId, // Keep original documentId
          numericId: originalId, // Keep the numeric ID for reference
          ...otherFields, // All other fields except the original id
        },
      };
    } catch (error) {
      console.error('Error creating:', error);
      return Promise.reject(new Error(`Error creating ${resource}: ${error.message}`));
    }
  },

  update: async (resource, params) => {
    console.log('strapiDataProvider.update called with:', { resource, params });
    const locale = params.data?.locale;
    
    try {
      let url = `/${resource}/${params.id}`;
      if (locale) {
        url += `?locale=${locale}`;
      }
      
      const response = await apiClient.put(url, {
        data: params.data,
      });
      const { id: originalId, documentId, ...otherFields } = response.data.data;
      return {
        data: {
          id: documentId, // Use documentId as the main identifier for React Admin
          documentId: documentId, // Keep original documentId
          numericId: originalId, // Keep the numeric ID for reference
          ...otherFields, // All other fields except the original id
        },
      };
    } catch (error) {
      console.error('Error updating:', error);
      return Promise.reject(new Error(`Error updating ${resource} with id ${params.id}: ${error.message}`));
    }
  },

  updateMany: async (resource, params) => {
    try {
      const promises = params.ids.map(id =>
        apiClient.put(`/${resource}/${id}`, {
          data: params.data,
        })
      );
      const responses = await Promise.all(promises);
      return {
        data: responses.map(response => response.data.data.documentId),
      };
    } catch (error) {
      console.error('Error updating many:', error);
      return Promise.reject(new Error(`Error updating multiple ${resource}: ${error.message}`));
    }
  },

  delete: async (resource, params) => {
    const locale = params.meta?.locale;
    
    try {
      let url = `/${resource}/${params.id}`;
      if (locale) {
        url += `?locale=${locale}`;
      }
      
      await apiClient.delete(url);
      return {
        data: { id: params.id },
      };
    } catch (error) {
      console.error('Error deleting:', error);
      return Promise.reject(new Error(`Error deleting ${resource} with id ${params.id}: ${error.message}`));
    }
  },

  deleteMany: async (resource, params) => {
    try {
      const promises = params.ids.map(id => apiClient.delete(`/${resource}/${id}`));
      await Promise.all(promises);
      return {
        data: params.ids,
      };
    } catch (error) {
      console.error('Error deleting many:', error);
      return Promise.reject(new Error(`Error deleting multiple ${resource}: ${error.message}`));
    }
  },
};

// Debug: Log available methods
console.log('Strapi Data Provider methods:', Object.keys(strapiDataProvider));

export default strapiDataProvider;
