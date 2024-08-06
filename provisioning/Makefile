all:
	docker compose up --build -d

clean:
	docker compose down -v

fclean: clean
	docker system prune -f
	docker rmi	ft_transcendence_web \
				db_web \
				prom/node-exporter \
				prom/prometheus \
				grafana/grafana \
				postgres

