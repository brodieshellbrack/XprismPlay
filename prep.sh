docker network create shared_backend
docker run -d --name XprismPlay-redis --network shared_backend -p 6379:6379 -v XprismPlay_redisdata:/data --restart unless-stopped redis:8-alpine redis-server --save 60 1
docker run -d --name XprismPlay-postgres --network shared_backend -e POSTGRES_USER=pguser -e POSTGRES_PASSWORD=pgpass -e POSTGRES_DB=XprismPlay -p 5432:5432 -v XprismPlay_pgdata:/var/lib/postgresql/data --restart unless-stopped pgvector/pgvector:pg16
cd website
cp .env.example .env
cd ..
