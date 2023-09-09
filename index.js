const mysql = require('mysql2');

// Create a connection to your MySQL server
const connection = mysql.createConnection({
  host: 'localhost', // MySQL server host
  user: 'root',
  password: 'ingelheimamrhein',
  database: 'rematter_default',
});

// Connect to the MySQL server
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');

  // Run your SQL query
  const sqlQuery = `select j.jobNumber, jl.locationId, jl.dispatcherNotes from job j join job_location jl on j.jobId = jl.jobId limit 10`;
  connection.query(sqlQuery, (err, results) => {
    if (err) {
      console.error('Error running query:', err);
      return;
    }

    // Process the query results
    console.log('Query results:', results);

    // Close the MySQL connection when done
    connection.end((err) => {
      if (err) {
        console.error('Error closing connection:', err);
        return;
      }
      console.log('Connection closed');
    });
  });
});
