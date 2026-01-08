package config

import (
	"github.com/caarlos0/env/v11"
)

// Config holds all application configuration loaded from environment variables.
type Config struct {
	// Server configuration
	Port string `env:"PORT" envDefault:"8080"`
	Env  string `env:"ENV" envDefault:"production"`

	// Database configuration (PostgreSQL)
	DatabaseURL string `env:"DATABASE_URL" envDefault:"postgresql://postgres:ZEWZMzkHcPGIgtzcIcyJZstIAWGkUZdP@postgres.railway.internal:5432/railway"`

	// Cache configuration (Redis)
	RedisURL string `env:"REDIS_URL" envDefault:"redis://default:GhJbhiRbqKkwmPtnCqUBCnTdCdRlsIwL@redis.railway.internal:6379"`

	// Logging configuration
	LogLevel string `env:"LOG_LEVEL" envDefault:"info"`

	// CORS configuration
	AllowedOrigins []string `env:"ALLOWED_ORIGINS" envSeparator:"," envDefault:"*"`

	// OpenRouter API configuration
	OpenRouterAPIKey string `env:"OPENROUTER_API_KEY" envDefault:""`
}

// Load parses environment variables and returns a Config struct.
func Load() (*Config, error) {
	cfg := &Config{}
	if err := env.Parse(cfg); err != nil {
		return nil, err
	}
	return cfg, nil
}

// IsDevelopment returns true if running in development environment.
func (c *Config) IsDevelopment() bool {
	return c.Env == "development"
}

// IsProduction returns true if running in production environment.
func (c *Config) IsProduction() bool {
	return c.Env == "production"
}
