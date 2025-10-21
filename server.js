import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8000;

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

// Function to start server on available port
function startServer(port) {
    const server = http.createServer((req, res) => {
        console.log(`${req.method} ${req.url}`);

        // Parse URL
        let filePath = '.' + req.url;
        if (filePath === './') {
            filePath = './index.html';
        }

        const extname = String(path.extname(filePath)).toLowerCase();
        const mimeType = mimeTypes[extname] || 'application/octet-stream';

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    // File not found
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(`
                        <html>
                            <head><title>404 - File Not Found</title></head>
                            <body>
                                <h1>404 - File Not Found</h1>
                                <p>The requested file was not found on this server.</p>
                                <p><a href="/">Go back to CargoLume</a></p>
                            </body>
                        </html>
                    `, 'utf-8');
        } else {
                    // Server error
                    res.writeHead(500);
                    res.end(`Server Error: ${error.code}`);
                }
            } else {
                // Success
                res.writeHead(200, { 'Content-Type': mimeType });
                res.end(content, 'utf-8');
            }
        });
    });

    server.listen(port, () => {
        console.log(`🚛 CargoLume Server running at http://localhost:${port}/`);
        console.log(`📁 Serving files from: ${__dirname}`);
        console.log(`🌐 Open your browser and go to: http://localhost:${port}`);
        console.log(`⏹️  Press Ctrl+C to stop the server`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`⚠️  Port ${port} is already in use. Trying port ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });

    // Handle server shutdown gracefully
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down CargoLume server...');
        server.close(() => {
            console.log('✅ Server stopped successfully');
            process.exit(0);
        });
    });
}

// Start the server
startServer(PORT);