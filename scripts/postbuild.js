import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to dist directory
const distPath = path.resolve(__dirname, '../dist');

// Create 404.html
const create404Html = () => {
  const content = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>BST - Interactive Learning</title>
    <script type="text/javascript">
      // Single Page Apps for GitHub Pages
      // MIT License
      // https://github.com/rafgraph/spa-github-pages
      var pathSegmentsToKeep = 1;

      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
  </body>
</html>`;

  fs.writeFileSync(path.join(distPath, '404.html'), content);
  console.log('Created 404.html');
};

// Update index.html
const updateIndexHtml = () => {
  const indexPath = path.join(distPath, 'index.html');
  let content = fs.readFileSync(indexPath, 'utf8');

  // Make sure favicon has correct path
  content = content.replace('href="/vite.svg"', 'href="/2331/vite.svg"');

  // Add routing script after the <title> tag
  const scriptToInsert = `
    <script type="text/javascript">
      // Single Page Apps for GitHub Pages
      // MIT License
      // https://github.com/rafgraph/spa-github-pages
      (function(l) {
        if (l.search[1] === '/' ) {
          var decoded = l.search.slice(1).split('&').map(function(s) { 
            return s.replace(/~and~/g, '&')
          }).join('?');
          window.history.replaceState(null, null,
              l.pathname.slice(0, -1) + decoded + l.hash
          );
        }
      }(window.location))
    </script>`;

  content = content.replace('</title>', '</title>' + scriptToInsert);

  fs.writeFileSync(indexPath, content);
  console.log('Updated index.html');
};

// Execute the functions
create404Html();
updateIndexHtml();

console.log('Post-build tasks completed successfully.'); 