async function main () {

var editor; // use a global for the submit and return data rendering in the examples
var dataTable;
const myStorage = window.localStorage
console.log("hello")
console.log(myStorage.getItem("applrToken"))
const links = document.querySelector(".links");
// fetch data
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6M30.1qmoIT5HL0HA7PNzXykGC1YbjBmnAelbEl4X77U1-Ig
const signIn = document.getElementById("sign-in")
const signUp = document.getElementById("sign-up")
const logOut = document.getElementById("logout-btn")

if (myStorage.getItem("applrToken")) {
    links.style.display = "none";
    signIn.removeAttribute("href")
    signIn.innerHTML = "Welcome back!"
    signUp.innerHTML = ""
} else {
    logOut.style.display = "none"
}

logOut.addEventListener('click', (e) => {
    e.preventDefault()
    myStorage.clear()
    window.location.href = "./signin.html"
})

const res = await fetch('http://localhost:5000/applications', {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + myStorage.getItem("applrToken")
    },
  })

const data = await res.json();

const colNames =  {0: "company", 1: "position", 2: "status", 3: "dateApplied", 4: "lastResponse", 5: "notes", 6: "link", 7:"DT_RowId"};
appData = {"data": []}
data["data"].forEach((app)=>{
    var appl = {};
    var i = 0;
    var link = app[6];
    app[6] = `<a href="${app[6]}">${link.length > 20 ? link.slice(0,20)+"..." : link}</a>`
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
            // {
            //     label: "Application Link", 
            //     name:"link"
            // }
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
            { extend: 'edit',   editor: editor },
            { extend: 'remove', editor: editor }
        ], "columnDefs": [
            { "width": "10%", "targets": [2,3,4,6] },
            {"width": "20%", "targets": [5]},
            {"width": "30%", "targets": [1]}
          ], "pageLength": 15
    }).rows.add(appData["data"]).draw();
} );

}

main()
