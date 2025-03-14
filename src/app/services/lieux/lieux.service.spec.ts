import { TestBed } from '@angular/core/testing';

import { LieuxService } from './lieux.service';

describe('LieuxService', () => {
  let service: LieuxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LieuxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
