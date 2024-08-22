all:
	docker compose up --build -d

clean:
	docker compose down -v

fclean: clean
	docker system prune -f
	docker rmi	prom/node-exporter \
				prom/prometheus \
				grafana/grafana \
				prom/alertmanager \
				postgres:13

apocalypsis: fclean
	rm -Rf shared_volumes

re: fclean all