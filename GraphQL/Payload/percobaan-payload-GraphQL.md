query asli

{"operationName":"DeleteWorkspaceSiteMembership","variables":{"args":{"siteMembership":"dcf44e04-0e42-4c20-a6f7-7782622b306e","workspaceId":"eaed9896-c15d-4705-a076-9c7d591735d9"}},"extensions":{"clientLibrary":{"name":"@apollo/client","version":"4.1.6"}},"query":"mutation DeleteWorkspaceSiteMembership($args: DeleteWorkspaceSiteMembershipArgs!) {\n  deleteWorkspaceSiteMembership(args: $args) {\n    indexedSiteMembership {\n      id\n      __typename\n    }\n    siteMembership {\n      id\n      __typename\n    }\n    __typename\n  }\n}"}

{
  "query": "mutation { updateWorkspace(id: \"bf214d94-d966-4c32-b943-c6a3144dc19d\", name: \"Hacked By Zaenal\") { id name } }"
}

RESPONSE:

{"errors":[{"message":"Cannot query field \"updateWorkspace\" on type \"Mutation\". Did you mean \"createWorkspace\", \"updateWorkspaceLogo\", \"updateWorkspaceName\", \"updateCurrentWorkspace\", or \"updateWorkspaceWebhook\"?","locations":[{"line":1,"column":12}],"extensions":{"code":"GRAPHQL_VALIDATION_FAILED"}}]}



{
  "query": "mutation { updateWorkspaceName(id: \"bf214d94-d966-4c32-b943-c6a3144dc19d\", name: \"Testing Security Audit\") { id name } }"
}

RESPONSE:
{"errors":[{"message":"Unknown argument \"id\" on field \"Mutation.updateWorkspaceName\".","locations":[{"line":1,"column":32}],"extensions":{"code":"GRAPHQL_VALIDATION_FAILED"}},{"message":"Unknown argument \"name\" on field \"Mutation.updateWorkspaceName\".","locations":[{"line":1,"column":76}],"extensions":{"code":"GRAPHQL_VALIDATION_FAILED"}},{"message":"Cannot query field \"id\" on type \"UpdateWorkspaceNamePayload\".","locations":[{"line":1,"column":110}],"extensions":{"code":"GRAPHQL_VALIDATION_FAILED"}},{"message":"Cannot query field \"name\" on type \"UpdateWorkspaceNamePayload\".","locations":[{"line":1,"column":113}],"extensions":{"code":"GRAPHQL_VALIDATION_FAILED"}}]}


{
  "query": "mutation { updateWorkspaceName(input: { id: \"bf214d94-d966-4c32-b943-c6a3144dc19d\", name: \"Testing Security Audit\" }) { workspace { id name } } }"
}


{"errors":[{"message":"Unknown argument \"input\" on field \"Mutation.updateWorkspaceName\".","locations":[{"line":1,"column":32}],"extensions":{"code":"GRAPHQL_VALIDATION_FAILED"}}]}


{"errors":[{"message":"Unknown argument \"name\" on field \"Mutation.updateWorkspaceName\".","locations":[{"line":1,"column":32}],"extensions":{"code":"GRAPHQL_VALIDATION_FAILED"}}]}


{
  "query": "mutation { updateWorkspaceName { workspace } }"
}


{"errors":[{"message":"Field \"workspace\" of type \"Workspace\" must have a selection of subfields. Did you mean \"workspace { ... }\"?","locations":[{"line":1,"column":34}],"extensions":{"code":"GRAPHQL_VALIDATION_FAILED"}}]}


{
  "query": "mutation { updateWorkspaceName { workspace { id name } } }"
}

{"errors":[{"message":"UpdateWorkspaceName.mutate() missing 1 required positional argument: 'args'","path":["updateWorkspaceName"],"extensions":{"serviceName":"yggdrasil-graphql-service","code":"DOWNSTREAM_SERVICE_ERROR"}}],"data":{"updateWorkspaceName":null}}