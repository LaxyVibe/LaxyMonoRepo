import React from 'react';
import { Card, CardContent, CardHeader } from '@mui/material';
import { Title } from 'react-admin';

export const Dashboard = () => (
  <div>
    <Title title="Laxy Studio Dashboard" />
    <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
      <Card>
        <CardHeader 
          title="🎉 Hello World!" 
          subheader="Welcome to Laxy Studio"
          style={{ background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)' }}
        />
        <CardContent>
          <h3>🚀 Your creative development platform is ready!</h3>
          <p>Built with React Admin framework, powered by Vite, deployed on Netlify</p>
          <ul>
            <li>✨ Modern React Admin UI</li>
            <li>🎨 Material-UI Components</li>
            <li>⚡ Lightning Fast Development</li>
            <li>🌐 Deploy Ready</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader 
          title="📊 Dashboard Features" 
          subheader="What you can do here"
          style={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}
        />
        <CardContent>
          <h4>Admin Panel Features:</h4>
          <ul>
            <li>📝 Create, Read, Update, Delete posts</li>
            <li>📋 List view with filtering</li>
            <li>📖 Detailed show pages</li>
            <li>✏️ Form-based editing</li>
            <li>🔍 Search functionality</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader 
          title="🎯 Quick Actions" 
          subheader="Get started quickly"
          style={{ background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)' }}
        />
        <CardContent>
          <h4>Try these features:</h4>
          <ul>
            <li>🆕 Click "Hello World Posts" to see the list</li>
            <li>➕ Create new posts</li>
            <li>👁️ View post details</li>
            <li>✏️ Edit existing posts</li>
            <li>🗑️ Delete posts (with confirmation)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  </div>
);
