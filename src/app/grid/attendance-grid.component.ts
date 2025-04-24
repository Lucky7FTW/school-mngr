// attendance-grid.component.ts
import { Component, Input }   from '@angular/core';
import { CommonModule }       from '@angular/common';
import { AgGridModule }       from 'ag-grid-angular';
import {
  ColDef,
  ICellRendererParams,
  CellClickedEvent
} from 'ag-grid-community';

/* ─── data model ─── */
export interface Row {
  student: string;                           // email
  s1: boolean; s2: boolean; s3: boolean;
  s4: boolean; s5: boolean; s6: boolean; s7: boolean;
}

/* the seven boolean field names */
type SessionKey = `s${1|2|3|4|5|6|7}`;

@Component({
  selector   : 'app-attendance-grid',
  standalone : true,
  imports    : [CommonModule, AgGridModule],
  template   : `
    <ag-grid-angular
      class="ag-theme-alpine"
      style="width:100%;height:450px"
      [rowData]   ="rowData"
      [columnDefs]="columnDefs">
    </ag-grid-angular>
  `
})
export class AttendanceGridComponent {

  /* ───────────────── column definitions ───────────────── */

  /** student e-mail column */
  private studentCol: ColDef<Row> = {
    headerName: 'Student',
    field     : 'student',
    flex      : 2,
    pinned    : 'left'
  };

  /** 7 identical session columns (checkbox toggles) */
  private sessionCols: ColDef<Row, boolean>[] =
    Array.from({ length: 7 }, (_, i): ColDef<Row, boolean> => {

      const key = `s${i + 1}` as SessionKey;   // "s1" … "s7"

      return {
        headerName : `S${i + 1}`,
        field      : key as any,               // ← generic workaround
        width      : 90,

        /* render plain checkbox */
        cellRenderer: (p: ICellRendererParams<Row, boolean>) =>
          `<input type="checkbox" ${p.value ? 'checked' : ''} />`,

        /* toggle value in the underlying data */
        onCellClicked: (e: CellClickedEvent<Row>) => {
          if (!e.data) return;                // skip group rows
          const current = e.data[key];
          e.node.setDataValue(key, !current);
        }
      };
    });

  /** final grid definition */
  columnDefs: ColDef<Row>[] = [this.studentCol, ...this.sessionCols];

  /* ───────────────── data input ───────────────── */
  @Input() rowData: Row[] = [];               // ← bind real data from parent
}
