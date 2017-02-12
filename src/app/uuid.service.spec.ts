/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { UuidService } from './uuid.service';

describe('UuidService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UuidService]
    });
  });

  it('should ...', inject([UuidService], (service: UuidService) => {
    expect(service).toBeTruthy();
  }));
});
