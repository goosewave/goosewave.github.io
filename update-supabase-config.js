// Script to update Supabase configuration to use public schema
const fs = require('fs');
const path = require('path');

// Function to update the supabaseClient.js file
function updateSupabaseClient() {
  const filePath = path.join(__dirname, 'src', 'js', 'utils', 'supabaseClient.js');
  
  try {
    // Read the current file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file already has the schema configuration
    if (content.includes('.schema(')) {
      console.log('The supabaseClient.js file already has schema configuration.');
      return;
    }
    
    // Add the schema configuration
    const updatedContent = content.replace(
      'const supabase = createClient(supabaseUrl, supabaseAnonKey);',
      'const supabase = createClient(supabaseUrl, supabaseAnonKey, {\n' +
      '  db: {\n' +
      '    schema: \'public\',\n' +
      '  },\n' +
      '});'
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, updatedContent);
    
    console.log('Successfully updated supabaseClient.js to use the public schema.');
  } catch (error) {
    console.error('Error updating supabaseClient.js:', error.message);
  }
}

// Function to update all files that use .schema('api')
function removeSchemaApiCalls() {
  const filesToUpdate = [
    path.join(__dirname, 'src', 'js', 'components', 'MiiCustomizer.js'),
    path.join(__dirname, 'src', 'js', 'App.js'),
    path.join(__dirname, 'src', 'js', 'components', 'AuthForm.js')
  ];
  
  for (const filePath of filesToUpdate) {
    try {
      // Read the current file content
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove all .schema('api') calls
      const updatedContent = content.replace(/\.schema\('api'\)/g, '');
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, updatedContent);
      
      console.log(`Successfully removed .schema('api') calls from ${path.basename(filePath)}.`);
    } catch (error) {
      console.error(`Error updating ${path.basename(filePath)}:`, error.message);
    }
  }
}

// Run the update functions
updateSupabaseClient();
removeSchemaApiCalls();

console.log('\nUpdate complete. The application should now use the public schema for all database operations.');
