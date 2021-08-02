terraform {
  backend "s3" {
    region  = "us-east-1"
    key     = "wri__fw_teams.tfstate"
    encrypt = true
  }
}

# Docker image for FW Template app
module "app_docker_image" {
  source     = "git::https://github.com/wri/gfw-terraform-modules.git//terraform/modules/container_registry?ref=v0.5.1"
  image_name = lower("${var.project_prefix}-docker-image")
  root_dir = "${path.root}/../"
  tag = local.container_tag
}

module "lb_listener_rule" {
  source = "./modules/lb_listener_rule"
  container_port = var.container_port
  lb_target_group_arn = module.fargate_autoscaling.lb_target_group_arn
  listener_arn = data.terraform_remote_state.fw_core.outputs.lb_listener_arn
  project_prefix = var.project_prefix
  path_pattern = ["/teams*"]
  tags = local.tags
  vpc_id = data.terraform_remote_state.core.outputs.vpc_id
  priority = 4
}

module "fargate_autoscaling" {
  source  = "git::https://github.com/wri/gfw-terraform-modules.git//terraform/modules/fargate_autoscaling?ref=v0.5.1"
  project = var.project_prefix
  tags = local.fargate_tags
  vpc_id = data.terraform_remote_state.core.outputs.vpc_id
  private_subnet_ids = data.terraform_remote_state.core.outputs.private_subnet_ids
  public_subnet_ids = data.terraform_remote_state.core.outputs.public_subnet_ids
  container_name = var.project_prefix
  container_port = var.container_port
  desired_count = var.desired_count
  fargate_cpu = var.fargate_cpu
  fargate_memory = var.fargate_memory
  auto_scaling_cooldown = var.auto_scaling_cooldown
  auto_scaling_max_capacity = var.auto_scaling_max_capacity
  auto_scaling_max_cpu_util = var.auto_scaling_max_cpu_util
  auto_scaling_min_capacity = var.auto_scaling_min_capacity
  load_balancer_arn = data.terraform_remote_state.fw_core.outputs.lb_arn
  load_balancer_security_group = data.terraform_remote_state.fw_core.outputs.lb_security_group_id
  cluster_id = data.terraform_remote_state.fw_core.outputs.ecs_cluster_id
  cluster_name = data.terraform_remote_state.fw_core.outputs.ecs_cluster_name
  security_group_ids = [
    data.terraform_remote_state.core.outputs.redis_security_group_id]
  task_role_policies = []
  task_execution_role_policies = [
    data.terraform_remote_state.fw_core.outputs.gfw_data_api_key_secret_policy_arn,
  ]
  container_definition = data.template_file.container_definition.rendered
}

data "template_file" "container_definition" {
  template = file("${path.root}/templates/container_definition.json.tmpl")
  vars = {
    environment = var.environment
    aws_region = var.region
    image = "${module.app_docker_image.repository_url}:${local.container_tag}"
    container_name = var.project_prefix
    container_port = var.container_port
    log_group = aws_cloudwatch_log_group.default.name
    log_level = var.log_level
    db_secret_arn = data.terraform_remote_state.core.outputs.document_db_secrets_arn
    data_bucket = data.terraform_remote_state.fw_core.outputs.data_bucket
    redis_endpoint = data.terraform_remote_state.core.outputs.redis_replication_group_primary_endpoint_address
    gfw_data_api_key = data.terraform_remote_state.fw_core.outputs.gfw_data_api_key_secret_arn
  }

}

#
# CloudWatch Resources
#
resource "aws_cloudwatch_log_group" "default" {
  name = "/aws/ecs/${var.project_prefix}-log"
  retention_in_days = var.log_retention
}
