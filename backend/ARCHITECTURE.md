# 后端项目架构文档

本文档描述了后端项目的完整架构模式和代码约束。

## 📁 项目结构

```
backend/
├── cmd/
│   └── server/
│       └── main.go              # 应用入口点
│
├── internal/
│   ├── cache/                   # 缓存层
│   │   └── redis.go             # Redis 客户端封装
│   │
│   ├── config/                  # 配置管理
│   │   └── config.go            # 环境变量配置
│   │
│   ├── database/                # 数据库层
│   │   └── postgres.go          # PostgreSQL 连接封装
│   │
│   ├── handlers/                # HTTP 处理器
│   │   ├── health.go            # 健康检查处理器
│   │   └── pomodoro.go          # Pomodoro 业务处理器（示例）
│   │
│   ├── middleware/              # 中间件
│   │   ├── cors.go              # CORS 中间件
│   │   ├── logger.go            # 日志中间件
│   │   ├── recovery.go          # 错误恢复中间件
│   │   └── requestid.go        # 请求 ID 中间件
│   │
│   ├── models/                   # 数据模型
│   │   └── pomodoro.go          # Pomodoro 模型（示例）
│   │
│   ├── repository/              # 数据访问层
│   │   └── pomodoro.go          # Pomodoro 仓储（示例）
│   │
│   └── router/                   # 路由配置
│       └── router.go            # Gin 路由设置
│
├── migrations/                   # 数据库迁移
│   ├── 000001_init.up.sql
│   └── 000001_init.down.sql
│
├── go.mod                        # Go 模块定义
├── go.sum                        # 依赖校验和
├── Dockerfile                    # 生产环境构建
└── Dockerfile.dev               # 开发环境构建
```

## 🏗️ 架构模式

### 1. 分层架构

**Handler Layer** (`internal/handlers/`)

- 处理 HTTP 请求和响应
- 参数验证和绑定
- 调用 Repository 层
- 错误处理和状态码设置

**Repository Layer** (`internal/repository/`)

- 数据访问抽象
- 数据库操作封装
- 使用 GORM 进行 ORM 操作
- 上下文传递（context.Context）

**Model Layer** (`internal/models/`)

- 数据模型定义
- GORM 标签和验证
- 请求/响应 DTO
- 模型转换方法

### 2. 依赖注入

所有依赖通过构造函数注入：

- Handlers 接收 Repository
- Router 接收 Config, Database, Cache, Logger
- Repository 接收 Database 连接

### 3. 错误处理

- 使用标准 Go error 类型
- 统一的错误响应格式
- 中间件统一捕获 panic
- 日志记录所有错误

### 4. 日志记录

- 使用 `go.uber.org/zap` 结构化日志
- 日志级别：debug, info, warn, error
- 生产环境使用 JSON 格式
- 开发环境使用彩色控制台输出

## 🔧 核心组件

### 1. 配置管理 (`internal/config/`)

**功能**: 环境变量统一管理

**特性**:

- 使用 `github.com/caarlos0/env/v11` 解析环境变量
- 类型安全的配置结构
- 默认值支持
- 环境区分（development/production）

**使用示例**:

```go
cfg, err := config.Load()
if err != nil {
    panic("Failed to load config: " + err.Error())
}
```

### 2. 数据库连接 (`internal/database/`)

**功能**: PostgreSQL 数据库连接管理

**特性**:

- GORM ORM 封装
- 连接池配置
- 健康检查支持
- 优雅关闭

**使用示例**:

```go
db, err := database.NewPostgres(cfg.DatabaseURL, log)
defer db.Close()
```

### 3. 缓存层 (`internal/cache/`)

**功能**: Redis 缓存封装

**特性**:

- Redis 客户端封装
- 连接健康检查
- 常用操作封装（Set, Get, Delete, Exists）
- 优雅关闭

**使用示例**:

```go
cache, err := cache.NewRedis(cfg.RedisURL, log)
defer cache.Close()
```

### 4. 路由配置 (`internal/router/`)

**功能**: HTTP 路由和中间件配置

**特性**:

- Gin 框架路由
- 全局中间件（RequestID, Logger, Recovery, CORS）
- API 路由分组
- 健康检查路由

**路由模式**:

```go
api := r.Group("/api")
{
    resource := api.Group("/resource")
    {
        resource.GET("", handler.List)
        resource.POST("", handler.Create)
        resource.GET("/:id", handler.Get)
        resource.PATCH("/:id", handler.Update)
        resource.DELETE("/:id", handler.Delete)
    }
}
```

### 5. HTTP 处理器 (`internal/handlers/`)

**功能**: 处理 HTTP 请求

**模式**:

- 结构体包含 Repository 依赖
- 构造函数初始化
- 方法接收 `*gin.Context`
- 统一的错误响应格式

**示例结构**:

```go
type ResourceHandler struct {
    repo *repository.ResourceRepository
}

func NewResourceHandler(repo *repository.ResourceRepository) *ResourceHandler {
    return &ResourceHandler{repo: repo}
}

func (h *ResourceHandler) Create(c *gin.Context) {
    // 1. 绑定请求
    // 2. 验证参数
    // 3. 调用 Repository
    // 4. 返回响应
}
```

### 6. 数据访问层 (`internal/repository/`)

**功能**: 数据库操作封装

**模式**:

