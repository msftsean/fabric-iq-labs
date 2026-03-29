targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment used to generate a short unique hash for resources.')
param environmentName string

@minLength(1)
@description('Primary location for all resources.')
param location string

@description('Optional Power BI Report ID for embedding.')
param pbiReportId string = ''

@description('Optional Power BI Embed URL for embedding.')
param pbiEmbedUrl string = ''

var abbrs = loadJsonContent('abbreviations.json')
var resourceSuffix = take(uniqueString(subscription().id, environmentName, location), 6)
var tags = { 'azd-env-name': environmentName }

resource rg 'Microsoft.Resources/resourceGroups@2023-07-01' = {
  name: 'rg-${environmentName}'
  location: location
  tags: tags
}

module monitoring './modules/monitoring.bicep' = {
  name: 'monitoring'
  scope: rg
  params: {
    location: location
    tags: tags
    logAnalyticsName: '${abbrs.operationalInsightsWorkspaces}${environmentName}-${resourceSuffix}'
    appInsightsName: '${abbrs.insightsComponents}${environmentName}-${resourceSuffix}'
  }
}

module containerRegistry './modules/container-registry.bicep' = {
  name: 'container-registry'
  scope: rg
  params: {
    location: location
    tags: tags
    name: replace('${abbrs.containerRegistryRegistries}${environmentName}${resourceSuffix}', '-', '')
  }
}

module containerApps './modules/container-apps.bicep' = {
  name: 'container-apps'
  scope: rg
  params: {
    location: location
    tags: tags
    environmentName: '${abbrs.appManagedEnvironments}${environmentName}-${resourceSuffix}'
    apiAppName: 'ca-api-${resourceSuffix}'
    containerRegistryLoginServer: containerRegistry.outputs.loginServer
    containerRegistryName: containerRegistry.outputs.name
    logAnalyticsWorkspaceId: monitoring.outputs.logAnalyticsWorkspaceId
    logAnalyticsWorkspaceKey: monitoring.outputs.logAnalyticsWorkspaceKey
    appInsightsConnectionString: monitoring.outputs.appInsightsConnectionString
    pbiReportId: pbiReportId
    pbiEmbedUrl: pbiEmbedUrl
  }
}

module staticWebApp './modules/static-web-app.bicep' = {
  name: 'static-web-app'
  scope: rg
  params: {
    location: location
    tags: tags
    name: '${abbrs.webStaticSites}${environmentName}-${resourceSuffix}'
  }
}

output AZURE_RESOURCE_GROUP string = rg.name
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = containerRegistry.outputs.loginServer
output AZURE_CONTAINER_REGISTRY_NAME string = containerRegistry.outputs.name
output API_URL string = containerApps.outputs.apiUrl
output WEB_URL string = staticWebApp.outputs.url
output AZURE_LOG_ANALYTICS_WORKSPACE_ID string = monitoring.outputs.logAnalyticsWorkspaceId
