terraform {
  required_version = ">= 1.0"

  backend "s3" {
    bucket         = "music-chain-tfstate"
    key            = "terraform.tfstate"
    region         = "ap-northeast-1"
    dynamodb_table = "music-chain-tfstate-lock"
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# CloudFront 用 ACM 証明書は us-east-1 に必要
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
