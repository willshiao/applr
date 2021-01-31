async function main () {

// var dataTable = $('#dataTable').DataTable();
var editor; // use a global for the submit and return data rendering in the examples
var dataTable;
// fetch data
const res = await fetch('http://localhost:5000/applications', {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6M30.1qmoIT5HL0HA7PNzXykGC1YbjBmnAelbEl4X77U1-Ig'
    },
  })

const data = await res.json();

const colNames =  {0: "company", 1: "position", 2: "status", 3: "dateApplied", 4: "lastResponse", 5: "notes", 6: "link", 7:"DT_RowId"};
appData = {"data": []}
data["data"].forEach((app)=>{
    var appl = {};
    var i = 0;
    app[3] = moment(app[3]).format('L');
    app[4] = moment(app[4]).format('L');
    for (i; i < app.length; i++) {
        appl[colNames[i]]  = app[i];
    }
    // appl[colNames[i]] = appData["data"].length; // probably should change this to the application id
    app = appl;
    appData["data"].push(appl);
})
console.log(JSON.stringify(appData));



$(document).ready(function() {
    editor = new $.fn.dataTable.Editor( {
        table: "#dataTable",
        fields: [ 
           
            {
                label: "Company Name", 
                name:"company"
            },
           {
                label: "Position",
                name: "position"
            }, {
                label: "Status",
                name: "status"
            }, {
                label: "Date Applied",
                name: "dateApplied",
                type: "datetime"
            }, {
                label: "Last Response",
                name: "lastResponse",
                type: "datetime"
            }, {
                label: "Notes",
                name: "notes"
            },
            {
                label: "Application Link", 
                name:"link"
            }
        ]
    } );
 
  dataTable =   $('#dataTable').DataTable({
        dom: 'Bfrtip', // for create,remove,edit btns
        columns: [
            { data: "company" },
            { data: "position" },
            { data: "status" },
            { data: "dateApplied" },
            { data: "lastResponse" },
            { data: "notes" },
            { data: "link" },
        ],
        select: true,
        buttons: [
            { extend: 'create', editor: editor },
            { extend: 'edit',   editor: editor },
            { extend: 'remove', editor: editor }
        ]
    }).rows.add(appData["data"]).draw();
} );

// const fillTable = (data) => {
//     apps = data["data"]
//     apps.map(app => {
//         app[1] = `<a href=${app[1]} ">${app[1]}</a>`
//         app[3] = `<input value=${app[3]} style="border: none;display: inline; text-align:center";>`
//         // change to mm/dd/yyy format
//         app[4] = moment(app[4]).format('L');
//         app[5] = moment(app[5]).format('L');
//         app[6] = `<textarea style="border: none;display: inline; text-align:center";>${app[6] !== null ? app[6]:''}</textarea>`
        
//     })
//     dataTable.rows.add(data["data"]).draw();
// }

// fillTable(appData);

// dataTable.on( 'click', 'tbody td', function () {
//   //status
//     if (dataTable.cell(this)[0][0]["column"] === 3){
//         console.log($(dataTable.cell(this).data()).val());
//     }
   
// } );
}

main()
