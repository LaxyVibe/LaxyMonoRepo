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
  ChipField,
  BooleanField,
  DateField,
  required,
} from 'react-admin';

// Filter component for the list
const PostFilter = (props) => (
  <Filter {...props}>
    <SearchInput placeholder="Search title or message" source="q" alwaysOn />
    <SelectInput source="status" choices={[
      { id: 'active', name: 'Active' },
      { id: 'draft', name: 'Draft' },
    ]} />
  </Filter>
);

// List component
export const HelloWorldList = (props) => (
  <List {...props} filters={<PostFilter />} title="Hello World Posts">
    <Datagrid>
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="message" />
      <ChipField source="status" />
      <ShowButton />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// Edit component
export const HelloWorldEdit = (props) => (
  <Edit {...props} title="Edit Hello World Post">
    <SimpleForm>
      <TextInput disabled source="id" />
      <TextInput source="title" validate={[required()]} />
      <TextInput source="message" multiline rows={4} />
      <SelectInput source="status" choices={[
        { id: 'active', name: 'Active' },
        { id: 'draft', name: 'Draft' },
      ]} />
    </SimpleForm>
  </Edit>
);

// Show component
export const HelloWorldShow = (props) => (
  <Show {...props} title="Hello World Post Details">
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="message" />
      <ChipField source="status" />
    </SimpleShowLayout>
  </Show>
);

// Create component
export const HelloWorldCreate = (props) => (
  <Create {...props} title="Create New Hello World Post">
    <SimpleForm>
      <TextInput source="title" validate={[required()]} />
      <TextInput source="message" multiline rows={4} />
      <SelectInput source="status" choices={[
        { id: 'active', name: 'Active' },
        { id: 'draft', name: 'Draft' },
      ]} defaultValue="draft" />
    </SimpleForm>
  </Create>
);
