import React, { useState } from 'react';
import {
  List,
  Datagrid,
  TextField,
  EditButton,
  ShowButton,
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  Show,
  SimpleShowLayout,
  Create,
  Filter,
  SearchInput,
  DateField,
  BooleanField,
  ChipField,
  required,
  FunctionField,
  ReferenceArrayField,
  SingleFieldList,
  ImageField,
  UrlField,
} from 'react-admin';
import { Box, Chip } from '@mui/material';
import { useLocale } from '../context/LocaleContext';
import ActionDialog from './ActionDialog';

// Filter component for the POI list
const PoiFilter = (props) => (
  <Filter {...props}>
    <SearchInput placeholder="Search label or address" source="q" alwaysOn />
    <SelectInput source="type" choices={[
      { id: 'restaurant', name: 'Restaurant' },
      { id: 'attraction', name: 'Attraction' },
    ]} />
  </Filter>
);

// List component for POIs
export const PoiList = (props) => {
  const { currentLocale, getCurrentLocaleInfo } = useLocale();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleRowClick = (id, basePath, record) => {
    setSelectedRecord(record);
    setDialogOpen(true);
    return false; // Prevent default row click behavior
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedRecord(null);
  };
  
  return (
    <>
      <List 
        {...props} 
        filters={<PoiFilter />} 
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <span>Points of Interest</span>
          </Box>
        }
      >
        <Datagrid 
          sx={{
            '& .RaDatagrid-table': {
              tableLayout: 'auto',
              '& th, & td': {
                padding: '16px 12px',
                verticalAlign: 'top',
              },
              '& tbody tr': {
                height: 'auto',
                minHeight: '80px',
                cursor: 'pointer',
              }
            }
          }}
          rowClick={handleRowClick}
          bulkActionButtons={false}
        >
          {/* ...existing code... */}
          <TextField source="numericId" label="ID" />
          <FunctionField 
            label="Locale" 
            render={record => {
              const locale = record.locale || currentLocale;
              const flag = locale === 'en' ? '🇺🇸' : 
                          locale === 'zh-Hant' ? '🇹🇼' : 
                          locale === 'zh-Hans' ? '🇨🇳' : 
                          locale === 'ko' ? '🇰🇷' : 
                          locale === 'ja' ? '🇯🇵' : '🌐';
              return (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <span style={{ fontSize: '20px' }}>{flag}</span>
                  <span style={{ fontWeight: '500' }}>{locale}</span>
                </span>
              );
            }} 
          />
          <FunctionField 
            label="Photo" 
            render={record => {
              if (record.coverPhoto) {
                // Handle both Strapi v4 and v5 formats
                const imageUrl = record.coverPhoto.url || record.coverPhoto.formats?.thumbnail?.url;
                return imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt="Cover" 
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      border: '2px solid #ddd',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }} 
                  />
                ) : '📷';
              }
              return (
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  fontSize: '24px'
                }}>
                  📷
                </div>
              );
            }} 
          />
          <FunctionField 
            label="Details" 
            render={record => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '300px' }}>
                <div style={{ fontWeight: '600', fontSize: '16px', color: '#1976d2' }}>
                  {record.label}
                </div>
                <div style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
                  {record.slug}
                </div>
                <FunctionField 
                  label=""
                  render={record => {
                    const emoji = record.type === 'restaurant' ? '🍴' : record.type === 'attraction' ? '🎯' : '📍';
                    const typeLabel = record.type === 'restaurant' ? 'Restaurant' : record.type === 'attraction' ? 'Attraction' : record.type;
                    return (
                      <Chip
                        label={`${emoji} ${typeLabel}`}
                        sx={{ 
                          height: '24px', 
                          fontSize: '11px',
                          fontWeight: '500'
                        }}
                      />
                    );
                  }}
                />
              </div>
            )}
          />
          <FunctionField 
            label="Location & Contact" 
            render={record => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '250px' }}>
                {record.address && (
                  <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                    📍 {record.address}
                  </div>
                )}
                {record.dial && (
                  <div style={{ fontSize: '14px', color: '#1976d2' }}>
                    📞 {record.dial}
                  </div>
                )}
                {record.highlight && (
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#666', 
                    fontStyle: 'italic',
                    lineHeight: '1.3',
                    maxWidth: '250px'
                  }}>
                    {record.highlight.length > 120 ? `${record.highlight.substring(0, 120)}...` : record.highlight}
                  </div>
                )}
              </div>
            )}
          />
          <FunctionField 
            label="Tags" 
            render={record => {
              if (record.tag_labels && Array.isArray(record.tag_labels) && record.tag_labels.length > 0) {
                const tagNames = record.tag_labels.map(tag => tag.name || tag.label || tag.title).filter(Boolean);
                if (tagNames.length === 0) return <span style={{ color: '#999' }}>No tags</span>;
                
                return (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '200px' }}>
                    {tagNames.map((tagName, index) => (
                      <span 
                        key={index} 
                        style={{ 
                          backgroundColor: '#e3f2fd', 
                          color: '#1976d2', 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '11px',
                          fontWeight: '500',
                          whiteSpace: 'nowrap'
                        }}
                        title={tagName}
                      >
                        {tagName.length > 15 ? `${tagName.substring(0, 15)}...` : tagName}
                      </span>
                    ))}
                  </div>
                );
              }
              return <span style={{ color: '#999' }}>No tags</span>;
            }} 
          />
          <DateField source="createdAt" locales="en-GB" />
        </Datagrid>
      </List>
      
      {/* Reusable Action Dialog */}
      <ActionDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        record={selectedRecord}
        resource="poi"
        title="POI Actions"
        subtitle="What would you like to do with this Point of Interest?"
      />
    </>
  );
};

