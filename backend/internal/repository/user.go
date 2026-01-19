package repository

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"vibe-backend/internal/models"
)

// UserRepository handles database operations for users.
type UserRepository struct {
	db *gorm.DB
}

// NewUserRepository creates a new UserRepository.
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create creates a new user with hashed password and API key.
func (r *UserRepository) Create(ctx context.Context, user *models.User) error {
	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}
	user.Password = string(hashedPassword)

	// Generate API key
	apiKey, err := generateAPIKey()
	if err != nil {
		return fmt.Errorf("failed to generate API key: %w", err)
	}
	user.APIKey = apiKey

	return r.db.WithContext(ctx).Create(user).Error
}

// GetByID returns a user by ID.
func (r *UserRepository) GetByID(ctx context.Context, id uint) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByEmail returns a user by email.
func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByAPIKey returns a user by API key.
func (r *UserRepository) GetByAPIKey(ctx context.Context, apiKey string) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).Where("api_key = ?", apiKey).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// Update updates a user record.
func (r *UserRepository) Update(ctx context.Context, user *models.User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

// UpdatePassword updates a user's password.
func (r *UserRepository) UpdatePassword(ctx context.Context, userID uint, newPassword string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	return r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", userID).
		Update("password", string(hashedPassword)).Error
}

// VerifyPassword verifies a user's password.
func (r *UserRepository) VerifyPassword(user *models.User, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	return err == nil
}

// RegenerateAPIKey generates a new API key for a user.
func (r *UserRepository) RegenerateAPIKey(ctx context.Context, userID uint) (string, error) {
	apiKey, err := generateAPIKey()
	if err != nil {
		return "", fmt.Errorf("failed to generate API key: %w", err)
	}

	err = r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", userID).
		Update("api_key", apiKey).Error
	if err != nil {
		return "", err
	}

	return apiKey, nil
}

// Delete soft-deletes a user.
func (r *UserRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.User{}, id).Error
}

// generateAPIKey generates a random API key.
func generateAPIKey() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
