terraform {
  backend "s3" {
    region  = "us-east-1"
    key     = "wri__fw_teams.tfstate"
    encrypt = true
  }
}
