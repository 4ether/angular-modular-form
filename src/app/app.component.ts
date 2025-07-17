import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { trigger, transition, style, animate } from '@angular/animations';

interface FormComponent {
  id: string;
  type: any;
  label: string;
  comp_uuid?: string;
  options?: string[]; // For radio group or select
  orientation?: string; // For radio group
}

interface FormRow {
  id: string;
  title: string;
  components: FormComponent[];
  uuid: string;
  animationState?: 'default' | 'up' | 'down';
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('rowAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-30px)' }),
        animate('250ms cubic-bezier(.35,0,.25,1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('250ms cubic-bezier(.35,0,.25,1)', style({ opacity: 0, transform: 'translateY(30px)' }))
      ]),
      transition(':increment', [
        style({ zIndex: 2 }),
        animate('300ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateY(40px)' })),
        animate('300ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateY(0)' }))
      ]),
      transition(':decrement', [
        style({ zIndex: 2 }),
        animate('300ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateY(-40px)' })),
        animate('300ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AppComponent {

  selectedComponent: FormComponent | null = null;

  showPreview = false;

  title = 'dynamic-form-builder';
  

  availableComponents: FormComponent[] = [
    { id: 'comp_1', type: 'input', label: 'Text Input' },
    { id: 'comp_2', type: 'textarea', label: 'Text Area' },
    { id: 'comp_3', type: 'date', label: 'Date Picker' },
    { id: 'comp_4', type: 'infoBox', label: 'Info Box' },
    { id: 'comp_5', type: 'buttonGroup', label: 'Button Group' },
    { id: 'comp_6', type: 'file', label: 'File Upload' },
    { 
      id: 'comp_7', 
      type: 'radioGroup', 
      label: 'Radio Group', 
      options: ['Option 1', 'Option 2'], 
      orientation: 'horizontal' 
    }
  ];

  rows: FormRow[] = [];
  form: FormGroup = this.fb.group({});

  constructor(private fb: FormBuilder) {}

  generateUUID(): string {
    // Generates a random UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  generateUniqueCompUUID(): string {
    let uuid: string;
    do {
      uuid = this.generateUUID();
    } while (this.isCompUUIDExists(uuid));
    return uuid;
  }

  isCompUUIDExists(uuid: string): boolean {
    return this.rows.some(row =>
      row.components.some(comp => comp.comp_uuid === uuid)
    );
  }

  addRow() {
    const newRow: FormRow = { id: 'row_' + Date.now(), title: 'Untitled Row', components: [], uuid: this.generateUniqueCompUUID() };
    this.rows.push(newRow);
  }

  // savePreset() {
  //   const formPreset = this.getFormPreset();
  //   // Send formPreset to your backend here
  //   console.log('Preset to send:', formPreset);
  // }

  selectComponent(comp: FormComponent) {
    this.selectedComponent = comp;
  }

  // getFormPreset() {
  //   return {
  //     rows: this.rows
  //   };
  // }

  drop(event: CdkDragDrop<FormComponent[]>, row: FormRow) {
    if (!row) return;

    // Prevent adding more than 12 components
    if (row.components.length >= 12 && event.previousContainer !== event.container) {
      return;
    }

    if (event.previousContainer === event.container) {
      // Reordering inside the same row (optional)
      // You can use moveItemInArray if you want to support reordering
      // moveItemInArray(row.components, event.previousIndex, event.currentIndex);
    } else {
      // Remove from previous row
      const prevRow = this.rows.find(r => r.components === event.previousContainer.data);
      if (prevRow) {
        const [removed] = prevRow.components.splice(event.previousIndex, 1);
        row.components.splice(event.currentIndex, 0, removed);
      } else {
        // If dragging from availableComponents, clone as before
        const originalComp = event.previousContainer.data[event.previousIndex];
        const compCopy: FormComponent = {
          ...originalComp,
          id: `${originalComp.id}_${Date.now()}`,
          comp_uuid: this.generateUniqueCompUUID()
        };
        if (
          compCopy.type === 'input' ||
          compCopy.type === 'infoBox' ||
          compCopy.type === 'date' ||
          compCopy.type === 'textarea' ||
          compCopy.type === 'file' ||
          compCopy.type === 'buttonGroup' ||
          compCopy.type === 'radioGroup'
        ) {
          this.form.addControl(compCopy.id, new FormControl(''));
        }
        row.components.splice(event.currentIndex, 0, compCopy);
      }
    }
  }

  trackByIndex(index: number, item: any) {
    return index;
  }

  addRadioOption(comp: FormComponent) {
    if (comp.options) {
      comp.options = [...comp.options, 'New Option'];
    }
  }

  removeRadioOption(comp: FormComponent, idx: number) {
    if (comp.options) {
      comp.options = comp.options.filter((_, i) => i !== idx);
    }
  }

  removeComponent(row: FormRow, comp: FormComponent) {
    row.components = row.components.filter(c => c.id !== comp.id);
    if (this.form.contains(comp.id)) {
      this.form.removeControl(comp.id);
    }
  }

  moveRowUp(row: FormRow) {
  const index = this.rows.indexOf(row);
    if (index > 0) {
      [this.rows[index - 1], this.rows[index]] = [this.rows[index], this.rows[index - 1]];
    }
  }

  moveRowDown(row: FormRow) {
    const index = this.rows.indexOf(row);
    if (index < this.rows.length - 1) {
      [this.rows[index + 1], this.rows[index]] = [this.rows[index], this.rows[index + 1]];
    }
  }

  isFirstRow(row: FormRow): boolean {
    return this.rows.indexOf(row) === 0;
  }

  isLastRow(row: FormRow): boolean {
    return this.rows.indexOf(row) === this.rows.length - 1;
  }

  get connectedDropListsIds(): string[] {
    return ['availableComponents', ...this.rows.map(r => r.id)];
  }

  get formValueByRow() {
    return this.rows.map(row => {
      const rowObj: { [key: string]: any } = {};
      row.components.forEach(comp => {
        if (this.form.contains(comp.id)) {
          rowObj[comp.id] = this.form.get(comp.id)?.value;
        }
      });
      return rowObj;
    });
  }

  getBootstrapColClass(count: number): string {
    const colSize = Math.floor(12 / count);
    return `col-${colSize > 0 ? colSize : 12}`;
  }

  trackByRowId(index: number, row: FormRow): string {
    return row.id;
  }

  togglePreview() {
    if (this.showPreview) {
      // If currently showing preview and user clicks to hide it,
      // you can refresh or update the builder view here if needed.
      // For example, you could reset any temporary preview state.
      // If you want to force a refresh, you could do:
      setTimeout(() => {
        // Any additional logic if needed after hiding preview
      }, 0);
    }
    this.showPreview = !this.showPreview;
  }

  removeRow(row: FormRow) {
    this.rows = this.rows.filter(r => r.id !== row.id);
    // Optionally, remove controls for all components in this row
    row.components.forEach(comp => {
      if (this.form.contains(comp.id)) {
        this.form.removeControl(comp.id);
      }
    });
  }
}
