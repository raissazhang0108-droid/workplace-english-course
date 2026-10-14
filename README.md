# 职场英语练习室

## Docker 启动

安装并启动 Docker Desktop 后，在项目根目录运行：

```bash
docker compose up --build
```

打开 <http://localhost:8080> 使用课程。后端 API 文档可通过 <http://localhost:8080/docs> 访问。

按 `Ctrl+C` 停止服务后运行以下命令移除容器和网络：

```bash
docker compose down
```

测验记录、账号和学习进度保存在 Docker 命名卷中，停止或重建容器不会删除数据。仅在确认要删除所有数据时运行：

```bash
docker compose down --volumes
```

## 本机运行

首次运行，在项目根目录安装依赖：

```bash
/opt/homebrew/bin/python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt
npm --prefix frontend install
```

终端一：

```bash
npm run backend
```

终端二（项目根目录）：

```bash
npm run dev
```

打开 Vite 输出的本地地址。前端通过 `/api` 代理访问 FastAPI，测验记录保存在 `backend/data/quiz.sqlite3`。

## 测试

```bash
npm test
npm run backend:test
```
