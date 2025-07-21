import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock react-admin components for testing
jest.mock('react-admin', () => ({
  Admin: ({ children }) => <div data-testid="admin">{children}</div>,
  Resource: () => <div data-testid="resource" />,
  ListGuesser: () => <div>ListGuesser</div>,
  EditGuesser: () => <div>EditGuesser</div>,
  ShowGuesser: () => <div>ShowGuesser</div>,
}));

jest.mock('ra-data-json-server', () => {
  return jest.fn(() => ({
    getList: jest.fn(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getManyReference: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  }));
});

test('renders LaxyStudio admin', () => {
  render(<App />);
  const adminElement = screen.getByTestId('admin');
  expect(adminElement).toBeInTheDocument();
});
