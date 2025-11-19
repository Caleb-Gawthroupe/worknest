# Setting Up CLSI for LaTeX PDF Compilation

This guide explains how to set up Overleaf's CLSI (Common LaTeX Service Interface) for proper LaTeX-to-PDF compilation.

## Option 1: Local CLSI Setup (Recommended for Development)

### Prerequisites
- Docker installed on your system
- Git (to clone the repository)

### Steps

1. **Clone the Overleaf repository** (CLSI is now part of the main Overleaf repo):
   ```bash
   git clone https://github.com/overleaf/overleaf.git
   cd overleaf
   ```

2. **Build the Docker image from the root directory** (this will take several minutes):
   ```bash
   # IMPORTANT: Build from the root of the overleaf repository, not from services/clsi
   docker build -f services/clsi/Dockerfile -t overleaf/clsi .
   ```

3. **Navigate to CLSI service directory**:
   ```bash
   cd services/clsi
   ```

4. **Pull the TeX Live image**:
   ```bash
   docker pull texlive/texlive:latest
   ```

5. **Create directories for compiles and cache** (from services/clsi directory):
   ```bash
   mkdir -p compiles cache
   ```

6. **Run CLSI service** (from services/clsi directory):
   ```bash
   docker run --rm \
     -p 127.0.0.1:3013:3013 \
     -e LISTEN_ADDRESS=0.0.0.0 \
     -e DOCKER_RUNNER=true \
     -e TEXLIVE_IMAGE=texlive/texlive:latest \
     -e TEXLIVE_IMAGE_USER=root \
     -e COMPILES_HOST_DIR="$PWD/compiles" \
     -v "$PWD/compiles:/app/compiles" \
     -v "$PWD/cache:/app/cache" \
     -v /var/run/docker.sock:/var/run/docker.sock \
     --name clsi \
     overleaf/clsi
   ```

**Note**: The first time you build the CLSI image, it may take 10-15 minutes as it needs to compile all dependencies.

6. **Configure the frontend**:
   - Open browser console
   - Run: `localStorage.setItem('CLSI_URL', 'http://localhost:3013')`
   - Refresh the page

### For macOS Users
If you're on macOS, you may need to use:
```bash
-v /var/run/docker.sock.raw:/var/run/docker.sock
```
instead of:
```bash
-v /var/run/docker.sock:/var/run/docker.sock
```

### For Linux Users
You may need to set proper permissions:
```bash
sudo chown -R 1000:root compiles
sudo chmod -R g+w compiles
sudo chmod g+s compiles
```

## Option 2: Remote CLSI Service

If you have a remote CLSI service running, you can configure it:

```javascript
localStorage.setItem('CLSI_URL', 'https://your-clsi-service.com');
```

## Option 3: Use Public LaTeX Compilation Services

The application will automatically try public services like:
- latexonline.cc (free public service)

## Testing

Once CLSI is running, test it:
1. Generate a worksheet
2. Click "Download PDF"
3. The application will try to compile the LaTeX using CLSI
4. If successful, you'll get a properly compiled PDF

## Troubleshooting

- **Port 3013 already in use**: Change the port mapping in the docker run command
- **Permission errors**: Check Docker socket permissions
- **Compilation fails**: Check CLSI logs in the Docker container
- **CORS errors**: Make sure CLSI is configured to allow requests from your domain

## API Reference

CLSI API endpoint: `POST /project/:id/compile`

Request format:
```json
{
  "compile": {
    "options": {
      "compiler": "pdflatex",
      "timeout": 60
    },
    "rootResourcePath": "main.tex",
    "resources": [
      {
        "path": "main.tex",
        "content": "\\documentclass{article}..."
      }
    ]
  }
}
```

For more details, see: https://github.com/overleaf/clsi

