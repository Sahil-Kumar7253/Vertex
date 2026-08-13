# Deployment Guide and Runbook

## Server Provisioning & Prerequisites

Provision an Ubuntu-based EC2 instance in AWS with sufficient CPU and memory for the application stack. For a typical small-to-medium deployment, use an Ubuntu 22.04 LTS server instance with at least 2 vCPUs and 4 GB of RAM.

### Required Security Group Rules

Expose the following inbound ports:

- `22` - SSH access
- `80` - HTTP traffic
- `443` - HTTPS traffic

Example Security Group configuration:

| Port | Protocol | Purpose |
| :--- | :--- | :--- |
| `22` | TCP | SSH access |
| `80` | TCP | HTTP traffic |
| `443` | TCP | HTTPS traffic |

### Install Docker and Docker Compose on Ubuntu

Run the following commands to install Docker Engine and Docker Compose:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release

sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
```

After Docker installation, log out and back in or run the following to refresh group membership:

```bash
newgrp docker
```

## Application Deployment

### Clone Repository and Configure Environment Variables

Clone the application repository to the EC2 host:

```bash
git clone <repository-url>
cd <project-folder>
```

Create the production environment file by copying the example file:

```bash
cp .env.example .env
```

Update `.env` with environment-specific values such as:

- PostgreSQL database credentials
- Application port values
- JWT secret and expiry configuration
- Frontend environment variables
- Optional email or external service credentials

Example key categories include:

```bash
DB_HOST=postgres
DB_PORT=5432
DB_NAME=vertex_db
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
JWT_SECRET=your_super_secret_key
JWT_EXPIRATION=3600
NEXT_PUBLIC_API_URL=https://<your-domain>/api
```

### Build and Start Containers

From the project root, run the application in detached mode:

```bash
docker-compose up -d --build
```

This command builds the images if needed and starts the configured containers in the background.

## Reverse Proxy & SSL Configuration

### Install Nginx and Certbot

Install Nginx and the Certbot packages required for automatic TLS certificate issuance:

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

### Nginx Server Block Example

Create a site configuration for your custom domain. Example:

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name example.com www.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

This configuration routes:

- `/` to the Next.js application on port `3000`
- `/api/` to the Spring Boot application on port `8080`
- `/ws/` to the Spring Boot WebSocket/STOMP endpoint with the required upgrade headers for secure handshake negotiation

### Obtain SSL Certificates with Certbot

Run Certbot to generate and install the certificate automatically:

```bash
sudo certbot --nginx -d <your-domain>
```

This configures Nginx with the generated certificate and automatically manages HTTPS redirection and TLS settings for the web application and secure WebSocket traffic.

## Post-Deployment Verification

After the containers are running and Nginx is configured, verify the site is reachable on HTTPS and that the application and API endpoints respond successfully.

Useful checks:

```bash
curl -I https://<your-domain>
curl -I https://<your-domain>/api/health
```

If the application includes real-time collaboration features, confirm that the WebSocket endpoint is reachable over secure WSS connections via the configured Nginx proxy.
