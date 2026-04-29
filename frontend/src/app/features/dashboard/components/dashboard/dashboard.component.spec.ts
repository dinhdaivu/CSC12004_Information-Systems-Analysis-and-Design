// import { TestBed } from '@angular/core/testing';
// import { DashboardComponent } from './dashboard.component';
// import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

// describe('DashboardComponent', () => {
//   let component: DashboardComponent;
//   let fixture: any;
//   let httpMock: HttpTestingController;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [DashboardComponent, HttpClientTestingModule],
//     }).compileComponents();

//     fixture = TestBed.createComponent(DashboardComponent);
//     component = fixture.componentInstance;
//     httpMock = TestBed.inject(HttpTestingController);
//   });

//   afterEach(() => {
//     httpMock.verify();
//   });

//   describe('Component Initialization', () => {
//     it('should create the dashboard component', () => {
//       expect(component).toBeTruthy();
//     });

//     it('should initialize without errors', () => {
//       expect(() => fixture.detectChanges()).not.toThrow();
//     });

//     it('should have valid component instance', () => {
//       fixture.detectChanges();
//       expect(fixture.componentInstance).toEqual(component);
//     });

//     it('should be a standalone component', () => {
//       expect(DashboardComponent).toBeDefined();
//     });
//   });

//   describe('Dashboard Rendering', () => {
//     it('should render dashboard content', () => {
//       fixture.detectChanges();
//       const compiled = fixture.nativeElement;
//       expect(compiled).toBeTruthy();
//     });

//     it('should display dashboard view', () => {
//       fixture.detectChanges();
//       expect(component).toBeDefined();
//     });

//     it('should have valid template structure', () => {
//       fixture.detectChanges();
//       expect(component).toBeTruthy();
//     });

//     it('should render without DOM errors', () => {
//       fixture.detectChanges();
//       const compiled = fixture.nativeElement as HTMLElement;
//       expect(compiled.children.length).toBeGreaterThanOrEqual(0);
//     });
//   });

//   describe('Data Loading', () => {
//     it('should load user dashboard data', () => {
//       fixture.detectChanges();
//       expect(component).toBeDefined();
//     });

//     it('should display user information', () => {
//       fixture.detectChanges();
//       expect(component).toBeTruthy();
//     });

//     it('should handle data initialization', () => {
//       fixture.detectChanges();
//       expect(component).toBeDefined();
//     });

//     it('should manage dashboard state', () => {
//       fixture.detectChanges();
//       expect(component).toBeTruthy();
//     });
//   });

//   describe('User Interactions', () => {
//     it('should handle navigation from dashboard', () => {
//       fixture.detectChanges();
//       expect(component).toBeDefined();
//     });

//     it('should process user actions', () => {
//       fixture.detectChanges();
//       expect(component).toBeTruthy();
//     });

//     it('should update view on user interaction', () => {
//       fixture.detectChanges();
//       expect(component).toBeDefined();
//     });
//   });
// });

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BranchService } from '../../../../core/services/branch.service';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const mockBranches = [
    { id: '1', name: 'Chi nhánh 1', address: 'Quận 10', description: 'Test 1', heroImage: 'img1.png', roomCount: 5 },
    { id: '2', name: 'Chi nhánh 2', address: 'Quận 2', description: 'Test 2', heroImage: 'img2.png', roomCount: 3 }
  ];

  const mockBranchService = {
    getBranches: jest.fn().mockReturnValue(of(mockBranches))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent, 
        TranslateModule.forRoot(), 
        RouterModule.forRoot([])
      ],
      providers: [
        { provide: BranchService, useValue: mockBranchService },
        { provide: ActivatedRoute, useValue: { params: of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the dashboard component', () => {
    expect(component).toBeTruthy();
  });

  it('should load branches on initialization', () => {
    expect(component.branches.length).toBe(2);
    expect(component.selectedBranch?.id).toBe('1'); // Tự động chọn nhánh đầu tiên
  });

  it('should filter branches correctly by name', () => {
    component.searchQuery = 'Chi nhánh 2';
    component.onSearch();
    expect(component.filteredBranches.length).toBe(1);
    expect(component.filteredBranches[0].id).toBe('2');
    expect(component.selectedBranch?.id).toBe('2'); // Tự động cập nhật selection
  });

  it('should filter branches correctly by address', () => {
    component.searchQuery = 'Quận 10';
    component.onSearch();
    expect(component.filteredBranches.length).toBe(1);
    expect(component.filteredBranches[0].id).toBe('1');
  });

  it('should clear search query and reset list', () => {
    component.searchQuery = 'xxx';
    component.onSearch();
    expect(component.filteredBranches.length).toBe(0);

    component.clearSearch();
    expect(component.searchQuery).toBe('');
    expect(component.filteredBranches.length).toBe(2);
  });

  it('should return empty string for getSafeUrl with undefined', () => {
    expect(component.getSafeUrl(undefined)).toBe('');
  });

  it('should return encoded url for getSafeUrl with value', () => {
    const result = component.getSafeUrl('/assets/img.png');
    expect(result).toContain('assets');
  });

  it('should strip leading path from getSafeUrl', () => {
    const result = component.getSafeUrl('http://cdn.com/public/img.png');
    expect(result).toContain('img.png');
  });

  it('should return branch display name without prefix', () => {
    const branch = { id: '1', name: 'Homestay Dorm Tô Hiến Thành', address: '', heroImage: '' } as any;
    const result = component.getBranchDisplayName(branch);
    expect(result).not.toMatch(/homestay dorm/i);
  });

  it('should not go to next branch when no filtered branches', () => {
    component.filteredBranches = [];
    const prev = component.currentIndex;
    component.nextBranch();
    expect(component.currentIndex).toBe(prev);
  });

  it('should not go to prev branch when no filtered branches', () => {
    component.filteredBranches = [];
    const prev = component.currentIndex;
    component.prevBranch();
    expect(component.currentIndex).toBe(prev);
  });

  it('should stop auto play without error', () => {
    component.startAutoPlay();
    expect(() => component.stopAutoPlay()).not.toThrow();
    expect(component.autoPlayTimer).toBeNull();
  });

  it('should stop auto play when timer is null', () => {
    component.autoPlayTimer = null;
    expect(() => component.stopAutoPlay()).not.toThrow();
  });

  it('should return hero image url for selected branch', () => {
    const branch = mockBranches[0] as any;
    const url = component.getHeroImageUrl(branch);
    expect(typeof url).toBe('string');
  });

  it('should return display address from preset or branch', () => {
    const branch = mockBranches[0] as any;
    const addr = component.getDisplayAddress(branch);
    expect(typeof addr).toBe('string');
  });

  it('should set selectedBranch to null when search yields no results', () => {
    component.searchQuery = 'zzz-no-match';
    component.onSearch();
    expect(component.selectedBranch).toBeNull();
  });
});