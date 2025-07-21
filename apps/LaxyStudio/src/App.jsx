import React from 'react';
import { Admin, Resource, ListGuesser, EditGuesser, ShowGuesser } from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';
import { Dashboard } from './components/Dashboard';
import { UserList, UserEdit, UserShow } from './components/users';
import { PostList, PostEdit, PostShow, PostCreate } from './components/posts';
import PersonIcon from '@mui/icons-material/Person';
import PostAddIcon from '@mui/icons-material/PostAdd';

// Create a fake data provider that simulates a JSON server
const dataProvider = jsonServerProvider('https://jsonplaceholder.typicode.com');

const App = () => (
  <Admin dashboard={Dashboard} dataProvider={dataProvider}>
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
    <Resource name="comments" list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
  </Admin>
);

export default App;
