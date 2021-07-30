# some local
locals {
  bucket_suffix = var.environment == "production" ? "" : "-${var.environment}"
  tf_state_bucket = "gfw-terraform${local.bucket_suffix}"
  tags = data.terraform_remote_state.fw_core.outputs.tags
  fargate_tags = merge(
  {
    Job = "FW Teams Service",
  }, local.tags)
  container_tag = substr(var.git_sha, 0, 7)
}