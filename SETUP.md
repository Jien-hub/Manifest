# Microsoft Intune Dashboard Setup Guide

## Azure App Registration Setup

To connect this dashboard to Microsoft Intune, you need to create an App Registration in Azure Entra ID (formerly Azure AD).

### Step 1: Create App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Microsoft Entra ID** > **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: "Intune Dashboard" (or your preferred name)
   - **Supported account types**: "Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant)"
   - **Redirect URI**: 
     - Type: Web
     - URL: `https://your-domain.vercel.app/api/auth/callback/microsoft-entra-id`
     - For local development: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
5. Click **Register**

### Step 2: Configure API Permissions

1. In your App Registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add these permissions:
   - `User.Read` - Sign in and read user profile
   - `DeviceManagementApps.Read.All` - Read Microsoft Intune apps
   - `DeviceManagementManagedDevices.Read.All` - Read Microsoft Intune devices
6. Click **Add permissions**
7. Click **Grant admin consent for [Your Organization]** (requires admin privileges)

### Step 3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description and select expiration period
4. Click **Add**
5. **Copy the secret value immediately** - you won't be able to see it again!

### Step 4: Configure Environment Variables

Add these environment variables to your Vercel project (or `.env.local` for local development):

```env
AZURE_AD_CLIENT_ID=<Application (client) ID from Overview page>
AZURE_AD_CLIENT_SECRET=<Client secret value you just created>
AUTH_SECRET=<Random 32+ character string for session encryption>
```

To generate `AUTH_SECRET`, run:
```bash
openssl rand -base64 32
```

## Permissions Required

Your Azure account must have one of these Intune roles:
- **Intune Administrator**
- **Intune Reader** (read-only access)
- **Global Administrator**

## Features

- **Applications Overview**: View all deployed applications in your Intune tenant
- **Install Status**: See installation progress with success/failure rates
- **Version Tracking**: Compare deployed versions against latest Winget versions
- **Outdated Apps Alert**: Quickly identify applications that need updates
- **Filtering & Sorting**: Filter by app type, status, and search by name

## Troubleshooting

### "Access Denied" or "Insufficient Privileges"
- Ensure admin consent has been granted for the API permissions
- Verify your account has the required Intune role

### "Invalid client secret"
- Client secrets expire - create a new one if needed
- Make sure you copied the secret VALUE, not the secret ID

### Apps not showing
- The dashboard fetches apps from Microsoft Graph API beta endpoint
- Some app types may not be visible depending on your Intune configuration

## Support

For issues with:
- **This dashboard**: Open an issue in the repository
- **Microsoft Intune**: Contact Microsoft support
- **Azure App Registration**: See [Microsoft identity platform documentation](https://learn.microsoft.com/en-us/entra/identity-platform/)
