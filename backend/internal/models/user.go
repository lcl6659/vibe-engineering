package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents a user account.
type User struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	Email    string `json:"email" gorm:"type:varchar(255);uniqueIndex;not null"`
	Password string `json:"-" gorm:"type:varchar(255);not null"` // bcrypt hash, never exposed in JSON
	Name     string `json:"name" gorm:"type:varchar(255)"`
	APIKey   string `json:"-" gorm:"type:varchar(64);uniqueIndex;not null"` // API key for authentication

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName returns the table name for User model.
func (User) TableName() string {
	return "users"
}

// UserResponse represents the user data returned in API responses.
type UserResponse struct {
	ID        uint      `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

// RegisterRequest represents the user registration request.
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Name     string `json:"name" binding:"required,min=1"`
}

// LoginRequest represents the user login request.
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// AuthResponse represents the response after successful login/registration.
type AuthResponse struct {
	User   UserResponse `json:"user"`
	APIKey string       `json:"api_key"`
}
