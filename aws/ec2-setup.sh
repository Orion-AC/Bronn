#!/bin/bash
set -e

# Function to run apt commands with retries
apt_retry() {
    for i in {1..5}; do
        if "$@"; then
            return 0
        fi
        echo "Apt command failed, retrying in 10 seconds... (Attempt $i/5)"
        sleep 10
    done
    return 1
}

# Update system
apt_retry sudo apt-get update
apt_retry sudo apt-get upgrade -y --fix-missing

# Install Docker
apt_retry sudo apt-get install -y --no-install-recommends --fix-missing \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

apt_retry sudo apt-get update
apt_retry sudo apt-get install -y --no-install-recommends --fix-missing \
    docker-ce \
    docker-ce-cli \
    containerd.io

# Enable Docker for current user (if needed, but SSM runs as root/root-proxy)
sudo systemctl enable docker
sudo systemctl start docker

# Install AWS CLI
apt_retry sudo apt-get install -y --no-install-recommends --fix-missing unzip
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf aws awscliv2.zip

# The SSM Agent is pre-installed on Ubuntu 22.04 LTS AMIs, 
# but we ensure it's running
sudo systemctl status amazon-ssm-agent || sudo snap start amazon-ssm-agent

echo "Setup Complete! Please ensure the IAM Role is attached to this instance."
