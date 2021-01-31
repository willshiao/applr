var dataTable = $('#dataTable').DataTable();

// fetch data
const data = {
    "data": [
      [
        "Mailchimp", 
        "https://boards.greenhouse.io/mailchimp/jobs/2331135", 
        "Machine Learning Engineer Intern", 
        "Applied", 
        "Fri, 29 Jan 2021 00:00:00 GMT", 
        "Fri, 29 Jan 2021 00:00:00 GMT", 
        "Summer 2021 Internship @ Atlanta"
      ], 
      [
        "Lyft", 
        "https://boards.greenhouse.io/lyft/jobs/5045207002?gh_jid=5045207002", 
        "Strategic Partner Manager, Rider", 
        "Applied", 
        "Sat, 30 Jan 2021 00:00:00 GMT", 
        "Sat, 30 Jan 2021 00:00:00 GMT", 
        null
      ]
    ]
  };


const colNames =  ["Company Name", "Application Link", "Position", "Status", "Date Applied", "Last Response", "Notes"];

const fillTable = (data) => {
    apps = data["data"]
    apps.map(app => {
        // change to mm/dd/yyy format
        app[4] = moment(app[4]).format('L');
        app[5] = moment(app[5]).format('L');
        
    })
    dataTable.rows.add(apps).draw();
}

fillTable(data);