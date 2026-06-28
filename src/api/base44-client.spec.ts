import { TestBed } from '@angular/core/testing';

import { Base44Client } from './base44-client';

describe('Base44Client', () => {
  let service: Base44Client;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Base44Client);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
