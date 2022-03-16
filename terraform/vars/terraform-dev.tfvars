container_port            = "80"
environment               = "dev"
log_level                 = "debug"
desired_count             = 1
auto_scaling_min_capacity = 1
auto_scaling_max_capacity = 5


NODE_PATH         = "app/src"
JWT_SECRET        = "@@JWT_SECRET@@"
redis_queue_name  = "mail"
APP_URL           = "http://127.0.0.1:80"
USERS_API_URL     = "https://api.resourcewatch.org"
CONTROL_TOWER_URL = "https://api.resourcewatch.org"

healthcheck_path = "/v1/fw_teams/healthcheck"
healthcheck_sns_emails = ["server@3sidedcube.com"]