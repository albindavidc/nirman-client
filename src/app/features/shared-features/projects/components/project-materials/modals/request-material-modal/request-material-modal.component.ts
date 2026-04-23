import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { GoogleMapsModule, MapMarker, GoogleMap } from '@angular/google-maps';
import {
  Observable,
  map,
  startWith,
  of,
  catchError,
  finalize,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs';
import { Material } from '../../../../models/material.model';
import { MasterMaterialService } from '../../../../../../admin/services/master-material.service';
import { MasterMaterial } from '../../../../../../admin/models/master-material.model';
import { SharedModalComponent } from '../../../../../../../shared/components/shared-modal/shared-modal.component';
import { CustomValidators } from '../../../../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-request-material-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressBarModule,
    GoogleMapsModule,
    SharedModalComponent,
  ],
  templateUrl: './request-material-modal.component.html',
  styleUrl: './request-material-modal.component.scss',
})
export class RequestMaterialModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private masterMaterialService = inject(MasterMaterialService);
  public dialogRef = inject(MatDialogRef<RequestMaterialModalComponent>);

  materials: (Material | MasterMaterial)[] = [];
  filteredMaterials$!: Observable<(Material | MasterMaterial)[]>;
  selectedMaterial: (Material | MasterMaterial) | null = null;
  isLoading = signal<boolean>(false);
  minDate = new Date();

  // Maps configuration
  center: google.maps.LatLngLiteral = { lat: 28.6139, lng: 77.209 }; // Default
  zoom = 12;
  markerPosition: google.maps.LatLngLiteral = { ...this.center };
  markerOptions: google.maps.MarkerOptions = { draggable: true };
  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  };

  form = this.fb.group({
    materialName: ['', Validators.required],
    materialCode: [{ value: '', disabled: true }, Validators.required],
    category: [{ value: '', disabled: true }, Validators.required],
    unit: [{ value: '', disabled: true }, Validators.required],
    materialId: [''],
    quantityRequested: [1, [Validators.required, Validators.min(1)]],
    priority: ['medium', Validators.required],
    requiredDate: [new Date(), Validators.required],
    deliveryLocation: ['', [Validators.maxLength(200)]],
    deliveryLatitude: [null as number | null],
    deliveryLongitude: [null as number | null],
    purpose: [
      '',
      [
        Validators.required,
        Validators.maxLength(500),
        CustomValidators.noWhitespace(),
      ],
    ],
  });

  public data = inject<{
    materials: Material[];
    requests: any[];
    projectId: string;
  }>(MAT_DIALOG_DATA);
  filteredLocations$!: Observable<any[]>;

  private autocompleteService: google.maps.places.AutocompleteService | null =
    null;

  ngOnInit(): void {
    this.isLoading.set(true);
    // Load from master catalog first
    this.masterMaterialService
      .getAll()
      .pipe(
        catchError(() => of([])),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe((masterMaterials: MasterMaterial[]) => {
        if (masterMaterials.length > 0) {
          this.materials = masterMaterials;
        } else {
          // Fallback to project materials if master catalog is empty or fails
          this.materials = this.data?.materials || [];
        }
        this.setupFilter();
      });

    this.initAutocompleteService();
    this.setupLocationFilter();
  }

  private initAutocompleteService(): void {
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      this.autocompleteService = new google.maps.places.AutocompleteService();
    } else {
      setTimeout(() => this.initAutocompleteService(), 500);
    }
  }

  private setupLocationFilter(): void {
    this.filteredLocations$ = this.form
      .get('deliveryLocation')!
      .valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.filterLocations((term as string) || '')),
      );
  }

  private filterLocations(term: string): Observable<any[]> {
    if (!term || typeof term !== 'string' || term.length < 3) return of([]);
    return new Observable((observer) => {
      this.autocompleteService?.getPlacePredictions(
        { input: term },
        (predictions, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            observer.next(
              predictions.map((p) => ({
                place_id: p.place_id,
                description: p.description,
              })),
            );
          } else {
            observer.next([]);
          }
          observer.complete();
        },
      );
    });
  }

  async onLocationSelected(prediction: any): Promise<void> {
    if (!prediction) return;
    this.form.patchValue({ deliveryLocation: prediction.description });
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const location = results[0].geometry.location;
        this.updateMapLocation(location.lat(), location.lng());
      }
    });
  }

  updateMapLocation(lat: number, lng: number): void {
    this.center = { lat, lng };
    this.markerPosition = { lat, lng };
    this.zoom = 15;
    this.form.patchValue({
      deliveryLatitude: lat,
      deliveryLongitude: lng,
    });
  }

  onMarkerDragEnd(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      this.updateMapLocation(event.latLng.lat(), event.latLng.lng());
    }
  }

  onMapClick(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      this.updateMapLocation(event.latLng.lat(), event.latLng.lng());
    }
  }

  public setupFilter(): void {
    this.filteredMaterials$ = this.form.get('materialName')!.valueChanges.pipe(
      startWith(this.form.get('materialName')?.value || ''),
      map((value) => {
        const name =
          typeof value === 'string' ? value : (value as any)?.name || '';
        return name ? this._filter(name) : this.materials.slice();
      }),
    );
  }

  clearSelection(): void {
    this.form.patchValue({
      materialName: '',
      materialId: '',
      materialCode: '',
      category: '',
      unit: '',
    });
    this.selectedMaterial = null;
    this.setupFilter();
  }

  private _filter(name: string): (Material | MasterMaterial)[] {
    const filterValue = name.toLowerCase();
    return this.materials.filter(
      (material) =>
        material.name.toLowerCase().includes(filterValue) ||
        material.code.toLowerCase().includes(filterValue) ||
        material.category.toLowerCase().includes(filterValue) ||
        material.unit.toLowerCase().includes(filterValue),
    );
  }

  displayFn(material: any): string {
    return material?.name || '';
  }

  onMaterialSelected(event: { option: { value: any } }): void {
    const selected = event.option.value;

    // Check if this material (by code) already exists in the project
    const projectMaterial = this.data.materials.find(
      (m) => m.code === selected.code,
    );

    // Use project material if found, otherwise use master material (may need backend instantiation)
    this.selectedMaterial = projectMaterial || selected;

    this.form.patchValue({
      materialId: this.selectedMaterial?.id,
      materialName: selected.name, // Keep the display name
      materialCode: selected.code,
      category: selected.category,
      unit: selected.unit,
    });
  }

  isAlreadyRequested(material: any): boolean {
    if (!material || !this.data.requests) return false;
    return this.data.requests.some(
      (req) =>
        req.status === 'pending' &&
        req.items.some(
          (item: any) =>
            item.materialId === material.id ||
            item.materialCode === material.code,
        ),
    );
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.getRawValue();
      this.dialogRef.close({
        ...formValue,
        materialId: this.selectedMaterial?.id,
        materialName:
          typeof formValue.materialName === 'string'
            ? formValue.materialName
            : this.selectedMaterial?.name,
        unit: formValue.unit || this.selectedMaterial?.unit || 'units',
      });
    }
  }
}
