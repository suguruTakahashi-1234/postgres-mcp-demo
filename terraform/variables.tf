variable "fly_org" {
  description = "The Fly.io organization to deploy to"
  type        = string
  default     = "personal"
}

variable "primary_region" {
  description = "The primary region for deployment"
  type        = string
  default     = "nrt"
}
