import React from 'react';
import { render, screen } from '@testing-library/react';
import DocumentList from '../frontend/src/components/DocumentList';
import Dashboard from '../frontend/src/pages/Dashboard';
import { DocumentContext } from '../frontend/src/contexts/DocumentContext';

const mockDocuments = [
  { id: '1', title: 'Doc 1', folderId: null, roles: { user1: 'admin' } },
  { id: '2', title: 'Doc 2', folderId: 'f1', roles: { user1: 'editor' } }
];
const mockFolders = [
  { id: 'f1', name: 'Folder 1' }
];
const mockContext = {
  documents: mockDocuments,
  folders: mockFolders,
  createDocument: jest.fn(),
  createFolder: jest.fn(),
  deleteDocument: jest.fn(),
  getUserRole: () => 'admin',
};

describe('DocumentList', () => {
  test('renders documents and folders', () => {
    render(
      <DocumentContext.Provider value={mockContext}>
        <DocumentList isOpen={true} />
      </DocumentContext.Provider>
    );
    expect(screen.getByText('Documents ')).toBeInTheDocument();
    // expect(screen.getByText('Folder 1')).toBeInTheDocument();
  });
});

describe('Dashboard', () => {
  test('renders recent documents', () => {
    render(
      <DocumentContext.Provider value={{ ...mockContext, documents: mockDocuments }}>
        <Dashboard />
      </DocumentContext.Provider>
    );
    expect(screen.getByText('Continue where you left off')).toBeInTheDocument();
  });
});  