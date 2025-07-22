import React from 'react';
import { Admin, Resource, ListGuesser, EditGuesser, ShowGuesser } from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';
import { Dashboard } from './Dashboard';
import { HelloWorldList, HelloWorldEdit, HelloWorldShow, HelloWorldCreate } from './HelloWorld';
import './App.css';

// Mock data provider for demo purposes
const mockDataProvider = {
  getList: () => Promise.resolve({
    data: [
      { id: 1, title: 'Hello World!', message: 'Welcome to Laxy Studio Dashboard', status: 'active' },
      { id: 2, title: 'React Admin', message: 'Powered by React Admin Framework', status: 'active' },
      { id: 3, title: 'Modern UI', message: 'Beautiful Material-UI components', status: 'draft' },
    ],
    total: 3,
  }),
  getOne: (resource, params) => Promise.resolve({
    data: { id: params.id, title: 'Hello World!', message: 'Welcome to Laxy Studio Dashboard', status: 'active' }
  }),
  getMany: () => Promise.resolve({ data: [] }),
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  create: (resource, params) => Promise.resolve({ data: { ...params.data, id: Date.now() } }),
  update: (resource, params) => Promise.resolve({ data: params.data }),
  updateMany: () => Promise.resolve({ data: [] }),
  delete: () => Promise.resolve({ data: {} }),
  deleteMany: () => Promise.resolve({ data: [] }),
};

function App() {
  return (
    <Admin 
      dataProvider={mockDataProvider} 
      dashboard={Dashboard}
      title="Laxy Studio Dashboard"
    >
      <Resource 
        name="posts" 
        list={HelloWorldList} 
        edit={HelloWorldEdit} 
        show={HelloWorldShow} 
        create={HelloWorldCreate}
        options={{ label: 'Hello World Posts' }}
      />
    </Admin>
  );
}

export default App;
