terraform {
  required_providers {
    fly = {
      source  = "fly-apps/fly"
      version = "~> 0.0.21"
    }
  }
  required_version = ">= 1.0.0"
}

provider "fly" {
  // Use fly authentication via:
  // flyctl auth token | flyctl auth token
  // or set the FLY_API_TOKEN environment variable
}

resource "fly_app" "app" {
  name = "postgres-api-demo"
  org  = var.fly_org
}

resource "fly_ip" "ipv4" {
  app        = fly_app.app.name
  type       = "v4"
  depends_on = [fly_app.app]
}

resource "fly_ip" "ipv6" {
  app        = fly_app.app.name
  type       = "v6"
  depends_on = [fly_app.app]
}

resource "fly_postgres_app" "db" {
  name         = "postgres-api-demo-db"
  org          = var.fly_org
  region       = var.primary_region
  vm_size      = "shared-cpu-1x"
  volume_size  = 1
  plan         = "postgres-hobby-1x"
  depends_on   = [fly_app.app]
}

resource "fly_postgres_attachment" "db" {
  app        = fly_app.app.name
  database   = fly_postgres_app.db.name
  depends_on = [fly_postgres_app.db]
}
