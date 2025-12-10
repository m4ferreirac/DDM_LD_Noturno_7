API Overview

- Base URL: `http://<host>:<PORT>` (default 3000)
- Auth: `Authorization: Bearer <Firebase ID Token>`

Collections (Firestore)
- `User` (id = UID)
  - userName (string, unique best‑effort)
  - name (string)
  - isManager (boolean)
  - department ("IT" | "Marketing" | "Administração")
  - experienceLevel ("Junior" | "Senior")
  - managerId (UID of manager, null if isManager)
- `TaskType`
  - name (string)
- `Task`
  - description (string)
  - state ("ToDo" | "Doing" | "Done")
  - storyPoints (number)
  - createDate (timestamp)
  - expectedStartDate (timestamp|null)
  - expectedEndDate (timestamp|null)
  - realStartDate (timestamp|null)
  - realEndDate (timestamp|null)
  - idManager (UID)
  - idProgrammers (array<UID>)
  - idTaskType (TaskType doc id)
  - orderTask (number)

Routes (singular, capitalized)
- `GET /` → `{ status: 'ok' }`
  

User (manager only unless noted)
- `POST /User` → create user
  - Body: `{ uid?, userName, name, isManager, department?, experienceLevel?, managerId? }`
- `GET /User` → list users (manager only)
- `GET /User/public/names` → list user names (any authenticated user)
  - Returns: `[{ id, name, isManager }]`
- `GET /User/:uid` → self or manager
- `PATCH /User/:uid` → update fields (userName immutable here)
- `DELETE /User/:uid`

TaskType (manager only)
- `POST /TaskType` → `{ name }`
- `GET /TaskType`
- `PATCH /TaskType/:id` → `{ name }`
- `DELETE /TaskType/:id`

Task
- `POST /Task` (manager): create task
  - Body: `{ description, storyPoints, expectedStartDate?, expectedEndDate?, idProgrammers, idTaskType, orderTask }`
  - Auto: `state='ToDo'`, `createDate=now`, `idManager` from token
- `GET /Task` → list (manager sees own; programmer can filter)
  - Query: `state`, `programmer`
- `GET /Task/kanban` → `{ ToDo, Doing, Done }`
- `GET /Task/:id` → get single task (manager sees own tasks; programmer sees assigned tasks)
- `PATCH /Task/:id` (manager) → update non-state fields
- `DELETE /Task/:id` (manager)
- `POST /Task/:id/move` (programmer)
  - Body: `{ toState: 'Doing' | 'Done' }`
  - Rules: `Done` terminal; max 2 Doing per programmer; must follow `orderTask` ascending

Stats & Export
- `GET /stats/programmer/completed`
- `GET /stats/manager/completed`
- `GET /stats/manager/pending`
- `GET /stats/manager/todo-forecast`
- `GET /export/manager/completed.csv`

Examples
- Create TaskType (manager):
  `POST /TaskType` `{ "name": "Design" }`
- Create User (programmer):
  `POST /User` `{ "uid":"P1","userName":"prog1","name":"Pedro","isManager":false,"managerId":"M1","department":"IT","experienceLevel":"Junior" }`
- Create Task (manager):
  `POST /Task` `{ "description":"Landing page","storyPoints":5,"expectedStartDate":"2025-10-23T00:00:00Z","expectedEndDate":"2025-10-30T00:00:00Z","idProgrammers":["P1"],"idTaskType":"<TaskTypeId>","orderTask":1 }`
- Move Task (programmer):
  `POST /Task/<id>/move` `{ "toState":"Doing" }`

Errors
- JSON: `{ error: string }` or `{ errors: string[] }`
