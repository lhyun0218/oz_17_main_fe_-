import { describe, it, expect } from 'vitest';
import { queryClient } from '../queryClient';
import apiClient from '../axios';

describe('프로젝트 기반 설정', () => {
  it('QueryClient가 올바른 defaultOptions으로 생성된다', () => {
    const defaultOptions = queryClient.getDefaultOptions();
    expect(defaultOptions.queries?.staleTime).toBe(1000 * 60 * 5);
    expect(defaultOptions.queries?.retry).toBe(1);
  });

  it('Axios 인스턴스가 5초 타임아웃으로 생성된다', () => {
    expect(apiClient.defaults.timeout).toBe(5000);
  });
});
