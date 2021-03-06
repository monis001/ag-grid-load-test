import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AgGridWidgetComponent } from './widgets/ag-grid/ag-grid-table.component';
import { AgGridWidgetImmutable } from './widgets/ag-grid-immutable/ag-grid-immutable.component';

@NgModule({
  declarations: [
    AppComponent,
    AgGridWidgetComponent,
    AgGridWidgetImmutable
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
