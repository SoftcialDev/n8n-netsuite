# Use Node 18 (as required by n8n >=18.17)
FROM node:18-alpine

# ARG to pass the n8n version to install (e.g., N8N_VERSION=1.82.3)
ARG N8N_VERSION

# Verify that the argument N8N_VERSION is set
RUN if [ -z "$N8N_VERSION" ] ; then echo "The N8N_VERSION argument is missing!"; exit 1; fi

# Install essential packages
RUN apk add --update graphicsmagick tzdata git tini su-exec

# Switch to root user to install system dependencies
USER root

# Install build dependencies and then n8n globally
RUN apk --update add --virtual build-dependencies \
    python3 \
    build-base \
    ca-certificates \
    openssl \
    && \
    # Set environment variables so npm uses Python3 and allows global installs as root
    export npm_config_python=/usr/bin/python3 && \
    export npm_config_unsafe_perm=true && \
    npm_config_user=root npm install -g full-icu n8n@${N8N_VERSION} && \
    apk del build-dependencies && \
    rm -rf /root /tmp/* /var/cache/apk/* && mkdir /root

# (Optional) Install fonts if needed for certain operations (e.g., PDF generation)
RUN apk --no-cache add --virtual fonts msttcorefonts-installer fontconfig && \
    update-ms-fonts && \
    fc-cache -f && \
    apk del fonts && \
    find /usr/share/fonts/truetype/msttcorefonts/ -type l -exec unlink {} \; && \
    rm -rf /root /tmp/* /var/cache/apk/* && mkdir /root

# Configure the ICU data for n8n
ENV NODE_ICU_DATA=/usr/local/lib/node_modules/full-icu

# Set the working directory
WORKDIR /data

# Copy the entrypoint script into the container
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Create the custom folder for n8n and copy your node's compiled files
RUN mkdir -p /root/.n8n/custom
COPY dist/nodes /root/.n8n/custom/nodes
# If you don't have credentials, you can omit this:
COPY dist/credentials /root/.n8n/custom/credentials

# Define the entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose the default n8n port
EXPOSE 5678/tcp
