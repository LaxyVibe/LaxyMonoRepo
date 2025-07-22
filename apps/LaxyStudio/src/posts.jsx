import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    ReferenceField,
    Edit,
    SimpleForm,
    TextInput,
    ReferenceInput,
    SelectInput,
    Show,
    SimpleShowLayout,
    Create,
    EditButton,
    ShowButton,
    DeleteButton,
} from 'react-admin';

export const PostList = () => (
    <List>
        <Datagrid rowClick="show">
            <TextField source="id" />
            <TextField source="title" />
            <ReferenceField source="userId" reference="users">
                <TextField source="name" />
            </ReferenceField>
            <ShowButton />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export const PostEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="title" fullWidth />
            <TextInput source="body" multiline rows={5} fullWidth />
            <ReferenceInput source="userId" reference="users">
                <SelectInput optionText="name" />
            </ReferenceInput>
        </SimpleForm>
    </Edit>
);

export const PostShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="title" />
            <TextField source="body" />
            <ReferenceField source="userId" reference="users">
                <TextField source="name" />
            </ReferenceField>
        </SimpleShowLayout>
    </Show>
);

export const PostCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="title" fullWidth />
            <TextInput source="body" multiline rows={5} fullWidth />
            <ReferenceInput source="userId" reference="users">
                <SelectInput optionText="name" />
            </ReferenceInput>
        </SimpleForm>
    </Create>
);
