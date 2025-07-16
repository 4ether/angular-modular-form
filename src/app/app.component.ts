import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { trigger, transition, style, animate, state } from '@angular/animations';

interface FormComponent {
  id: string;
  type: 'input' | 'textarea' | 'label' | 'infoBox';
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
      state('default', style({ transform: 'translateY(0)', opacity: 1 })),
      state('up', style({ transform: 'translateY(-40px)', opacity: 1 })),
      state('down', style({ transform: 'translateY(40px)', opacity: 1 })),
      transition('* => up', [
        animate('300ms cubic-bezier(.35,0,.25,1)')
      ]),
      transition('* => down', [
        animate('300ms cubic-bezier(.35,0,.25,1)')
      ]),
      transition('* => default', [
        animate('300ms cubic-bezier(.35,0,.25,1)')
      ])
    ])
  ]
})
export class AppComponent {
  title = 'dynamic-form-builder';

  availableComponents: FormComponent[] = [
    { id: 'comp_1', type: 'input', label: 'Text Input' },
    { id: 'comp_2', type: 'textarea', label: 'Text Area' },
    { id: 'comp_3', type: 'label', label: 'Warning Label' },
    { id: 'comp_4', type: 'infoBox', label: 'Info Box' },
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

    if (event.previousContainer === event.container) {
      // Reordering inside the same row (optional)
    } else {
      const originalComp = event.previousContainer.data[event.previousIndex];
      const compCopy: FormComponent = {
        ...originalComp,
        id: `${originalComp.id}_${Date.now()}`
      };

      // Add to the form group if applicable
      if (compCopy.type === 'input' || compCopy.type === 'textarea') {
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
      this.rows[index].animationState = 'up';
      this.rows[index - 1].animationState = 'down';
      [this.rows[index - 1], this.rows[index]] = [this.rows[index], this.rows[index - 1]];
      setTimeout(() => {
        this.rows[index].animationState = 'default';
        this.rows[index - 1].animationState = 'default';
      }, 300); // match animation duration
    }
  }

  moveRowDown(row: FormRow) {
    const index = this.rows.indexOf(row);
    if (index < this.rows.length - 1) {
      this.rows[index].animationState = 'down';
      this.rows[index + 1].animationState = 'up';
      [this.rows[index + 1], this.rows[index]] = [this.rows[index], this.rows[index + 1]];
      setTimeout(() => {
        this.rows[index].animationState = 'default';
        this.rows[index + 1].animationState = 'default';
      }, 300);
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
}
