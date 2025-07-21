import React from 'react';
import { Card, CardContent, CardHeader } from '@mui/material';
import { Title } from 'react-admin';

export const Dashboard = () => (
  <div>
    <Title title="Welcome to LaxyStudio" />
    <Card>
      <CardHeader title="🎉 Welcome to LaxyStudio Dashboard!" />
      <CardContent>
        <div style={{ margin: '1em' }}>
          <h2>Hello World! 👋</h2>
          <p>
            Welcome to <strong>LaxyStudio</strong> - your new React Admin dashboard!
          </p>
          <p>
            This is a beautiful and modern admin interface built with React Admin framework.
            You can manage your data through the sidebar navigation:
          </p>
          <ul>
            <li><strong>Users</strong> - Manage user accounts and profiles</li>
            <li><strong>Posts</strong> - Create, edit, and view blog posts</li>
            <li><strong>Comments</strong> - View and moderate user comments</li>
          </ul>
          <p>
            The dashboard is connected to a demo JSON API (JSONPlaceholder) to show real data interactions.
          </p>
          <div style={{ 
            marginTop: '2em', 
            padding: '1em', 
            backgroundColor: '#e3f2fd', 
            borderRadius: '8px',
            border: '1px solid #2196f3'
          }}>
            <strong>🚀 Getting Started:</strong>
            <br />
            Click on "Users" or "Posts" in the sidebar to start exploring the admin interface!
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default Dashboard;
