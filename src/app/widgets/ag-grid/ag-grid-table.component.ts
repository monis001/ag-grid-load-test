/**
 * See : socketFetchData method for actual action
 */

import { Component, OnInit, Input } from "@angular/core";
import {
    AllModules,
    Module,
    ModuleRegistry as CoreModuleRegistry
  } from '@ag-grid-enterprise/all-modules';

@Component({
    selector:'app-ag-grid',
    templateUrl : './ag-grid-table.component.ts'
})

export class AgGridWidgetComponent implements OnInit{
    @Input() public serverConfig ;
    // public serverConfig : any ;
    public modules: Module[] = AllModules;
    public columnDefs: any;
    public rowData0;
    public gridApi: any;
    public defaultColumnDef: any = {
        filter: 'agSetColumnFilter',
        resizable: true,
        filterParams: {apply: true, newRowsAction: 'keep'}
    };
    public i18n = {}
    private rowNodeIdentifier ;
  
    
    constructor(){
         this.rowNodeIdentifier = ['projectId']  ; // some conditional identifiers recieved from array
    }

    ngOnInit(){
        this.serverConfig = {} // will be some server config
        this.prepareColumns([]);
        this.initialAgGridDataAssign();
        this.socketInitialize();
    }

    private prepareColumns(fields){
        const columns = []; 
        for (let i = 0; i < fields.length; i++) {
            let value = fields[i];
            if (value.internal) {
                value.suppressColumnsToolPanel = true;
            }
            value.headerName = this.i18n[value.headerName];
            value.tooltipValueGetter = (param) => {
                return param.valueFormatted || param.value;
            };
            value.pinned = value.pinned ? value.pinned : null;
            value.filter = this.getFilterType(value);
            value.filterParams = {...this.getFilterParams(value),apply:true};
            value['cellRendererFramework'] = 'CellRenderarComponent';  // CUSTOM CELL renderar component
            value['cellRendererParams'] = Object.assign({}, value);
            value['cellStyle'] = this.cellStyling.bind(this); // MOST IMPORTANT THING
            value.minWidth = 200;
            value['colFormat'] = value.format;
            value['colType'] = value.type;
            value.flex = 1;
            value.enableCellChangeFlash = true ;
            // value['valueFormatter'] = this.valueFormatter.transformData.bind(this.valueFormatter);
            delete value.internal;
            delete value.format;
            delete value.type;
            columns.push(value);
        }
        this.columnDefs = columns.slice();
    }
    /**
     * 
     * @param params : ag-grid cell value 
     */
    /**
     [MORE CONTEXT]
     Suppose there are 5 columns namely A,B,C,D,E and corresponding data object is {a:100,b:200,c:300,d:400,e:500}
     Now when corresponding cell will be rendered i.e. a,b,c,d,e this function is called with cell-value (i.e. consecutively for cells a,b,c,d and e) and data object
     
    Scenreo-1 : 
      => If column-C value is greater than 500, apply red background color and yellow text-color to column-A 
         i.e. {column-C} > 500 than column-A {color: '#FFFF00', backgroundColor: '#FFFF00'};
    */
    private cellStyling(params){
        let cellStyling = {color: '#000', backgroundColor: '#fff'};
        /**
         Scenreo-1 :
         Below case is just to give you idea, dynamic fields compairisons and dynamic colors 
        */
       const currentColumn = params.colDef.field; // Let say it is column-A only that we have to check 
       if(params.data['c'] > 500) {
        cellStyling = {color: '#FFFF00', backgroundColor: '#FFFF00'}
       }
       
        return cellStyling;
    }

    private getFilterType(value: any) {

        if (!value.type) {
          return 'agTextColumnFilter';
        }
    
        if (value.type.toUpperCase() === 'NUMBER') {
          return 'agNumberColumnFilter';
        } else if (value.type.toUpperCase() === 'STRING') {
          return 'agSetColumnFilter';
        } else if (value.type.toUpperCase() === 'DURATION') {
          return 'agTextColumnFilter';
        } else if (value.type.toUpperCase() === 'DATE') {
          return 'agTextColumnFilter';
        } else if (value.type.toUpperCase() === 'DATETIME') {
          return 'agTextColumnFilter';
        } else if (value.type.toUpperCase() === 'DECIMAL') {
          return 'agNumberColumnFilter';
        } else if (value.type.toUpperCase() === 'RATIO') {
          return 'agTextColumnFilter';
        }
    }

    private getFilterParams(value: any) {
        // Appropriate filter is return (exported from some other files)
        switch (value.type.toUpperCase()) {
          case 'DURATION':
            return {};
          case 'RATIO':
            return {};
          case 'DATE':
          case 'DATETIME':
            return {}
          case 'STRING':
            return {}
        }
      }

