import { TestBed } from '@angular/core/testing';

import { BokService } from './bok.service';

describe('BokService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BokService = TestBed.get(BokService);
    expect(service).toBeTruthy();
  });
});
