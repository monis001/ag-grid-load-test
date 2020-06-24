/**
 * See : socketFetchData method for actual action
 */
import { Component, OnInit } from "@angular/core";
import { Module, AllModules } from '@ag-grid-enterprise/all-modules';
import { config } from 'process';

@Component({
    selector:'app-ag-grid-immutable',
    templateUrl : './ag-grid-immutable.component.html'
})
export class AgGridWidgetImmutable implements OnInit{
    public serverConfig : any ;
    public modules: Module[] = AllModules;
    public columnDefs: any;
    public rowData0;
    private rowNodeIdentifier ;
    public gridApi: any;
    public defaultColumnDef: any = {
        filter: 'agSetColumnFilter',
        resizable: true,
        filterParams: {apply: true, newRowsAction: 'keep'}
    };
    public i18n = {}

    private nodeIdMapper : object = {} ; // A kind of mapper

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

Scenreo-2 :
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
          this.nodeIdMapper[idNode] = data ; // persisting idNode and data 
          return idNode;
        }
        const randomString = this.randomString(10);
        this.nodeIdMapper[randomString] = data ;
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

    /**
    * Some configuration and socket setup
    */
    private socketInitialize(){
        const configObj = {}
        this.someServiceWillCallSocket(configObj,this.socketFetchData.bind(this))
    }

    private someServiceWillCallSocket(config, callBack){

    }
    
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
                const idsToDelete = [] ;
                Object.keys(this.nodeIdMapper).forEach((id)=>{
                  let isQualified = true;
                  for (const identifier of this.serverConfig.deleteNodeIdentifier) {
                    if(data[identifier] !== this.nodeIdMapper[id][identifier]){
                      isQualified = false;
                      break;
                    }
                  }
                  if(isQualified){
                    idsToDelete.push(id);
                  }
                });
                if(idsToDelete.length  > 0){
                  for(let i =0 ;i<idsToDelete.length;i++){
                    const id = idsToDelete[i] ;
                    delete this.nodeIdMapper[id];
                  }
                }
                dataArray = data.data;
            }
        }

        const rowNodes = []
        for (const data of dataArray) {
            const nodeId = this.getRowNodeId(data) ;
            const rowNode = this.gridApi.getRowNode(nodeId);
            if (rowNode) {
              rowNodes.push(rowNode);
            } 
            this.nodeIdMapper[nodeId] = data ;
        }
        const val = Object.keys(this.nodeIdMapper).map(items => this.nodeIdMapper[items]);
        
        this.gridApi.setRowData(val); // JSUT SET ROW DATA once done with all objects
        this.gridApi.flashCells({
          rowNodes:rowNodes
        });
    }
} 