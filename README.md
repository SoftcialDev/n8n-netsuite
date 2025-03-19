# n8n Nodes for NetSuite Connector

A custom n8n node to integrate with a NetSuite-like API via a Flask deployment.

> **Note:**  
> This API now requires authentication. You must configure your API keys and secrets through n8n's credential system. See the [Future Improvements: Credentials](#future-improvements-credentials) section for details on the credentials file.

## Table of Contents

- [Overview](#overview)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Installation & Development](#installation--development)
  - [Installing n8n Globally](#installing-n8n-globally)
  - [Building the Custom Node](#building-the-custom-node)
  - [Troubleshooting PNPM Global Bin Directory](#troubleshooting-pnpm-global-bin-directory)
- [Docker Image](#docker-image)
  - [Building the Docker Image](#building-the-docker-image)
  - [Running the Docker Container Locally](#running-the-docker-container-locally)
- [Deploying in Kubernetes](#deploying-in-kubernetes)
- [Future Improvements: Credentials](#future-improvements-credentials)
- [Publishing to npm](#publishing-to-npm)
- [References](#references)

## Overview

This project provides a custom n8n node called **NetSuite Connector**. It integrates with a NetSuite-like API hosted at:

```

```

The node supports various endpoints such as:
- `/v1/customers` (GET)
- `/v1/products` (GET)
- `/v1/salesorders/{transaction_number}/items` (GET)
- `/v1/salesorders/daterange` (POST)
- `/v1/customers/search/by-email` (POST)

Since the API now requires authentication, you must configure your API credentials via n8n. These credentials are managed using a credentials file that is included in this package.

## Folder Structure

```
n8n-custom-node/
├── credentials/                        
│   └── NetSuiteApi.credentials.ts     # Credential file for NetSuite API authentication.
├── nodes/
│   └── NetSuiteConnector/              
│       ├── netsuite.svg               # (Optional) Icon for your node.
│       ├── NetSuiteConnector.node.json  # Codex metadata.
│       └── NetSuiteConnector.node.ts   # Main node logic.
├── dist/                               # Compiled output (generated after build).
│   ├── nodes/                          
│   └── credentials/                    # Compiled credentials file.
├── Dockerfile                          # Docker build file.
├── docker-entrypoint.sh                # Entrypoint script for Docker image.
├── package.json                        # Project manifest.
├── tsconfig.json                       # TypeScript configuration.
└── README.md                           # This file.
```

## Prerequisites

- **Node.js:** Version >=18.17 (required by n8n).
- **pnpm:** Recommended package manager for installing n8n.
- **Docker:** For building and running the Docker image.
- **Kubernetes (Optional):** For deploying the image to a remote cluster (e.g., Azure AKS).

## Installation & Development

### Installing n8n Globally

To install n8n globally using pnpm:

```bash
pnpm install n8n -g
```

This installs n8n so you can test your custom node locally.

### Building the Custom Node

1. **Install project dependencies:**

   ```bash
   pnpm install just after running previous command pnpm install n8n -g
   ```

2. **Compile the TypeScript files:**

   ```bash
   npm run build
   ```

   This creates the `dist/` folder with your compiled node code and credentials file.

3. **(Optional) Test Locally via npm link:**

   You can link your node package into your local n8n installation:

   ```bash
   npm link
   cd ~/.n8n/custom/
   npm init -y    # If not already done.
   npm link n8n-nodes-netsuite
   n8n start
   ```

   Then open [http://localhost:5678](http://localhost:5678) in your browser and search for **NetSuite Connector**.

### Troubleshooting PNPM Global Bin Directory

If you encounter an error like:

```
ERR_PNPM_NO_GLOBAL_BIN_DIR Unable to find the global bin directory
```

follow these steps:

1. **Set the PNPM_HOME variable** (using PowerShell):

   ```powershell
   [Environment]::SetEnvironmentVariable("PNPM_HOME", "C:\Users\<YourUserName>\AppData\Local\pnpm\global\5", "User")
   ```

2. **Add PNPM_HOME to your PATH**:

   ```powershell
   $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
   $newPath = $currentPath + ";C:\Users\<YourUserName>\AppData\Local\pnpm\global\5"
   [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
   ```

3. **Restart your terminal** and verify with:

   ```powershell
   echo $env:PATH
   pnpm root -g
   ```

4. **Install n8n globally:**

   ```bash
   pnpm install n8n -g
   ```

Replace `<YourUserName>` with your actual username.

## Docker Image

This section explains how to build a Docker image that packages n8n along with your custom NetSuite node and credentials.

### Building the Docker Image

Make sure your project is in a **non-OneDrive folder** (e.g., `C:\Projects\netsuit-custom-node`). Then run:

```bash
docker build --build-arg N8N_VERSION=1.82.3 -t softcial-netsuit-node .
```

- **`--build-arg N8N_VERSION=1.82.3`**: Specifies the version of n8n to install.
- **`-t softcial-netsuit-node`**: Tags your image.
- **`.`**: Sets the build context to the current folder.

### Running the Docker Container Locally

To test your image locally:

```bash
docker run -it --rm -p 5678:5678 --name test-netsuite softcial-netsuit-node
```

Then, open [http://localhost:5678](http://localhost:5678) in your browser. Your n8n instance should start with the **NetSuite Connector** available.

## Deploying in Kubernetes

If you are deploying to a remote Kubernetes cluster (e.g., AKS), you must push your image to a container registry accessible by your cluster.

1. **Tag your image for your registry:**

   ```bash
   docker tag softcial-netsuit-node:latest shantycb/softcial-netsuit-node:latest
   ```

2. **Push your image to Docker Hub (or another registry):**

   ```bash
   docker push shantycb/softcial-netsuit-node:latest
   ```

3. **Update your Kubernetes Deployment YAML** to use the new image:

   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: n8n
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: n8n
     template:
       metadata:
         labels:
           app: n8n
       spec:
         containers:
         - name: n8n
           image: <your-image-name>
           imagePullPolicy: Always
           ports:
           - containerPort: 5678
           env:
           - name: N8N_HOST
             value: "n8n.softcial.com"
   ```

4. **Apply the deployment:**

   ```bash
   kubectl apply -f n8n-deployment.yaml
   kubectl rollout restart deployment n8n
   ```

## Future Improvements: Credentials

Since the API now requires authentication, credentials must be configured. The credentials file is located at:

```
n8n-custom-node/credentials/NetSuiteApi.credentials.ts
```

Its compiled version will be placed in `dist/credentials/NetSuiteApi.credentials.js` and referenced in your package.json as follows:

```json
"n8n": {
  "n8nNodesApiVersion": 1,
  "nodes": [
    "dist/nodes/NetSuiteConnector/NetSuiteConnector.node.js"
  ],
  "credentials": [
    "dist/credentials/NetSuiteApi.credentials.js"
  ]
}
```

Refer to the credentials file for details on the authentication parameters required by your API.



## References

- [n8n GitHub Repository](https://github.com/n8n-io/n8n)
- [n8n Documentation – Creating Nodes](https://docs.n8n.io/integrations/creating-nodes/)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [npm Documentation](https://docs.npmjs.com/)
