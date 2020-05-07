import { TestBed } from '@angular/core/testing';

import { EscoCompetenceService } from './esco-competence.service';

describe('EscoCompetenceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EscoCompetenceService = TestBed.get(EscoCompetenceService);
    expect(service).toBeTruthy();
  });
});
