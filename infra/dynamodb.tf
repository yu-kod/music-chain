resource "aws_dynamodb_table" "nodes" {
  name         = "${var.project_name}-nodes"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "edges" {
  name         = "${var.project_name}-edges"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "from_node_id"
  range_key    = "to_node_id"

  attribute {
    name = "from_node_id"
    type = "S"
  }

  attribute {
    name = "to_node_id"
    type = "S"
  }

  global_secondary_index {
    name            = "gsi-to-node"
    hash_key        = "to_node_id"
    range_key       = "from_node_id"
    projection_type = "ALL"
  }
}
