import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GoogleMapsModule, GoogleMap, MapMarker } from '@angular/google-maps';
import { Store } from '@ngrx/store';
import { Observable, map, of } from 'rxjs';
import { CustomValidators } from '../../../../../shared/validators/custom-validators';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  take,
} from 'rxjs/operators';
import * as AuthSelectors from '../../../../auth/login/store/login.selectors';

import {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectWorker,
  ProjectStatus,
} from '../../models/project.models';
import * as ProjectActions from '../../store/project.actions';
import * as ProjectSelectors from '../../store/project.selectors';
import { WorkerService } from '../../../workers/services/worker.service';
import { SharedModalComponent } from '../../../../../shared/components/shared-modal/shared-modal.component';
import { ProjectService } from '../../services/project.service';

export interface SearchableWorker {
  id: string;
  name: string;
  email: string;
}

interface NormalizedLocation extends google.maps.places.AutocompletePrediction {
  mainText?: string;
  secondaryText?: string;
}

interface MapAutocompleteResponse {
  suggestions: {
    placePrediction: {
      placeId: string;
      text: { text: string } | string;
      description?: string;
      structuredFormat?: {
        mainText: { text: string };
        secondaryText: { text: string };
      };
      structured_formatting?: {
        main_text: string;
        secondary_text: string;
      };
      place_id?: string;
    };
  }[];
}

@Component({
  selector: 'app-project-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    GoogleMapsModule,
    SharedModalComponent,
  ],
  templateUrl: './project-modal.component.html',
  styleUrls: ['./project-modal.component.scss'],
})
export class ProjectModalComponent implements OnInit {
  @ViewChild(GoogleMap) googleMap!: GoogleMap;
  @ViewChild(MapMarker) mapMarker!: MapMarker;

  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly workerService = inject(WorkerService);
  private readonly projectService = inject(ProjectService);
  private readonly dialogRef = inject(MatDialogRef<ProjectModalComponent>);
  private readonly data = inject<Project | undefined>(MAT_DIALOG_DATA, {
    optional: true,
  });

  isCreating$ = this.store.select(ProjectSelectors.selectIsCreating);
  isUpdating$ = this.store.select(ProjectSelectors.selectIsUpdating);
  isEditing = !!this.data;
  minDate = new Date(); // To restrict selection to current/future dates
  currentUserId: string | null = null;

  statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
  ];

  // Maps configuration
  center: google.maps.LatLngLiteral = { lat: 28.6139, lng: 77.209 }; // Default to New Delhi
  zoom = 12;
  markerPosition: google.maps.LatLngLiteral = { ...this.center };
  markerOptions: google.maps.MarkerOptions = { draggable: true };
  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    maxZoom: 20,
    minZoom: 4,
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#263c3f' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#6b9a76' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#38414e' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212a37' }],
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9ca5b3' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#746855' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1f2835' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#f3d19c' }],
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }],
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#17263c' }],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#515c6d' }],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#17263c' }],
      },
    ],
  };

  // Observables
  filteredManagers$!: Observable<SearchableWorker[]>;
  filteredWorkers$!: Observable<SearchableWorker[]>;
  filteredLocations$!: Observable<NormalizedLocation[]>;
  selectedWorkers: SearchableWorker[] = [];
  selectedManager: SearchableWorker | null = null;

  // Form controls
  managerSearchControl = new FormControl('');
  workerSearchControl = new FormControl('');
  mapSearchControl = new FormControl('');

  // Main form
  projectForm = this.fb.group(
    {
      name: [
        this.data?.name || '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          CustomValidators.noWhitespace(),
        ],
      ],
      managerIds: [
        this.data?.managerIds || [],
        [Validators.required, Validators.minLength(1)],
      ],
      status: [this.data?.status || 'active'],
      description: [
        this.data?.description || '',
        [Validators.maxLength(1000), CustomValidators.noWhitespace()],
      ],
      startDate: [
        this.data?.startDate ? new Date(this.data.startDate) : new Date(),
        [
          Validators.required,
          ...(this.isEditing ? [] : [CustomValidators.futureOrTodayDate()]),
        ],
      ],
      endDate: [
        this.data?.dueDate ? new Date(this.data.dueDate) : new Date(),
        [
          Validators.required,
          ...(this.isEditing ? [] : [CustomValidators.futureOrTodayDate()]),
        ],
      ],
      budget: [this.data?.budget || null, [Validators.min(0)]],
      progress: [
        this.data?.progress || 0,
        [Validators.min(0), Validators.max(100)],
      ],
      latitude: [this.data?.latitude || null],
      longitude: [this.data?.longitude || null],
      // Renaming 'members' form control to 'workers'
      workers: [
        (this.data?.workers || []) as unknown as SearchableWorker[],
        [Validators.required, Validators.minLength(1)],
      ],
    },
    { validators: CustomValidators.dateRange('startDate', 'endDate') },
  );

  private autocompleteService: google.maps.places.AutocompleteService | null =
    null;
  private useNewAutocomplete = false;

  ngOnInit(): void {
    // Get current user to exclude from selection
    this.store
      .select(AuthSelectors.selectUser)
      .pipe(take(1))
      .subscribe((user) => {
        this.currentUserId = user?.id || null;
      });

    // Initialize Autocomplete Service
    this.initAutocompleteService();

    // If editing, setup initial state
    if (this.data) {
      if (this.data.latitude && this.data.longitude) {
        this.center = {
          lat: this.data.latitude,
          lng: this.data.longitude,
        };
        this.markerPosition = { ...this.center };
      }

      // Pre-fill selected workers by fetching from backend
      if (this.data.id) {
        this.projectService.getProjectWorkers(this.data.id).subscribe((workers) => {
          this.selectedWorkers = workers
            .filter((w) => w.role !== 'Admin')
            .map((w) => ({
              id: w.user?.id || w.userId,
              name: w.user?.fullName || w.user?.firstName || 'Unknown',
              email: w.user?.email || '',
            }));
          this.projectForm.patchValue({ workers: this.selectedWorkers });
        });
      }

      // Pre-fill manager name if exists by fetching professionals
      if (this.data.managerIds && this.data.managerIds.length > 0) {
        const managerId = this.data.managerIds[0];
        this.projectService.getProfessionals().subscribe((pros) => {
          const manager = pros.find(p => p.id === managerId);
          if (manager) {
            this.selectedManager = {
              id: manager.id,
              name: manager.fullName || manager.firstName,
              email: manager.email || ''
            };
            this.managerSearchControl.setValue('');
            this.projectForm.patchValue({ managerIds: [manager.id] });
          }
        });
      }
    }

    // Setup manager search
    this.filteredManagers$ = this.managerSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => this.filterManagers(term || '')),
    );

    // Setup worker search
    this.filteredWorkers$ = this.workerSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => this.filterWorkers(term || '')),
    );

    // Setup location search
    this.filteredLocations$ = this.mapSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => this.filterLocations(term || '')),
    );
  }

  private initAutocompleteService(): void {
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      // Always initialize legacy service as a guaranteed fallback
      this.autocompleteService = new google.maps.places.AutocompleteService();
      
      // Check if the new AutocompleteSuggestion is available
      if ('AutocompleteSuggestion' in google.maps.places) {
        this.useNewAutocomplete = true;
      }
    } else {
      setTimeout(() => this.initAutocompleteService(), 500);
    }
  }

  displayLocation(
    location: NormalizedLocation | null,
  ): string {
    return location ? location.description : '';
  }

  private filterLocations(
    term: string | NormalizedLocation,
  ): Observable<NormalizedLocation[]> {
    if (!term || typeof term !== 'string' || term.length < 2) {
      return of([]);
    }

    return new Observable((observer) => {
      const handleResults = (predictions: (google.maps.places.AutocompletePrediction | { placePrediction: unknown })[] | null) => {
        if (!predictions) {
          observer.next([]);
          observer.complete();
          return;
        }

        const normalized = predictions.map((p) => {
          const prediction: any = (p as any).placePrediction || p;
          const description = prediction.description || (typeof prediction.text === 'string' ? prediction.text : prediction.text?.text) || '';
          
          let mainText = prediction.structuredFormat?.mainText?.text || 
                         prediction.structured_formatting?.main_text;
                         
          let secondaryText = prediction.structuredFormat?.secondaryText?.text || 
                             prediction.structured_formatting?.secondary_text;

          // If structured formatting is missing, try to split description
          if (!mainText && description) {
            const firstComma = description.indexOf(',');
            if (firstComma !== -1) {
              mainText = description.substring(0, firstComma).trim();
              secondaryText = description.substring(firstComma + 1).trim();
            } else {
              mainText = description;
            }
          }

          return {
            place_id: prediction.placeId || prediction.place_id,
            description: description,
            mainText: mainText || description,
            secondaryText: secondaryText || '',
            ...prediction,
          };
        });

        observer.next(normalized);
        observer.complete();
      };

      try {
        if (
          this.useNewAutocomplete &&
          'AutocompleteSuggestion' in google.maps.places
        ) {
          const service = (google.maps.places as unknown as { AutocompleteSuggestion: unknown }).AutocompleteSuggestion as { fetchAutocompleteSuggestions: (req: { input: string }) => Promise<MapAutocompleteResponse> };
          service.fetchAutocompleteSuggestions(
            { input: term },
          )
            .then((response: MapAutocompleteResponse) => {
              handleResults(response.suggestions || []);
            })
            .catch((err: { status?: number; message?: string }) => {
              // If it's a 403 (Forbidden), it means the New API is not enabled.
              // We should stop trying to use it for this session.
              if (err.status === 403 || err.message?.includes('not been used') || err.message?.includes('disabled')) {
                this.useNewAutocomplete = false;
              }
              
              console.error('New Autocomplete Error:', err);
              // Fallback to legacy
              this.fallbackToLegacy(term, handleResults);
            });
        } else if (this.autocompleteService) {
          this.fallbackToLegacy(term, handleResults);
        } else {
          handleResults([]);
        }
      } catch (error) {
        console.error('Autocomplete exception:', error);
        handleResults([]);
      }
    });
  }

  private fallbackToLegacy(term: string, callback: (results: NormalizedLocation[]) => void): void {
    if (!this.autocompleteService) return callback([]);
    this.autocompleteService.getPlacePredictions(
      { input: term },
      (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          callback(predictions);
        } else {
          callback([]);
        }
      },
    );
  }

  async onLocationSelected(
    prediction: NormalizedLocation,
  ): Promise<void> {
    if (!prediction) return;

    try {
      const geocoder = new google.maps.Geocoder();
      const results = await geocoder.geocode({ placeId: prediction.place_id });

      if (results.results.length > 0) {
        this.updateMapLocation(results.results[0].geometry.location);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  }

  private updateMapLocation(location: google.maps.LatLng): void {
    const lat = location.lat();
    const lng = location.lng();

    this.center = { lat, lng };
    this.markerPosition = { lat, lng };
    this.zoom = 15;

    this.projectForm.patchValue({
      latitude: lat,
      longitude: lng,
    });
  }

  onMarkerDragEnd(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      this.markerPosition = { lat, lng };
      this.projectForm.patchValue({
        latitude: lat,
        longitude: lng,
      });
    }
  }

  onMapClick(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      this.markerPosition = { lat, lng };
      this.projectForm.patchValue({
        latitude: lat,
        longitude: lng,
      });
    }
  }

  private filterManagers(term: string): Observable<SearchableWorker[]> {
    return this.workerService.getWorkers(1, 10, undefined, term).pipe(
      map((response) =>
        response.data
          .filter((m) => m.id !== this.currentUserId)
          .map((m) => ({
            id: m.id,
            name: `${m.firstName} ${m.lastName}`,
            email: m.email,
          })),
      ),
    );
  }

  private filterWorkers(term: string): Observable<SearchableWorker[]> {
    if (!term) return of([]);

    return this.workerService.getWorkers(1, 10, undefined, term).pipe(
      map((response) =>
        response.data
          .filter(
            (m) =>
              !this.selectedWorkers.some((sm) => sm.id === m.id) &&
              m.id !== this.currentUserId,
          )
          .map((m) => ({
            id: m.id,
            name: `${m.firstName} ${m.lastName}`,
            email: m.email,
          })),
      ),
    );
  }

  selectManager(manager: SearchableWorker): void {
    this.selectedManager = manager;
    this.projectForm.patchValue({ managerIds: [manager.id] });
    this.managerSearchControl.setValue('');
  }

  removeManager(): void {
    this.selectedManager = null;
    this.projectForm.patchValue({ managerIds: [] });
    this.managerSearchControl.setValue('');
  }

  addWorker(worker: SearchableWorker): void {
    if (!this.selectedWorkers.some((m) => m.id === worker.id)) {
      this.selectedWorkers.push(worker);
      this.projectForm.patchValue({ workers: this.selectedWorkers });
    }
    this.workerSearchControl.setValue('');
  }

  removeWorker(worker: SearchableWorker): void {
    this.selectedWorkers = this.selectedWorkers.filter(
      (m) => m.id !== worker.id,
    );
    this.projectForm.patchValue({ workers: this.selectedWorkers });
  }

  async searchLocation(): Promise<void> {
    const query = this.mapSearchControl.value;
    if (!query) return;

    if (typeof query !== 'string') return;

    try {
      const geocoder = new google.maps.Geocoder();
      const results = await geocoder.geocode({ address: query });

      if (results.results.length > 0) {
        this.updateMapLocation(results.results[0].geometry.location);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    const formValue = this.projectForm.value;

    const workers: ProjectWorker[] = this.selectedWorkers.map((m) => ({
      userId: m.id,
      role: 'Worker' as const,
      joinedAt: new Date().toISOString(),
    }));

    if (this.isEditing && this.data) {
      const updateData: UpdateProjectDto = {
        name: formValue.name || undefined,
        managerIds: formValue.managerIds || undefined,
        description: formValue.description || undefined,
        status: (formValue.status as ProjectStatus) || undefined,
        startDate: formValue.startDate
          ? new Date(formValue.startDate).toISOString()
          : undefined,
        dueDate: formValue.endDate
          ? new Date(formValue.endDate).toISOString()
          : undefined,
        budget: formValue.budget != null ? Number(formValue.budget) : undefined,
        progress: formValue.progress != null ? Number(formValue.progress) : undefined,
        latitude: formValue.latitude !== null ? formValue.latitude : undefined,
        longitude: formValue.longitude !== null ? formValue.longitude : undefined,
        workers: workers,
      };

      this.store.dispatch(
        ProjectActions.updateProject({
          id: this.data.id,
          data: updateData,
        }),
      );
    } else {
      const createData: CreateProjectDto = {
        name: formValue.name!,
        managerIds: formValue.managerIds || [],
        description: formValue.description || undefined,
        status: (formValue.status as ProjectStatus) || 'active',
        startDate: formValue.startDate
          ? new Date(formValue.startDate).toISOString()
          : undefined,
        dueDate: formValue.endDate
          ? new Date(formValue.endDate).toISOString()
          : undefined,
        budget: formValue.budget != null ? Number(formValue.budget) : undefined,
        progress: formValue.progress != null ? Number(formValue.progress) : 0,
        latitude: formValue.latitude || undefined,
        longitude: formValue.longitude || undefined,
        workers,
      };
      this.store.dispatch(ProjectActions.createProject({ data: createData }));
    }
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
