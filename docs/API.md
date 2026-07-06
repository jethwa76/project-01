# API Documentation

Base URL:

```text
http://localhost:5000/api
```

Authorization:

```text
Authorization: Bearer <jwt>
```

## Health

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | Public | API status |

## Auth

| Method | Path | Auth | Body |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | `name`, `email`, `password` |
| POST | `/auth/login` | Public | `email`, `password` |
| POST | `/auth/logout` | Public | none |
| POST | `/auth/forgot-password` | Public | `email` |
| PATCH | `/auth/reset-password/:token` | Public | `password` |
| GET | `/auth/me` | User/Admin | none |

## Users and Profile

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| PATCH | `/users/profile` | User/Admin | Update own profile |
| PATCH | `/users/change-password` | User/Admin | Change password |
| PATCH | `/users/saved-projects/:projectId` | User/Admin | Toggle saved project |
| PATCH | `/users/favorite-projects/:projectId` | User/Admin | Toggle favorite project |
| GET | `/users` | Admin | List users |
| GET | `/users/:id` | Admin | Get user |
| PATCH | `/users/:id` | Admin | Update user |
| DELETE | `/users/:id` | Admin | Delete user |

## Projects

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/projects` | Public | List, search, filter, sort, paginate |
| POST | `/projects` | Admin | Create project |
| GET | `/projects/:id` | Public | Get project |
| PUT | `/projects/:id` | Admin | Replace project |
| PATCH | `/projects/:id` | Admin | Update project |
| DELETE | `/projects/:id` | Admin | Delete project |
| PATCH | `/projects/:id/like` | User/Admin | Toggle like |

## Blogs

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/blogs` | Public | List blogs |
| POST | `/blogs` | Admin | Create blog |
| GET | `/blogs/:id` | Public | Get blog |
| PUT | `/blogs/:id` | Admin | Replace blog |
| PATCH | `/blogs/:id` | Admin | Update blog |
| DELETE | `/blogs/:id` | Admin | Delete blog |
| POST | `/blogs/:id/comments` | User/Admin | Add comment |
| PATCH | `/blogs/:id/like` | User/Admin | Toggle like |
| PATCH | `/blogs/:id/bookmark` | User/Admin | Toggle bookmark |

## Skills, Certificates, Testimonials

Each resource supports:

```text
GET /<resource>
POST /<resource>                 Admin
GET /<resource>/:id
PUT /<resource>/:id              Admin
PATCH /<resource>/:id            Admin
DELETE /<resource>/:id           Admin
```

Resources:

```text
/skills
/certificates
/testimonials
```

## Messages

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/messages` | Public | Contact form |
| GET | `/messages` | Admin | List messages |
| GET | `/messages/:id` | Admin | Get message |
| PATCH | `/messages/:id` | Admin | Update status/assignment |
| DELETE | `/messages/:id` | Admin | Delete message |

## Notifications

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/notifications/me` | User/Admin | My notifications |
| PATCH | `/notifications/:id/read` | User/Admin | Mark read |
| GET | `/notifications` | Admin | List notifications |
| POST | `/notifications` | Admin | Create notification |
| GET | `/notifications/:id` | Admin | Get notification |
| PATCH | `/notifications/:id` | Admin | Update notification |
| DELETE | `/notifications/:id` | Admin | Delete notification |

## Admin

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/admin/overview` | Admin | Counts, recent messages, popular projects |
| POST | `/admin/upload` | Admin | Upload `image` multipart file to Cloudinary |

## Query Parameters

Supported list query parameters:

```text
?search=react
?category=SaaS
?sort=-createdAt,title
?fields=title,summary,tags
?page=1&limit=12
```
