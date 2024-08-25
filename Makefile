all:
	docker compose up --build -d

clean:
	docker compose down -v

fclean: clean
	docker system prune -f
	docker rmi	prom/node-exporter \
				prom/prometheus \
				grafana/grafana \
				ft_transcendence_alertmanager \
				postgres:13 \
				prometheuscommunity/postgres-exporter
				ft_transcendence_django \

apocalypsis: fclean
	rm -Rf shared_volumes

re: fclean all