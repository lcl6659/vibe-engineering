# Backend Module - Claude Configuration

## API Contract

All APIs MUST conform to `api/openapi.yaml`.

## Tech Stack

Go 1.24+ / Gin / GORM / PostgreSQL / Redis / Zap

## Directory Structure

```
backend/
├── cmd/server/main.go       # Entry point (DO NOT modify)
└── internal/
    ├── config/              # Environment configuration
    ├── handlers/            # HTTP handlers
    ├── models/              # GORM models
    ├── repository/          # Data access layer
    └── router/router.go     # Route registration
```

## Adding New API - Quick Reference

1. **Model** (`internal/models/xxx.go`): Use `gorm.Model` for soft delete
2. **Repository** (`internal/repository/xxx.go`): CRUD with `*gorm.DB`
3. **Handler** (`internal/handlers/xxx.go`): Gin handlers with request binding
4. **Router** (`internal/router/router.go`): Register routes in `New()`

## Key Patterns

**Error Response**:
```go
c.JSON(http.StatusBadRequest, gin.H{
    "error":      err.Error(),
    "request_id": c.GetString("request_id"),
})
```

**Success Response**:
```go
c.JSON(http.StatusOK, gin.H{"data": result})
```

**List Response**:
```go
c.JSON(http.StatusOK, gin.H{
    "data":   items,
    "limit":  limit,
    "offset": offset,
    "total":  total,
})
```

**Route Registration**:
```go
xxx := api.Group("/xxx")
{
    xxx.GET("", handler.List)
    xxx.POST("", handler.Create)
    xxx.GET("/:id", handler.Get)
    xxx.PATCH("/:id", handler.Update)
    xxx.DELETE("/:id", handler.Delete)
}
```

## Defaults

- Pagination: limit=20, offset=0
- Soft delete: Enabled (gorm.Model)
- Time format: RFC3339
- ID type: uint

## Forbidden

- Modify `cmd/server/main.go` init order
- Write raw SQL in handlers
- Skip request_id in error responses
