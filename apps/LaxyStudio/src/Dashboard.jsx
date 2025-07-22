import React from 'react';
import { Card, CardContent, CardHeader } from '@mui/material';

export const Dashboard = () => (
    <div style={{ padding: '20px' }}>
        <h1>🚀 Welcome to Laxy Studio Dashboard!</h1>
        <p>Your creative development platform is ready for action!</p>
        
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginTop: '20px' }}>
            <Card>
                <CardHeader title="👥 Users Management" />
                <CardContent>
                    <p>Manage your users, view profiles, and handle user permissions.</p>
                    <p><strong>Quick Actions:</strong> View all users, edit profiles, manage roles</p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader title="📝 Posts & Content" />
                <CardContent>
                    <p>Create, edit, and manage all your content and posts.</p>
                    <p><strong>Quick Actions:</strong> Create new posts, edit existing content, moderate comments</p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader title="📊 Analytics" />
                <CardContent>
                    <p>Track your performance with detailed analytics and insights.</p>
                    <p><strong>Coming Soon:</strong> User engagement metrics, content performance, growth trends</p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader title="⚙️ Settings" />
                <CardContent>
                    <p>Configure your dashboard and application settings.</p>
                    <p><strong>Available:</strong> Theme preferences, notification settings, API configuration</p>
                </CardContent>
            </Card>
        </div>
        
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <h3>🎯 Getting Started</h3>
            <ul>
                <li>Navigate to <strong>Users</strong> to see sample user data</li>
                <li>Check out <strong>Posts</strong> to manage content</li>
                <li>Data is loaded from JSONPlaceholder API for demonstration</li>
                <li>All CRUD operations are available for testing</li>
            </ul>
        </div>
    </div>
);
