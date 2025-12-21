# Walkthrough - AWS CI/CD for Antigravity Agent

This guide provides step-by-step instructions to initialize and verify the production-ready deployment pipeline for the Antigravity Agent.

## 1. AWS Initial Setup

### Create ECR Repository
1. Navigate to the AWS Console -> ECR -> Repositories.
2. Click **Create repository**.
3. Name: `antigravity-agent` (matches the GitHub Action's `ECR_REPOSITORY_NAME`).
4. Set **Tag immutability** to `Disabled` (allows re-pushing same tag if needed) or `Enabled` for production best practice (recommended).

### Provision EC2 Instance
1. Launch an EC2 Instance (t3.micro or larger, Ubuntu 22.04 LTS).
2. Create an IAM Role for EC2 with the policy defined in [iam-policy.json](file:///Users/arsalan/Documents/GitHub/Bronn/aws/iam-policy.json).
3. Attach the IAM Role to the EC2 instance.
4. Run the [ec2-setup.sh](file:///Users/arsalan/Documents/GitHub/Bronn/aws/ec2-setup.sh) script on the instance to install Docker and AWS CLI.

### SSM Parameter Store (Secrets)
1. Go to AWS Systems Manager -> Parameter Store.
2. Create parameters for environment variables if needed (e.g., `/antigravity/DB_URL`).
3. The deployment script can be modified to inject these into the container.

---

## 2. GitHub Actions Secrets

Add the following secrets to your GitHub repository (`Settings -> Secrets and variables -> Actions`):

| Secret Name | Description |
| :--- | :--- |
| `AWS_ACCESS_KEY_ID` | IAM User Access Key with ECR/SSM permissions |
| `AWS_SECRET_ACCESS_KEY` | IAM User Secret Key |
| `AWS_REGION` | e.g., `us-east-1` |
| `ECR_REPOSITORY_NAME` | `antigravity-agent` |
| `EC2_INSTANCE_ID` | The ID of your target EC2 instance (e.g., `i-0123456789abcdef0`) |

---

## 3. Verification & Deployment

### Run Automation
Push a change to the `main` branch. This triggers:
1. **Tests**: Running FastAPI health check tests.
2. **Build**: Creating a production image from the [Dockerfile](file:///Users/arsalan/Documents/GitHub/Bronn/apps/backend-api/Dockerfile).
3. **Push**: Uploading the image to ECR.
4. **Deploy**: Triggering the [deploy-ssm.sh](file:///Users/arsalan/Documents/GitHub/Bronn/scripts/deploy-ssm.sh) script on EC2 via AWS SSM.

### Manual Verification
Run these commands via SSM or local AWS CLI:

**Check Container Status:**
```bash
aws ssm send-command --instance-ids <ID> --document-name "AWS-RunShellScript" --parameters 'commands=["docker ps"]'
```

**Check Application Logs:**
```bash
aws ssm send-command --instance-ids <ID> --document-name "AWS-RunShellScript" --parameters 'commands=["docker logs antigravity-agent"]'
```

---

## 4. Rollback Strategy

To rollback to a previous version without code changes:

1. Locate the `commit SHA` (image tag) you want to revert to in ECR.
2. Manually trigger the SSM deployment script with the desired tag:
   ```bash
   aws ssm send-command \
     --instance-ids <INSTANCE_ID> \
     --document-name "AWS-RunShellScript" \
     --parameters "commands=[
       \"/tmp/deploy-ssm.sh <ECR_URL>/antigravity-agent <PREVIOUS_COMMIT_SHA>\"
     ]"
   ```
3. Alternatively, revert the commit in GitHub and push to `main` to trigger the automated rollback.
