environment               = "staging"
log_level                 = "info"
desired_count             = 1
auto_scaling_min_capacity = 1
auto_scaling_max_capacity = 15

container_port            = "80"

NODE_PATH         = "app/src"
JWT_SECRET        = "overridden_in_github_secrets"
redis_queue_name  = "mail"
APP_URL           = "https://gfw-web-staging.cube-cdn.com"
USERS_API_URL     = "https://gfw-staging.globalforestwatch.org/v1"
CONTROL_TOWER_URL = "https://staging-api.resourcewatch.org"

healthcheck_path = "/v1/fw_teams/healthcheck"
healthcheck_sns_emails = ["server@3sidedcube.com"]