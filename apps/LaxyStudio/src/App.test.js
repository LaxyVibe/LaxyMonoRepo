import { render, screen } from '@testing-library/react';
import App from './App';

test('renders hello world', () => {
  render(<App />);
  const helloElement = screen.getByText(/Hello World!/i);
  expect(helloElement).toBeInTheDocument();
});

test('renders welcome message', () => {
  render(<App />);
  const welcomeElement = screen.getByText(/Welcome to Laxy Studio/i);
  expect(welcomeElement).toBeInTheDocument();
});

test('renders feature cards', () => {
  render(<App />);
  const fastDevElement = screen.getByText(/Fast Development/i);
  const modernDesignElement = screen.getByText(/Modern Design/i);
  const deployReadyElement = screen.getByText(/Deploy Ready/i);
  
  expect(fastDevElement).toBeInTheDocument();
  expect(modernDesignElement).toBeInTheDocument();
  expect(deployReadyElement).toBeInTheDocument();
});
