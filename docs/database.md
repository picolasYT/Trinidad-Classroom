# Base de datos

## Tablas principales

### `users`

- `username`
- `password_hash`
- `role`

### `computers`

- `computer_id`
- `computer_name`
- `ip_address`
- `status`
- `is_locked`
- `current_student_name`
- `last_seen_at`
- `last_screenshot`
- `network_rx_bytes`
- `network_tx_bytes`

### `classroom_sessions`

- `computer_id`
- `student_name`
- `started_at`
- `ended_at`
- `ended_reason`

### `app_events`

- `computer_id`
- `app_name`
- `observed_at`

### `web_events`

- `computer_id`
- `title`
- `url`
- `observed_at`

### `notices`

- `computer_id`
- `message`
- `created_by`
- `created_at`

## Roles

- `teacher`: puede ver equipos, enviar avisos, bloquear y cerrar sesion
- `admin`: todo lo anterior y gestion futura de usuarios, equipos y politicas
