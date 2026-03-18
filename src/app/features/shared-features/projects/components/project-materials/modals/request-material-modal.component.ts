import { Component, inject, OnInit } from '@angular/core';
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
import { Observable, map, startWith } from 'rxjs';
import { Material } from '../../../models/material.model';
import { SharedModalComponent } from '../../../../../../shared/components/shared-modal/shared-modal.component';
import { CustomValidators } from '../../../../../../shared/validators/custom-validators';

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
    SharedModalComponent,
  ],
  templateUrl: './request-material-modal.component.html',
  styleUrl: './request-material-modal.component.scss',
})
export class RequestMaterialModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<RequestMaterialModalComponent>);

  materials: Material[] = [];
  filteredMaterials$!: Observable<Material[]>;
  selectedMaterial: Material | null = null;

  form = this.fb.group({
    materialName: ['', Validators.required],
    materialId: [''],
    quantity: [1, [Validators.required, Validators.min(1)]],
    priority: ['medium', Validators.required],
    requiredDate: [new Date(), Validators.required],
    purpose: ['', [Validators.required, Validators.maxLength(500), CustomValidators.noWhitespace()]],
  });

  public data = inject<{ materials: Material[] }>(MAT_DIALOG_DATA);

  ngOnInit(): void {
    this.materials = this.data?.materials || [];

    this.filteredMaterials$ = this.form.get('materialName')!.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name =
          typeof value === 'string'
            ? value
            : (value as unknown as Material)?.name || '';
        return name ? this._filter(name) : this.materials.slice();
      }),
    );
  }

  private _filter(name: string): Material[] {
    const filterValue = name.toLowerCase();
    return this.materials.filter(
      (material) =>
        material.name.toLowerCase().includes(filterValue) ||
        material.code.toLowerCase().includes(filterValue),
    );
  }

  displayFn(material: Material): string {
    return material?.name || '';
  }

  onMaterialSelected(event: { option: { value: Material } }): void {
    const material = event.option.value;
    this.selectedMaterial = material;
    this.form.patchValue({
      materialId: material.id,
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      this.dialogRef.close({
        ...formValue,
        materialId: this.selectedMaterial?.id,
        materialName:
          typeof formValue.materialName === 'string'
            ? formValue.materialName
            : this.selectedMaterial?.name,
        unit: this.selectedMaterial?.unit || 'units',
      });
    }
  }
}
