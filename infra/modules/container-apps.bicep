@description('Location for all resources.')
param location string

@description('Tags to apply to all resources.')
param tags object = {}

@description('Name of the Container Apps Environment.')
param environmentName string

@description('Name of the API Container App.')
param apiAppName string

@description('Container Registry login server.')
param containerRegistryLoginServer string

@description('Container Registry name for credential lookup.')
param containerRegistryName string

@description('Log Analytics workspace customer ID.')
param logAnalyticsWorkspaceId string

@secure()
@description('Log Analytics workspace shared key.')
param logAnalyticsWorkspaceKey string

@description('Application Insights connection string.')
param appInsightsConnectionString string

@description('Power BI Report ID (optional).')
param pbiReportId string = ''

@description('Power BI Embed URL (optional).')
param pbiEmbedUrl string = ''

@description('Allowed CORS origins (comma-separated).')
param allowedOrigins string = ''

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' existing = {
  name: containerRegistryName
}

resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: environmentName
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspaceId
        sharedKey: logAnalyticsWorkspaceKey
      }
    }
  }
}

resource apiContainerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: apiAppName
  location: location
  tags: union(tags, { 'azd-service-name': 'api' })
  properties: {
    environmentId: containerAppsEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8000
        transport: 'auto'
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'OPTIONS']
          allowedHeaders: ['*']
        }
      }
      secrets: [
        {
          name: 'registry-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
      ]
      registries: [
        {
          server: containerRegistryLoginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'registry-password'
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'api'
          image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: appInsightsConnectionString }
            { name: 'PBI_REPORT_ID', value: pbiReportId }
            { name: 'PBI_EMBED_URL', value: pbiEmbedUrl }
            { name: 'ALLOWED_ORIGINS', value: allowedOrigins }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
}

output apiUrl string = 'https://${apiContainerApp.properties.configuration.ingress.fqdn}'
