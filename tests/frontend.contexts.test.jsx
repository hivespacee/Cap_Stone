import { renderHook, act } from '@testing-library/react';
import { DocumentProvider, useDocuments } from '../frontend/src/contexts/DocumentContext';
import React from 'react';


describe('DocumentContext', () => {
  test('provides documents and folders', () => {
    const wrapper = ({ children }) => <DocumentProvider>{children}</DocumentProvider>;
    const { result } = renderHook(() => useDocuments(), { wrapper });
    expect(result.current).toHaveProperty('documents');
    expect(result.current).toHaveProperty('folders');
  });
});  