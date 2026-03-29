@description('Location for all resources.')
param location string

@description('Tags to apply to all resources.')
param tags object = {}

@description('Name of the Container Registry. Must be alphanumeric, 5-50 chars.')
@minLength(5)
@maxLength(50)
param name string

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

output loginServer string = containerRegistry.properties.loginServer
output name string = containerRegistry.name