// Edit component for POIs
export const PoiEdit = (props) => {
  const { availableLocales, currentLocale } = useLocale();
  
  return (
    <Edit {...props} title="Edit Point of Interest" actions={false}>
      <SimpleForm>
        <TextInput disabled source="id" />
        <SelectInput 
          source="locale" 
          choices={availableLocales.map(locale => ({ 
            id: locale.code, 
            name: `${locale.flag} ${locale.name} (${locale.code})` 
          }))} 
          defaultValue={currentLocale}
          helperText="Select the language version to edit"
          fullWidth
        />
        <TextInput source="label" validate={[required()]} fullWidth />
        <TextInput source="slug" validate={[required()]} fullWidth helperText="Unique identifier for URL" />
        <SelectInput source="type" choices={[
          { id: 'restaurant', name: 'Restaurant' },
          { id: 'attraction', name: 'Attraction' },
        ]} validate={[required()]} />
        <TextInput source="address" fullWidth />
        <TextInput source="highlight" multiline rows={3} fullWidth helperText="Short description or highlight" />
        <TextInput source="externalURL" fullWidth helperText="External website URL" />
        <TextInput source="addressURL" fullWidth helperText="Google Maps or other map URL" />
        <TextInput source="dial" helperText="Phone number" />
        <TextInput source="laxyURL" fullWidth helperText="Internal Laxy URL" />
        <TextInput source="addressEmbedHTML" multiline rows={4} fullWidth helperText="Embed HTML for maps" />
        <TextInput source="nativeLanguageCode" defaultValue="ja" helperText="Language code (e.g., ja, en)" />
      </SimpleForm>
    </Edit>
  );
};

