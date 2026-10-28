# METADATA
# title: Require a nonempty team label on Deployments
# description: Deployment metadata must declare an owning team.
# schemas:
#   - input: schema["kubernetes"]
# custom:
#   id: ID001
#   severity: MEDIUM
#   input:
#     selector:
#       - type: kubernetes
package user.kubernetes.ID001

has_team {
    value := input.metadata.labels.team
    is_string(value)
    trim_space(value) != ""
}

deny[res] {
    input.kind == "Deployment"
    not has_team
    res := result.new("Deployment needs a nonempty metadata.labels.team", input.metadata)
}