    private async initialAgGridDataAssign(){
        /**
          For initial seeding of data, will get from normal HTTP    
        */
       const response = await this.dataFetch() ; 
       this.gridApi.setRowData(response) ;
    }

    private dataFetch(){
        return [] ;
    }

    public onGridReady(params) {
        this.gridApi = params.api;
        // params.columnApi.setColumnState(this.someServerConfig.columnState); // setting some column state 
    }

    public getContextMenuItems = (params) => {
        // some custom context menu logic
    }

    public getRowNodeId = (data) => {
        if (this.rowNodeIdentifier && this.rowNodeIdentifier.length > 0) {
          let idNode = '';
          for (const node of this.rowNodeIdentifier) {
            idNode += '_' + data[node];
          }
        
          return idNode;
        }
        const randomString = this.randomString(10);
      
        return randomString ;
    };

    public randomString(len, charSet?){
    // JS random string logic
        charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' ;;
          let randomString = '';
        for (let i = 0; i < len; i++) {
            const randomPoz = Math.floor(Math.random() * charSet.length);
            randomString += charSet.substring(randomPoz, randomPoz + 1);
        }
        return randomString;
    }

    public onFirstDataRendered(event) {
        // this.bindEventListeners(); // binding ag-grid event listeners
        // this.applyFiltersAndSort(event); // set Sort-Model and filter-model
    }

    private columnCreation(){

    }
    
    /**
    * Some configuration and socket setup
    */
   private socketInitialize(){
        const configObj = {}
        this.someServiceWillCallSocket(configObj,this.socketFetchData.bind(this))
    }

    private someServiceWillCallSocket(config, callBack){

    }

    /**
     * 
     * @param dataFromSocket : Actual data send by socket
     */
    private socketFetchData(dataFromSocket){
        /**
         * Data conversion
        */
        let dataArray = JSON.parse(dataFromSocket.body); // Got the data here! Now just update it into table
        if (!Array.isArray(dataArray)) {
            dataArray = [dataArray];
        }
        /**
         1. Server configuration tells the necessity of action i.e. if incoming-data is supposed to be only visible with deleting few of existsing data
         e.g. : list of current items in a pipeline (can vary from maximum 1 to 15) 
         */
        if (this.serverConfig.dataAction === 'DELETE_INSERT') {
            const rowsToRemove = [];
            const data = Array.isArray(dataArray) && dataArray.length > 0 ? dataArray[0] : {};
            if (data) {
                this.gridApi.forEachNode((node, index) => {
                    let shallIDelete = true;
                    for (const identifier of this.serverConfig.deleteNodeIdentifier) {
                        if (data[identifier] !== node.data[identifier]) {
                            shallIDelete = false;
                             break;
                        }
                    }
                    if (shallIDelete) {
                        rowsToRemove.push(node.data);
                    }
                });
                this.gridApi.updateRowData({
                    remove: rowsToRemove
                });
                dataArray = data.data;
            }
        }
        for (const data of dataArray) {
                const rowNode = this.gridApi.getRowNode(this.getRowNodeId(data));
            if (rowNode) {
                // UPDATE Existing DATA
                this.gridApi.updateRowData({remove: [data]});
                this.gridApi.updateRowData({add: [data]});
                this.gridApi.flashCells({
                    rowNodes: [rowNode],
                });
            // ********************************************************** //
            /**
             To update existing data, we have to first remove it and than add it back BECAUSE OF 'CELL STYLE FUNCTION' i.e. 'cellStyling'
             [Explaination]
             1. Suppose we have 4 columns A,B,C,D with data values e.g. {a:100,b:200,c:300,d:400};
             2. When we recieve data and say we have cell values before update was a->100,b->200,c->300,d->400 and now we recieve object {a:100,b:200,c:900,d:400}; with change in just column C i.e. 900
             3. Also we have some cell-styling function that says '{c} > 500 than APPLY column-A {color: 'green', backgroundColor: 'black}; '
             4. If we do just 'this.gridApi.updateRowData({update: [data]})' ag-grid will INTERNALLY just change column-C cell value that is from [300] to [900]
             5. and if only updated cell is changed THE other cells styling function will never be triggered i.e. if new objevct has c = 900 that fullfill cell-A coloring criteria

             To RUN CELL STYLING FUNCTION FOR ALL CELLS ON receiving data we just [delete] row and than add it back. 
 
            */
            } else {
              // Add new DATA
              this.gridApi.updateRowData({add: [data]});
            }
        }
        // UPDATE the AG-GRID filters (if any)
    }

}