// Show component for POIs
export const PoiShow = (props) => {
  const { currentLocale } = useLocale();
  
  return (
    <Show {...props}>
      <Box sx={{ maxWidth: 1000, margin: '0 auto', padding: 3 }}>
        {/* Header Section */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 4, 
          marginBottom: 4,
          padding: 3,
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {/* Cover Photo */}
          <Box sx={{ flex: '0 0 auto' }}>
            <FunctionField 
              render={record => {
                if (record.coverPhoto) {
                  const imageUrl = record.coverPhoto.url || record.coverPhoto.formats?.large?.url || record.coverPhoto.formats?.medium?.url || record.coverPhoto.formats?.small?.url;
                  return imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt="Cover" 
                      style={{ 
                        width: '300px', 
                        height: '200px', 
                        objectFit: 'cover', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }} 
                    />
                  ) : (
                    <Box sx={{
                      width: '300px',
                      height: '200px',
                      backgroundColor: '#e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '12px',
                      fontSize: '48px'
                    }}>
                      📷
                    </Box>
                  );
                }
                return (
                  <Box sx={{
                    width: '300px',
                    height: '200px',
                    backgroundColor: '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    fontSize: '48px'
                  }}>
                    📷
                  </Box>
                );
              }} 
            />
          </Box>

          {/* Main Info */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ marginBottom: 2 }}>
              <FunctionField 
                render={record => {
                  const locale = record.locale || currentLocale;
                  const flag = locale === 'en' ? '🇺🇸' : 
                              locale === 'zh-Hant' ? '🇹🇼' : 
                              locale === 'zh-Hans' ? '🇨🇳' : 
                              locale === 'ko' ? '🇰🇷' : 
                              locale === 'ja' ? '🇯🇵' : '🌐';
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                      <span style={{ fontSize: '24px' }}>{flag}</span>
                      <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>{locale}</span>
                    </Box>
                  );
                }} 
              />
            </Box>
            
            <TextField 
              source="label" 
              sx={{ 
                '& .MuiTypography-root': { 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: '#1976d2',
                  marginBottom: 1
                } 
              }} 
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2 }}>
              <FunctionField 
                render={record => {
                  const emoji = record.type === 'restaurant' ? '🍴' : record.type === 'attraction' ? '🎯' : '📍';
                  const typeLabel = record.type === 'restaurant' ? 'Restaurant' : record.type === 'attraction' ? 'Attraction' : record.type;
                  return (
                    <Chip
                      label={`${emoji} ${typeLabel}`}
                      sx={{ 
                        fontSize: '14px', 
                        fontWeight: '600',
                        height: '32px'
                      }}
                    />
                  );
                }}
              />
              <TextField 
                source="slug" 
                sx={{ 
                  '& .MuiTypography-root': { 
                    fontSize: '12px', 
                    color: '#666',
                    fontFamily: 'monospace',
                    backgroundColor: '#f0f0f0',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  } 
                }} 
              />
            </Box>

            <FunctionField 
              render={record => record.highlight ? (
                <Box sx={{ 
                  fontSize: '16px', 
                  color: '#555', 
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                  padding: 2,
                  backgroundColor: '#f0f7ff',
                  borderLeft: '4px solid #1976d2',
                  borderRadius: '0 8px 8px 0'
                }}>
                  "{record.highlight}"
                </Box>
              ) : null} 
            />
          </Box>
        </Box>

        {/* Contact & Location Section */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
          gap: 3, 
          marginBottom: 4 
        }}>
          {/* Contact Info */}
          <Box sx={{ 
            padding: 3, 
            backgroundColor: 'white', 
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
          }}>
            <Box sx={{ fontSize: '18px', fontWeight: '600', marginBottom: 2, color: '#1976d2' }}>
              📞 Contact Information
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FunctionField 
                render={record => record.dial ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontSize: '16px' }}>📞</span>
                    <span style={{ fontSize: '16px', fontWeight: '500' }}>{record.dial}</span>
                  </Box>
                ) : null} 
              />
              
              <FunctionField 
                render={record => record.externalURL ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontSize: '16px' }}>🌐</span>
                    <a 
                      href={record.externalURL} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        color: '#1976d2', 
                        textDecoration: 'none',
                        fontSize: '14px'
                      }}
                    >
                      {record.externalURL.length > 40 ? `${record.externalURL.substring(0, 40)}...` : record.externalURL}
                    </a>
                  </Box>
                ) : null} 
              />

              <FunctionField 
                render={record => record.laxyURL ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontSize: '16px' }}>🔗</span>
                    <span style={{ fontSize: '14px', color: '#666' }}>Laxy URL: {record.laxyURL}</span>
                  </Box>
                ) : null} 
              />
            </Box>
          </Box>

          {/* Location Info */}
          <Box sx={{ 
            padding: 3, 
            backgroundColor: 'white', 
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
          }}>
            <Box sx={{ fontSize: '18px', fontWeight: '600', marginBottom: 2, color: '#1976d2' }}>
              📍 Location
            </Box>
            
            <FunctionField 
              render={record => record.address ? (
                <Box sx={{ 
                  fontSize: '16px', 
                  lineHeight: 1.6, 
                  marginBottom: 2,
                  padding: 2,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 1
                }}>
                  {record.address}
                </Box>
              ) : (
                <Box sx={{ color: '#999', fontStyle: 'italic' }}>No address available</Box>
              )} 
            />

            <FunctionField 
              render={record => record.addressURL ? (
                <Box sx={{ marginTop: 2 }}>
                  <a 
                    href={record.addressURL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: '#1976d2', 
                      textDecoration: 'none',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    🗺️ View on Map
                  </a>
                </Box>
              ) : null} 
            />
          </Box>
        </Box>

        {/* Tags Section */}
        <Box sx={{ 
          padding: 3, 
          backgroundColor: 'white', 
          borderRadius: 2, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: 4
        }}>
          <Box sx={{ fontSize: '18px', fontWeight: '600', marginBottom: 2, color: '#1976d2' }}>
            🏷️ Tags
          </Box>
          
          <FunctionField 
            render={record => {
              if (record.tag_labels && Array.isArray(record.tag_labels) && record.tag_labels.length > 0) {
                return (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {record.tag_labels.map((tag, index) => (
                      <span 
                        key={index} 
                        style={{ 
                          backgroundColor: '#e3f2fd', 
                          color: '#1976d2', 
                          padding: '8px 16px', 
                          borderRadius: '16px', 
                          fontSize: '14px',
                          fontWeight: '500',
                          border: '2px solid #bbdefb'
                        }}
                      >
                        {tag.name || tag.label || tag.title || 'Tag'}
                      </span>
                    ))}
                  </Box>
                );
              }
              return (
                <Box sx={{ color: '#999', fontStyle: 'italic' }}>
                  No tags assigned
                </Box>
              );
            }} 
          />
        </Box>

        {/* Map Embed Section */}
        <FunctionField 
          render={record => record.addressEmbedHTML ? (
            <Box sx={{ 
              padding: 3, 
              backgroundColor: 'white', 
              borderRadius: 2, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: 4
            }}>
              <Box sx={{ fontSize: '18px', fontWeight: '600', marginBottom: 2, color: '#1976d2' }}>
                🗺️ Map
              </Box>
              <Box sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <div dangerouslySetInnerHTML={{ __html: record.addressEmbedHTML }} />
              </Box>
            </Box>
          ) : null} 
        />

        {/* Technical Details */}
        <Box sx={{ 
          padding: 3, 
          backgroundColor: '#f8f9fa', 
          borderRadius: 2, 
          border: '1px solid #e0e0e0'
        }}>
          <Box sx={{ fontSize: '16px', fontWeight: '600', marginBottom: 2, color: '#666' }}>
            📋 Technical Details
          </Box>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, 
            gap: 2,
            fontSize: '14px'
          }}>
            <Box>
              <strong>Document ID:</strong>
              <br />
              <TextField source="documentId" sx={{ '& .MuiTypography-root': { fontSize: '12px', fontFamily: 'monospace' } }} />
            </Box>
            <Box>
              <strong>Numeric ID:</strong>
              <br />
              <TextField source="numericId" sx={{ '& .MuiTypography-root': { fontSize: '12px', fontFamily: 'monospace' } }} />
            </Box>
            <Box>
              <strong>Language Code:</strong>
              <br />
              <TextField source="nativeLanguageCode" sx={{ '& .MuiTypography-root': { fontSize: '12px', fontFamily: 'monospace' } }} />
            </Box>
            <Box>
              <strong>Created:</strong>
              <br />
              <DateField source="createdAt" locales="en-GB" sx={{ '& .MuiTypography-root': { fontSize: '12px' } }} />
            </Box>
            <Box>
              <strong>Updated:</strong>
              <br />
              <DateField source="updatedAt" locales="en-GB" sx={{ '& .MuiTypography-root': { fontSize: '12px' } }} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Show>
  );
};

