const { execSync } = require('child_process');
const fs = require('fs');

try {
  // Get commit history in "date|message" format
  const log = execSync('git log --pretty=format:"%ad|%s" --date=short', { encoding: 'utf-8' });
  const commitEntries = log.split('\n').map(line => {
    const [date, message] = line.split('|');
    return `<li><strong>${date}:</strong> ${message}</li>`;
  }).join('\n');

  const newContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <!-- ...existing head code... -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>What's New!</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- ...existing header/nav if needed... -->
  <div class="container">
    <h1>What's New!</h1>
    <ul class="changelog">
      ${commitEntries}
    </ul>
    <a href="index.html" class="btn">Back to Home</a>
  </div>
  <!-- ...existing footer... -->
</body>
</html>`;

  fs.writeFileSync('docs/whatsnew.html', newContent);
  console.log('docs/whatsnew.html updated successfully.');
} catch (error) {
  console.error('Error generating whatsnew.html:', error);
  process.exit(1);
}
