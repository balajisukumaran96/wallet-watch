# Infrastructure Setup Guide

This guide explains how to deploy the Wallet Watch infrastructure using AWS CloudFormation.

## Prerequisites

- AWS CLI configured with appropriate credentials
- AWS account with necessary permissions to create CloudFormation stacks
- Understanding of AWS resources (RDS, Lambda, VPC, etc.)

## Secret Configuration

Before deploying any stacks, you must configure your secrets:

### Step 1: Create the Secrets File

1. Copy the example secrets file:
   ```bash
   cp _secret.example.json _secret.json
   ```

2. Edit `_secret.json` with your actual credentials:
   ```json
   {
     "rds_url": "your-rds-endpoint.region.rds.amazonaws.com:5432/walletwatch",
     "rds_username": "admin",
     "rds_password": "your_secure_password",
     "spring_mail_protocol": "smtp",
     "spring_mail_host": "smtp.gmail.com",
     "spring_mail_port": 465,
     "spring_mail_username": "your-email@gmail.com",
     "spring_mail_password": "your_gmail_app_password",
     "spring_mail_properties_mail_smtp_auth": true,
     "spring_mail_properties_mail_smtp_starttls_enable": true,
     "mail_smtp_starttls_enable": false,
     "spring_mail_properties_mail_smtp_ssl_enable": true,
     "spring_mail_properties_mail_smtp_starttls_required": true,
     "allowed_origin": "http://your-frontend-url.com",
     "system_email": "your-email@gmail.com"
   }
   ```

### Step 2: Configure Email Service

For Gmail SMTP, you need to:
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App-specific password
3. Use the App-specific password in `spring_mail_password`

## Deploying CloudFormation Stacks

Deploy the stacks in the following order:

### 1. Network Stack
```bash
aws cloudformation create-stack \
  --stack-name wallet-watch-network \
  --template-body file://01-network-stack.yaml
```

### 2. Secrets Manager Stack
```bash
aws cloudformation create-stack \
  --stack-name wallet-watch-secrets \
  --template-body file://02-secret-stack.yaml
```

### 3. Storage Stack (RDS)
```bash
aws cloudformation create-stack \
  --stack-name wallet-watch-storage \
  --template-body file://03-storage-stack.yaml
```

### 4. Compute Stack
```bash
aws cloudformation create-stack \
  --stack-name wallet-watch-compute \
  --template-body file://04-compute-stack.yaml
```

### 5. Serverless Stack (Lambda)
```bash
aws cloudformation create-stack \
  --stack-name wallet-watch-serverless \
  --template-body file://05-serverless-stack.yml
```

### 6. Schedule Stack (EventBridge)
```bash
aws cloudformation create-stack \
  --stack-name wallet-watch-schedule \
  --template-body file://06-schedule-stack.yaml
```

## Monitoring Stack Creation

To check the status of your stacks:

```bash
aws cloudformation describe-stacks --stack-name wallet-watch-network
```

To view stack events:

```bash
aws cloudformation describe-stack-events --stack-name wallet-watch-network
```

## Cleanup

To delete the stacks (reverse order):

```bash
aws cloudformation delete-stack --stack-name wallet-watch-schedule
aws cloudformation delete-stack --stack-name wallet-watch-serverless
aws cloudformation delete-stack --stack-name wallet-watch-compute
aws cloudformation delete-stack --stack-name wallet-watch-storage
aws cloudformation delete-stack --stack-name wallet-watch-secrets
aws cloudformation delete-stack --stack-name wallet-watch-network
```

## Important Notes

- ⚠️ **Never commit `_secret.json` to version control** - it's listed in `.gitignore`
- The `_secret.json` file contains sensitive information and should be treated securely
- Use AWS Secrets Manager in production for managing sensitive data
- Ensure your RDS database is properly secured with security groups
- Monitor CloudFormation events for any errors during stack creation