- 结构体包含 `*gorm.DB`
- 所有方法接收 `context.Context`
- 使用 GORM 进行数据库操作
- 返回模型或错误

**示例结构**:

```go
type ResourceRepository struct {
    db *gorm.DB
}

func NewResourceRepository(db *gorm.DB) *ResourceRepository {
    return &ResourceRepository{db: db}
}

func (r *ResourceRepository) Create(ctx context.Context, resource *models.Resource) error {
    return r.db.WithContext(ctx).Create(resource).Error
}
```

### 7. 数据模型 (`internal/models/`)

**功能**: 数据模型定义

**模式**:

- GORM 模型标签
- 请求 DTO（CreateRequest, UpdateRequest）
- 响应 DTO（Response）
- 转换方法（ToResponse）

**示例结构**:

```go
type Resource struct {
    ID        uint      `gorm:"primaryKey"`
    // ... fields
    CreatedAt time.Time
    UpdatedAt time.Time
    DeletedAt gorm.DeletedAt `gorm:"index"`
}

type CreateResourceRequest struct {
    Field string `json:"field" binding:"required"`
}

type ResourceResponse struct {
    ID   uint   `json:"id"`
    Field string `json:"field"`
}

func (r *Resource) ToResponse() *ResourceResponse {
    return &ResourceResponse{
        ID: r.ID,
        Field: r.Field,
    }
}
```

### 8. 中间件 (`internal/middleware/`)

**功能**: HTTP 请求中间件

**中间件列表**:

- `RequestID()` - 为每个请求生成唯一 ID
- `Logger(log)` - 请求日志记录
- `Recovery(log)` - Panic 恢复和错误处理
- `CORS(origins)` - 跨域资源共享

## 📦 技术栈

### 核心框架

- **Go 1.24** - 编程语言
- **Gin** - HTTP Web 框架
- **GORM** - ORM 框架
- **PostgreSQL** - 关系型数据库
- **Redis** - 缓存数据库

### 工具库

- **zap** - 结构化日志
- **env** - 环境变量解析
- **uuid** - UUID 生成
- **cors** - CORS 中间件

## 🚀 代码生成约束

### 系统文件列表

以下文件定义了项目的核心架构模式，代码生成时必须参考：

<!-- AGENT_SYSTEM_FILES_START -->

```
backend/go.mod
backend/cmd/server/main.go
backend/internal/router/router.go
backend/internal/config/config.go
backend/internal/handlers/pomodoro.go
backend/internal/models/pomodoro.go
backend/internal/repository/pomodoro.go
backend/internal/database/postgres.go
backend/internal/cache/redis.go
backend/internal/middleware/logger.go
backend/internal/middleware/recovery.go
backend/internal/middleware/requestid.go
backend/internal/middleware/cors.go
backend/internal/handlers/health.go
```

<!-- AGENT_SYSTEM_FILES_END -->

### 代码生成规则

1. **遵循分层架构**

   - Handler → Repository → Model
   - 不允许跨层调用

2. **使用依赖注入**

   - 所有依赖通过构造函数注入
   - 不使用全局变量

3. **错误处理**

   - 使用标准 Go error
   - 统一的错误响应格式
   - 所有错误都要记录日志

4. **日志记录**

   - 使用 `*zap.Logger`
   - 结构化日志字段
   - 适当的日志级别

5. **路由注册**

   - 在 `router/router.go` 中注册
   - 遵循 RESTful 规范
   - 使用路由分组

6. **数据库操作**

   - 使用 Repository 模式
   - 所有操作传递 context.Context
   - 使用 GORM 进行 ORM

7. **模型定义**

   - 使用 GORM 标签
   - 定义请求/响应 DTO
   - 实现转换方法

8. **路径约束**
   - 所有文件必须在 `backend/` 目录下
   - 遵循现有目录结构
   - 不允许在 `backend/` 目录外创建文件

## 📝 最佳实践

1. **代码组织**: 按功能模块组织，每个模块包含 handler, repository, model
2. **错误处理**: 统一的错误响应格式，包含错误信息和请求 ID
3. **日志记录**: 记录关键操作和错误，使用结构化字段
4. **类型安全**: 使用强类型，避免使用 `interface{}`
5. **上下文传递**: 所有异步操作传递 `context.Context`
6. **资源管理**: 正确关闭数据库和缓存连接

## 🔄 扩展指南

### 添加新的 API 端点

1. 在 `internal/models/` 定义模型和 DTO
2. 在 `internal/repository/` 实现数据访问
3. 在 `internal/handlers/` 实现 HTTP 处理器
4. 在 `internal/router/router.go` 注册路由

### 添加新的中间件

1. 在 `internal/middleware/` 创建中间件文件
2. 实现 `gin.HandlerFunc` 函数
3. 在 `internal/router/router.go` 中注册

### 数据库迁移

1. 在 `migrations/` 创建迁移文件
2. 使用命名规范：`NNNNNN_description.up.sql` 和 `NNNNNN_description.down.sql`
3. 使用 GORM AutoMigrate 或手动 SQL

## 📚 相关文档

- [Go 官方文档](https://go.dev/doc/)
- [Gin 框架文档](https://gin-gonic.com/docs/)
- [GORM 文档](https://gorm.io/docs/)
- [Zap 日志文档](https://pkg.go.dev/go.uber.org/zap)
