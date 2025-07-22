import React from 'react';
import { Admin, Resource, ListGuesser, EditGuesser, ShowGuesser } from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';
import { Dashboard } from './Dashboard';
import { UserList, UserEdit, UserShow } from './users';
import { PostList, PostEdit, PostShow, PostCreate } from './posts';
import PersonIcon from '@mui/icons-material/Person';
import PostAddIcon from '@mui/icons-material/PostAdd';
import './App.css';

// Mock data provider - you can replace this with your actual API
const dataProvider = jsonServerProvider('https://jsonplaceholder.typicode.com');

function App() {
  return (
    <Admin 
      dataProvider={dataProvider} 
      dashboard={Dashboard}
      title="Laxy Studio Dashboard"
    >
      <Resource 
        name="users" 
        list={UserList} 
        edit={UserEdit} 
        show={UserShow} 
        icon={PersonIcon}
      />
      <Resource 
        name="posts" 
        list={PostList} 
        edit={PostEdit} 
        show={PostShow} 
        create={PostCreate}
        icon={PostAddIcon}
      />
    </Admin>
  );
}

export default App;
