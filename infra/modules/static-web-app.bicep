@description('Location for all resources.')
param location string

@description('Tags to apply to all resources.')
param tags object = {}

@description('Name of the Static Web App.')
param name string

resource staticWebApp 'Microsoft.Web/staticSites@2022-09-01' = {
  name: name
  location: location
  tags: union(tags, { 'azd-service-name': 'web' })
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
}

output url string = 'https://${staticWebApp.properties.defaultHostname}'
output defaultHostname string = staticWebApp.properties.defaultHostname
output name string = staticWebApp.name
