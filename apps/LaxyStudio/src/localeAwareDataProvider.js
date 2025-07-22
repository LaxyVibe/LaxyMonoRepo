import strapiDataProvider from './dataProvider';

// Create a locale-aware data provider wrapper
export const createLocaleAwareDataProvider = (getCurrentLocale) => {
  // Cache to track current locale and invalidate when it changes
  let lastLocale = null;
  
  const shouldInvalidateCache = () => {
    const currentLocale = getCurrentLocale();
    if (lastLocale !== currentLocale) {
      lastLocale = currentLocale;
      return true;
    }
    return false;
  };

  return {
    getList: async (resource, params) => {
      // For i18n resources, add locale parameter
      if (resource === 'pois') {
        const locale = getCurrentLocale();
        console.log(`🌐 Getting list for ${resource} with locale: ${locale}`);
        
        // Add locale to meta params for the data provider
        const enhancedParams = {
          ...params,
          meta: {
            ...params.meta,
            locale: locale,
            _timestamp: Date.now() // Force refresh when locale changes
          }
        };
        
        return strapiDataProvider.getList(resource, enhancedParams);
      }
      return strapiDataProvider.getList(resource, params);
    },

    getOne: async (resource, params) => {
      if (resource === 'pois') {
        const locale = getCurrentLocale();
        console.log(`🌐 Getting one ${resource} with id ${params.id} and locale: ${locale}`);
        
        const enhancedParams = {
          ...params,
          meta: {
            ...params.meta,
            locale: locale,
            _timestamp: Date.now()
          }
        };
        
        return strapiDataProvider.getOne(resource, enhancedParams);
      }
      return strapiDataProvider.getOne(resource, params);
    },

    getMany: async (resource, params) => {
      if (resource === 'pois') {
        const locale = getCurrentLocale();
        console.log(`🌐 Getting many ${resource} with locale: ${locale}`);
        
        const enhancedParams = {
          ...params,
          meta: {
            ...params.meta,
            locale: locale,
            _timestamp: Date.now()
          }
        };
        
        return strapiDataProvider.getMany(resource, enhancedParams);
      }
      return strapiDataProvider.getMany(resource, params);
    },

    getManyReference: async (resource, params) => {
      if (resource === 'pois') {
        const locale = getCurrentLocale();
        console.log(`🌐 Getting many reference ${resource} with locale: ${locale}`);
        
        const enhancedParams = {
          ...params,
          meta: {
            ...params.meta,
            locale: locale,
            _timestamp: Date.now()
          }
        };
        
        return strapiDataProvider.getManyReference(resource, enhancedParams);
      }
      return strapiDataProvider.getManyReference(resource, params);
    },

    create: async (resource, params) => {
      if (resource === 'pois') {
        const locale = getCurrentLocale();
        console.log(`🌐 Creating ${resource} with locale: ${locale}`);
        
        // Add locale to the data being created
        const enhancedParams = {
          ...params,
          data: {
            ...params.data,
            locale: locale
          }
        };
        
        return strapiDataProvider.create(resource, enhancedParams);
      }
      return strapiDataProvider.create(resource, params);
    },

    update: async (resource, params) => {
      if (resource === 'pois') {
        const locale = getCurrentLocale();
        console.log(`🌐 Updating ${resource} with id ${params.id} and locale: ${locale}`);
        
        // Add locale to the data being updated
        const enhancedParams = {
          ...params,
          data: {
            ...params.data,
            locale: locale
          }
        };
        
        return strapiDataProvider.update(resource, enhancedParams);
      }
      return strapiDataProvider.update(resource, params);
    },

    updateMany: async (resource, params) => {
      return strapiDataProvider.updateMany(resource, params);
    },

    delete: async (resource, params) => {
      if (resource === 'pois') {
        const locale = getCurrentLocale();
        console.log(`🌐 Deleting ${resource} with id ${params.id} and locale: ${locale}`);
        
        const enhancedParams = {
          ...params,
          meta: {
            ...params.meta,
            locale: locale
          }
        };
        
        return strapiDataProvider.delete(resource, enhancedParams);
      }
      return strapiDataProvider.delete(resource, params);
    },

    deleteMany: async (resource, params) => {
      return strapiDataProvider.deleteMany(resource, params);
    },
  };
};
