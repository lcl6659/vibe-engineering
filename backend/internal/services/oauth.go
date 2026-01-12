package services

import (
	"context"
	"encoding/json"
	"fmt"

	"go.uber.org/zap"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/youtube/v3"
)

// OAuthService handles Google OAuth 2.0 authentication.
type OAuthService struct {
	config *oauth2.Config
	log    *zap.Logger
}

// NewOAuthService creates a new OAuthService.
func NewOAuthService(clientID, clientSecret, redirectURL string, log *zap.Logger) *OAuthService {
	config := &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Scopes: []string{
			youtube.YoutubeReadonlyScope,
			youtube.YoutubeForceSslScope, // Required for Captions API access
		},
		Endpoint: google.Endpoint,
	}

	return &OAuthService{
		config: config,
		log:    log,
	}
}

// GetAuthURL generates the OAuth 2.0 authorization URL.
func (s *OAuthService) GetAuthURL(state string) string {
	return s.config.AuthCodeURL(state, oauth2.AccessTypeOffline)
}

// ExchangeCode exchanges the authorization code for an access token.
func (s *OAuthService) ExchangeCode(ctx context.Context, code string) (*oauth2.Token, error) {
	token, err := s.config.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange code: %w", err)
	}
	return token, nil
}

// RefreshToken refreshes an expired access token.
func (s *OAuthService) RefreshToken(ctx context.Context, refreshToken string) (*oauth2.Token, error) {
	token := &oauth2.Token{
		RefreshToken: refreshToken,
	}
	tokenSource := s.config.TokenSource(ctx, token)
	newToken, err := tokenSource.Token()
	if err != nil {
		return nil, fmt.Errorf("failed to refresh token: %w", err)
	}
	return newToken, nil
}

// ValidateToken validates an access token.
func (s *OAuthService) ValidateToken(ctx context.Context, token string) (bool, error) {
	// Create a YouTube client to test the token
	client := s.config.Client(ctx, &oauth2.Token{
		AccessToken: token,
	})

	_, err := youtube.New(client)
	if err != nil {
		return false, err
	}

	return true, nil
}

// TokenToJSON converts an OAuth2 token to JSON string for storage.
func (s *OAuthService) TokenToJSON(token *oauth2.Token) (string, error) {
	data, err := json.Marshal(token)
	if err != nil {
		return "", fmt.Errorf("failed to marshal token: %w", err)
	}
	return string(data), nil
}

// TokenFromJSON converts a JSON string to an OAuth2 token.
func (s *OAuthService) TokenFromJSON(tokenJSON string) (*oauth2.Token, error) {
	var token oauth2.Token
	if err := json.Unmarshal([]byte(tokenJSON), &token); err != nil {
		return nil, fmt.Errorf("failed to unmarshal token: %w", err)
	}
	return &token, nil
}

// GetClient returns an HTTP client configured with the OAuth token.
func (s *OAuthService) GetClient(ctx context.Context, token *oauth2.Token) *oauth2.Config {
	return s.config
}
