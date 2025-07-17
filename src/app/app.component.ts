import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { trigger, transition, style, animate } from '@angular/animations';

interface FormComponent {
  id: string;
  type: any;
  label: string;
}

interface FormRow {
  id: string;
  title: string;
  components: FormComponent[];
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

  showPreview = false;

  title = 'dynamic-form-builder';

  availableComponents: FormComponent[] = [
    { id: 'comp_1', type: 'input', label: 'Text Input' },
    { id: 'comp_2', type: 'textarea', label: 'Text Area' },
    { id: 'comp_3', type: 'infoBox', label: 'Info Box' },
    { id: 'comp_4', type: 'buttonGroup', label: 'Button Group' },
    { id: 'comp_5', type: 'date', label: 'Date Picker' }
  ];

  rows: FormRow[] = [];
  form: FormGroup = this.fb.group({});

  constructor(private fb: FormBuilder) {}

  addRow() {
    const newRow: FormRow = { id: 'row_' + Date.now(), title: 'Untitled Row', components: [] };
    this.rows.push(newRow);
  }

  drop(event: CdkDragDrop<FormComponent[]>, row: FormRow) {
    if (!row) return;

    // Prevent adding more than 12 components
    if (row.components.length >= 12 && event.previousContainer !== event.container) {
      // Optionally, show a message to the user here
      return;
    }

    if (event.previousContainer === event.container) {
      // Reordering inside the same row (optional)
    } else {
      const originalComp = event.previousContainer.data[event.previousIndex];
      const compCopy: FormComponent = {
        ...originalComp,
        id: `${originalComp.id}_${Date.now()}`
      };

      // Add to the form group if applicable
      if (compCopy.type === 'input' || compCopy.type === 'date' || compCopy.type === 'textarea') {
        this.form.addControl(compCopy.id, new FormControl(''));
      }

      row.components.splice(event.currentIndex, 0, compCopy);
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
