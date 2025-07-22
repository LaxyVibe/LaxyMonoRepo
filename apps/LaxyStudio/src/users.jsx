import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    EmailField,
    Edit,
    SimpleForm,
    TextInput,
    Show,
    SimpleShowLayout,
    ReferenceField,
    EditButton,
    ShowButton,
} from 'react-admin';

export const UserList = () => (
    <List>
        <Datagrid rowClick="show">
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="username" />
            <EmailField source="email" />
            <TextField source="phone" />
            <TextField source="website" />
            <ShowButton />
            <EditButton />
        </Datagrid>
    </List>
);

export const UserEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="name" />
            <TextInput source="username" />
            <TextInput source="email" type="email" />
            <TextInput source="phone" />
            <TextInput source="website" />
        </SimpleForm>
    </Edit>
);

export const UserShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="username" />
            <EmailField source="email" />
            <TextField source="phone" />
            <TextField source="website" />
            <TextField source="address.street" label="Street" />
            <TextField source="address.city" label="City" />
            <TextField source="address.zipcode" label="ZIP Code" />
            <TextField source="company.name" label="Company" />
        </SimpleShowLayout>
    </Show>
);