// Create component for POIs
export const PoiCreate = (props) => {
  const { availableLocales, currentLocale } = useLocale();
  
  return (
    <Create {...props} title="Create New Point of Interest">
      <SimpleForm>
        <SelectInput 
          source="locale" 
          choices={availableLocales.map(locale => ({ 
            id: locale.code, 
            name: `${locale.flag} ${locale.name} (${locale.code})` 
          }))} 
          defaultValue={currentLocale}
          helperText="Select the language for this POI entry"
          fullWidth
        />
        <TextInput source="label" validate={[required()]} fullWidth />
        <TextInput source="slug" validate={[required()]} fullWidth helperText="Unique identifier for URL (e.g., tokyo-tower)" />
        <SelectInput source="type" choices={[
          { id: 'restaurant', name: 'Restaurant' },
          { id: 'attraction', name: 'Attraction' },
        ]} validate={[required()]} defaultValue="attraction" />
        <TextInput source="address" fullWidth />
        <TextInput source="highlight" multiline rows={3} fullWidth helperText="Short description or highlight" />
        <TextInput source="externalURL" fullWidth helperText="External website URL" />
        <TextInput source="addressURL" fullWidth helperText="Google Maps or other map URL" />
        <TextInput source="dial" helperText="Phone number" />
        <TextInput source="laxyURL" fullWidth helperText="Internal Laxy URL" />
        <TextInput source="addressEmbedHTML" multiline rows={4} fullWidth helperText="Embed HTML for maps (optional)" />
        <TextInput source="nativeLanguageCode" defaultValue="ja" helperText="Language code (e.g., ja, en)" />
      </SimpleForm>
    </Create>
  );
};
