all:
	docker compose up --build -d

clean:
	docker compose down

fclean:
	docker compose down -v
	docker system prune -f
	docker rmi	prom/node-exporter \
				prom/prometheus \
				grafana/grafana \
				ft_transcendence_alertmanager \
				postgres \
				ft_transcendence_django \

re: fclean all