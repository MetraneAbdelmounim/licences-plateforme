import { TestBed } from '@angular/core/testing';

import { PasswordChangedGuardService } from './password-changed-guard.service';

describe('PasswordChangedGuardService', () => {
  let service: PasswordChangedGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordChangedGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
