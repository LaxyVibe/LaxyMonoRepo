import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  EditButton,
  ShowButton,
  DeleteButton,
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
  
  return (
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
            }
          }
        }}
        rowClick="show"
      >
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
              <ChipField 
                source="type" 
                record={record}
                sx={{ 
                  '& .MuiChip-root': { 
                    height: '24px', 
                    fontSize: '11px',
                    fontWeight: '500'
                  } 
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
  );
};

// Edit component for POIs
export const PoiEdit = (props) => {
  const { availableLocales, currentLocale } = useLocale();
  
  return (
    <Edit {...props} title="Edit Point of Interest">
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
    <Show {...props} title="Point of Interest Details">
      <SimpleShowLayout>
        <TextField source="documentId" label="Document ID" />
        <TextField source="numericId" label="Numeric ID" />
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
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                <span>{flag}</span>
                <span>{locale}</span>
              </span>
            );
          }} 
        />
        <TextField source="label" />
        <TextField source="slug" />
        <ChipField source="type" />
        <TextField source="address" />
        <TextField source="highlight" />
        <TextField source="externalURL" />
        <UrlField source="addressURL" />
        <TextField source="dial" />
        <TextField source="laxyURL" />
        <TextField source="nativeLanguageCode" />
        <FunctionField 
          label="Address Embed" 
          render={record => record.addressEmbedHTML 
            ? <div dangerouslySetInnerHTML={{ __html: record.addressEmbedHTML }} />
            : '-'
          } 
        />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
      <FunctionField 
        label="Cover Photo" 
        render={record => {
          if (record.coverPhoto) {
            // Handle both Strapi v4 and v5 formats
            const imageUrl = record.coverPhoto.url || record.coverPhoto.formats?.large?.url || record.coverPhoto.formats?.medium?.url || record.coverPhoto.formats?.small?.url;
            return imageUrl ? <img src={imageUrl} alt="Cover" style={{ maxWidth: '300px', height: 'auto', borderRadius: '8px' }} /> : 'Cover photo available but no URL found';
          }
          return 'No cover photo';
        }} 
      />
      <FunctionField 
        label="Tag Labels" 
        render={record => {
          if (record.tag_labels && Array.isArray(record.tag_labels)) {
            return (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {record.tag_labels.map((tag, index) => (
                  <span 
                    key={index} 
                    style={{ 
                      backgroundColor: '#e3f2fd', 
                      color: '#1976d2', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px' 
                    }}
                  >
                    {tag.name || tag.label || tag.title || 'Tag'}
                  </span>
                ))}
              </div>
            );
          }
          return 'No tags';
        }} 
      />
    </SimpleShowLayout>
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
